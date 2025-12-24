const cron = require('node-cron');
const fetch = require('node-fetch');
const AbortController = require('abort-controller');
const { saveNetworkSnapshot, saveNodeHistory } = require('./mongodb');

// Telegram bot for alerts (lazy loaded to avoid circular dependency)
let telegramBot = null;
function getTelegramBot() {
  if (!telegramBot) {
    try {
      telegramBot = require('./telegramBot');
    } catch (e) {
      // Bot not available
    }
  }
  return telegramBot;
}

// Configuration from environment variables
const COLLECTOR_BATCH_SIZE = parseInt(process.env.COLLECTOR_BATCH_SIZE, 10) || 10; // Nodes to process in parallel per batch

// RPC endpoints configuration
const RPC_ENDPOINTS = {
  devnet1: 'https://rpc1.pchednode.com/rpc',
  devnet2: 'https://rpc2.pchednode.com/rpc',
  mainnet1: 'https://rpc3.pchednode.com/rpc',
  mainnet2: 'https://rpc4.pchednode.com/rpc',
};

// In-memory cache for quick access
let latestData = {
  devnet1: null,
  devnet2: null,
  mainnet1: null,
  mainnet2: null,
};

/**
 * Fetch with timeout using AbortController
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetch pods from RPC endpoint
 */
async function fetchPods(network) {
  const rpcUrl = RPC_ENDPOINTS[network];
  if (!rpcUrl) return null;

  try {
    const response = await fetchWithTimeout(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'XandeumCollector/1.0',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'get-pods',
        id: 1,
      }),
    }, 30000);

    const data = await response.json();
    return data.result || null;
  } catch (error) {
    console.error(`[Collector] Failed to fetch pods from ${network}:`, error.message);
    return null;
  }
}

/**
 * Make RPC call to a node with proper timeout
 */
async function makeRpcCall(endpoint, method, timeoutMs = 8000) {
  try {
    const response = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method, id: 1 }),
    }, timeoutMs);

    const data = await response.json();
    return data.result || null;
  } catch (error) {
    // Silent fail for individual node calls
    return null;
  }
}

/**
 * Fetch node stats from individual node
 * Note: Pods list contains gossip port (9001), but RPC is on port 6000
 */
async function fetchNodeStats(address) {
  // Address format is ip:port (e.g., "173.212.207.32:9001")
  // But RPC endpoint is always on port 6000
  const [ip] = address.split(':');
  const endpoint = `http://${ip}:6000/rpc`;

  try {
    // Fetch all data in parallel with individual timeouts
    const [versionResult, statsResult, podsResult] = await Promise.all([
      makeRpcCall(endpoint, 'get-version', 8000),
      makeRpcCall(endpoint, 'get-stats', 8000),
      makeRpcCall(endpoint, 'get-pods', 8000),
    ]);

    // Determine if node is online based on any successful response
    const isOnline = !!(versionResult || statsResult);

    if (!isOnline) {
      return { status: 'offline' };
    }

    // Extract version - can be string or object
    let version = null;
    if (versionResult) {
      version = typeof versionResult === 'string' ? versionResult : versionResult.version;
    }

    // Calculate RAM percentage
    let ramPercent = null;
    if (statsResult && statsResult.ram_total > 0) {
      ramPercent = (statsResult.ram_used / statsResult.ram_total) * 100;
    }

    return {
      status: 'online',
      version: version,
      cpu: statsResult?.cpu_percent ?? null,
      ram: ramPercent,
      ramUsed: statsResult?.ram_used ?? null,
      ramTotal: statsResult?.ram_total ?? null,
      storage: statsResult?.file_size ?? null,
      uptime: statsResult?.uptime ?? null,
      activeStreams: statsResult?.active_streams ?? null,
      packetsReceived: statsResult?.packets_received ?? null,
      packetsSent: statsResult?.packets_sent ?? null,
      currentIndex: statsResult?.current_index ?? null,
      totalPages: statsResult?.total_pages ?? null,
      peersCount: podsResult?.total_count ?? null,
    };
  } catch (error) {
    console.error(`[Collector] Error fetching ${address}:`, error.message);
    return { status: 'offline' };
  }
}

/**
 * Collect data for a single network
 */
async function collectNetworkData(network) {
  console.log(`[Collector] Collecting data for ${network}...`);

  const podsData = await fetchPods(network);
  if (!podsData || !podsData.pods) {
    console.log(`[Collector] No pods data for ${network}`);
    return null;
  }

  const pods = podsData.pods;
  const totalPods = podsData.total_count || pods.length;

  // Sort by last_seen_timestamp to get most active nodes first
  const sortedPods = [...pods].sort((a, b) => b.last_seen_timestamp - a.last_seen_timestamp);

  // Collect ALL nodes (no sampling limit)
  const allPods = sortedPods;

  console.log(`[Collector] Collecting data from ALL ${totalPods} nodes (batch size: ${COLLECTOR_BATCH_SIZE})...`);

  // Fetch stats for ALL nodes in parallel batches
  const nodeStats = [];
  for (let i = 0; i < allPods.length; i += COLLECTOR_BATCH_SIZE) {
    const batch = allPods.slice(i, i + COLLECTOR_BATCH_SIZE);
    const batchStats = await Promise.all(
      batch.map(async (pod) => {
        const stats = await fetchNodeStats(pod.address);
        return {
          address: pod.address,
          pubkey: pod.pubkey,
          network,
          registryVersion: pod.version,
          lastSeen: pod.last_seen_timestamp,
          ...stats,
        };
      })
    );
    nodeStats.push(...batchStats);

    // Log progress every batch
    const onlineCount = nodeStats.filter(n => n.status === 'online').length;
    console.log(`[Collector] Progress: ${nodeStats.length}/${totalPods} nodes, ${onlineCount} online`);
  }

  // Calculate aggregated stats
  const onlineNodes = nodeStats.filter(n => n.status === 'online');
  const offlineNodes = nodeStats.filter(n => n.status === 'offline');

  // Calculate version distribution from ALL pods (not just sampled)
  const versionDistribution = pods.reduce((acc, pod) => {
    if (pod.version) {
      acc[pod.version] = (acc[pod.version] || 0) + 1;
    }
    return acc;
  }, {});

  // Calculate actual online ratio (no estimation needed - we collected ALL nodes)
  const onlineRatio = nodeStats.length > 0 ? onlineNodes.length / nodeStats.length : 0;

  const aggregatedData = {
    totalPods,
    // Keep field names for backward compatibility (now collecting ALL nodes, so these are actual counts)
    sampledCount: nodeStats.length,
    onlineNodes: onlineNodes.length,
    offlineNodes: offlineNodes.length,
    // Now these are ACTUAL counts (not estimates) since we collect all nodes
    estimatedOnline: onlineNodes.length,
    estimatedOffline: offlineNodes.length,
    onlineRatio: Math.round(onlineRatio * 100),
    // Resource stats from online nodes
    totalStorage: onlineNodes.reduce((acc, n) => acc + (n.storage || 0), 0),
    avgCpu: onlineNodes.length > 0
      ? onlineNodes.reduce((acc, n) => acc + (n.cpu || 0), 0) / onlineNodes.length
      : 0,
    avgRam: onlineNodes.length > 0
      ? onlineNodes.reduce((acc, n) => acc + (n.ram || 0), 0) / onlineNodes.length
      : 0,
    totalStreams: onlineNodes.reduce((acc, n) => acc + (n.activeStreams || 0), 0),
    totalBytesTransferred: onlineNodes.reduce((acc, n) => acc + (n.packetsReceived || 0) + (n.packetsSent || 0), 0),
    avgUptime: onlineNodes.length > 0
      ? onlineNodes.reduce((acc, n) => acc + (n.uptime || 0), 0) / onlineNodes.length
      : 0,
    versionDistribution,
  };

  // Update in-memory cache
  latestData[network] = {
    timestamp: new Date(),
    pods: podsData,
    stats: aggregatedData,
    nodeStats,
  };

  // Save to MongoDB
  await saveNetworkSnapshot(network, aggregatedData);
  await saveNodeHistory(nodeStats.filter(n => n.status === 'online')); // Only save online nodes to history

  // Check for node status changes and send Telegram alerts
  const bot = getTelegramBot();
  if (bot && bot.checkNodeAlerts) {
    await bot.checkNodeAlerts(nodeStats);
  }

  console.log(`[Collector] ${network}: ${totalPods} total, ${onlineNodes.length} online, ${offlineNodes.length} offline (${aggregatedData.onlineRatio}% online)`);

  return aggregatedData;
}

/**
 * Collect data for all networks
 */
async function collectAllNetworks() {
  console.log('[Collector] Starting data collection cycle...');
  const startTime = Date.now();

  const results = {};
  for (const network of Object.keys(RPC_ENDPOINTS)) {
    try {
      results[network] = await collectNetworkData(network);
    } catch (error) {
      console.error(`[Collector] Error collecting ${network}:`, error.message);
      results[network] = null;
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[Collector] Collection cycle completed in ${duration}s`);

  return results;
}

/**
 * Get latest cached data
 */
function getLatestData(network) {
  if (network) {
    return latestData[network];
  }
  return latestData;
}

/**
 * Start the data collector cron job
 * @param {string} schedule - Cron schedule (default: every 5 minutes)
 */
function startCollector(schedule = '*/5 * * * *') {
  console.log(`[Collector] Starting with schedule: ${schedule}`);

  // Run immediately on startup
  setTimeout(() => {
    collectAllNetworks().catch(console.error);
  }, 5000);

  // Schedule periodic collection
  const job = cron.schedule(schedule, () => {
    collectAllNetworks().catch(console.error);
  });

  return job;
}

/**
 * Stop the collector
 */
function stopCollector(job) {
  if (job) {
    job.stop();
    console.log('[Collector] Stopped');
  }
}

module.exports = {
  startCollector,
  stopCollector,
  collectAllNetworks,
  collectNetworkData,
  getLatestData,
  fetchPods,
  fetchNodeStats,
};
