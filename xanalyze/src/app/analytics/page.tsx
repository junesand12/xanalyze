"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { NetworkSelector } from "@/components/layout/NetworkSelector";
import {
  BrutalCard,
  BrutalCardHeader,
  BrutalCardTitle,
  BrutalCardContent,
} from "@/components/ui/BrutalCard";
import { BrutalButton } from "@/components/ui/BrutalButton";
import { useNodes, NETWORK_RPC_ENDPOINTS } from "@/contexts/NodesContext";
import {
  useNetworkHistory,
  useNetworkComparison,
  useHistoryStats,
  HistoryPeriod,
} from "@/lib/useHistoricalData";
import {
  NetworkHealthChart,
  ResourceUsageChart,
  StorageTrendChart,
  NetworkComparisonChart,
} from "@/components/analytics";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  Activity,
  Server,
  HardDrive,
  Globe,
  Clock,
  RefreshCw,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

const COLORS = [
  "#8B5CF6",
  "#10B981",
  "#F97316",
  "#FBBF24",
  "#EC4899",
  "#14B8A6",
];

const PERIOD_OPTIONS: { value: HistoryPeriod; label: string }[] = [
  { value: "1h", label: "1H" },
  { value: "6h", label: "6H" },
  { value: "24h", label: "24H" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
];

export default function AnalyticsPage() {
  const { nodes, currentNetwork, selectedNetwork } = useNodes();
  const [viewMode, setViewMode] = useState<"current" | "historical">("current");
  const [selectedPeriod, setSelectedPeriod] = useState<HistoryPeriod>("24h");

  // Historical data hooks
  const {
    chartData,
    isLoading: networkLoading,
    error: networkError,
    refresh: refreshNetwork,
  } = useNetworkHistory({
    network: selectedNetwork,
    period: selectedPeriod,
  });

  const {
    networks: comparisonNetworks,
    data: comparisonData,
    isLoading: comparisonLoading,
    refresh: refreshComparison,
  } = useNetworkComparison({
    period: selectedPeriod,
  });

  const {
    aggregated,
    latest,
    isLoading: statsLoading,
    refresh: refreshStats,
  } = useHistoryStats({
    period: selectedPeriod,
  });

  const isHistoricalLoading =
    networkLoading || comparisonLoading || statsLoading;

  const handleRefreshHistorical = () => {
    refreshNetwork();
    refreshComparison();
    refreshStats();
  };

  // Current data calculations
  const onlineNodes = nodes.filter((n) => n.status === "online");
  const offlineNodes = nodes.filter((n) => n.status === "offline");

  const statusData = useMemo(
    () => [
      { name: "Online", value: onlineNodes.length, color: "#10B981" },
      { name: "Offline", value: offlineNodes.length, color: "#F97316" },
    ],
    [onlineNodes.length, offlineNodes.length]
  );

  const versionData = useMemo(() => {
    const versions: Record<string, number> = {};
    onlineNodes.forEach((node) => {
      const v = node.version?.version || "Unknown";
      versions[v] = (versions[v] || 0) + 1;
    });
    return Object.entries(versions)
      .map(([name, value], i) => ({
        name: `v${name}`,
        value,
        color: COLORS[i % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [onlineNodes]);

  const regionData = useMemo(() => {
    const regions: Record<string, number> = {};
    nodes.forEach((node) => {
      const r = node.location?.country || "Unknown";
      regions[r] = (regions[r] || 0) + 1;
    });
    return Object.entries(regions)
      .map(([name, pods], i) => ({
        name,
        pods,
        color: COLORS[i % COLORS.length],
      }))
      .sort((a, b) => b.pods - a.pods)
      .slice(0, 5);
  }, [nodes]);

  const storageData = useMemo(() => {
    return onlineNodes
      .filter((n) => n.stats?.file_size)
      .sort((a, b) => (b.stats?.file_size || 0) - (a.stats?.file_size || 0))
      .slice(0, 10)
      .map((node) => ({
        name: node.label,
        address: node.pubkey || node.address,
        storage: node.stats?.file_size || 0,
        storageGB: (node.stats?.file_size || 0) / (1024 * 1024 * 1024), // Convert to GB
      }));
  }, [onlineNodes]);

  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyToClipboard = async (address: string) => {
    await navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const aggregateStats = useMemo(() => {
    const totalStorage = onlineNodes.reduce(
      (acc, n) => acc + (n.stats?.file_size || 0),
      0
    );
    const avgCpu =
      onlineNodes.length > 0
        ? onlineNodes.reduce((acc, n) => acc + (n.stats?.cpu_percent || 0), 0) /
          onlineNodes.length
        : 0;
    const avgRam =
      onlineNodes.length > 0
        ? onlineNodes.reduce((acc, n) => {
            const used = n.stats?.ram_used || 0;
            const total = n.stats?.ram_total || 1;
            return acc + (used / total) * 100;
          }, 0) / onlineNodes.length
        : 0;

    return { totalStorage, avgCpu, avgRam };
  }, [onlineNodes]);

  // Historical stats from chart data
  const historicalStats = useMemo(() => {
    if (!chartData) return { totalPods: 0, online: 0, avgCpu: 0, avgRam: 0 };
    const nodes = chartData.nodes || [];
    const resources = chartData.resources || [];
    const latestNode = nodes[nodes.length - 1];
    const totalPods = latestNode?.total || 0;
    const online = latestNode?.online || 0;
    const avgCpu =
      resources.length > 0
        ? resources.reduce((sum, r) => sum + (r.cpu || 0), 0) / resources.length
        : 0;
    const avgRam =
      resources.length > 0
        ? resources.reduce((sum, r) => sum + (r.ram || 0), 0) / resources.length
        : 0;
    return { totalPods, online, avgCpu, avgRam };
  }, [chartData]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Analytics"
          description="Network statistics and performance metrics"
          variant="yellow"
        >
          <NetworkSelector />
        </PageHeader>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <BrutalButton
              variant={viewMode === "current" ? "purple" : "default"}
              size="sm"
              onClick={() => setViewMode("current")}
            >
              <Activity className="w-4 h-4 mr-2" />
              Current
            </BrutalButton>
            <BrutalButton
              variant={viewMode === "historical" ? "purple" : "default"}
              size="sm"
              onClick={() => setViewMode("historical")}
            >
              <Clock className="w-4 h-4 mr-2" />
              Historical
            </BrutalButton>
          </div>

          {viewMode === "historical" && (
            <div className="flex items-center gap-4">
              {/* Period Selector */}
              <div className="flex border-3 border-black overflow-hidden">
                {PERIOD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedPeriod(option.value)}
                    className={`px-3 py-1.5 text-xs font-bold transition-all border-r-3 border-black last:border-r-0 ${
                      selectedPeriod === option.value
                        ? "bg-purple text-white"
                        : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <BrutalButton
                variant="green"
                size="sm"
                onClick={handleRefreshHistorical}
                disabled={isHistoricalLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${
                    isHistoricalLoading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </BrutalButton>
            </div>
          )}
        </div>

        {viewMode === "current" ? (
          <>
            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <QuickStat
                icon={Server}
                label="Total Nodes"
                value={nodes.length}
                color="purple"
              />
              <QuickStat
                icon={Activity}
                label="Online Rate"
                value={`${
                  nodes.length > 0
                    ? ((onlineNodes.length / nodes.length) * 100).toFixed(1)
                    : 0
                }%`}
                color="green"
              />
              <QuickStat
                icon={HardDrive}
                label="Total Storage"
                value={formatBytes(aggregateStats.totalStorage)}
                color="orange"
              />
              <QuickStat
                icon={Globe}
                label="Regions"
                value={regionData.length}
                color="yellow"
              />
            </div>

            {/* Charts grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <BrutalCard variant="green">
                  <BrutalCardHeader>
                    <BrutalCardTitle>Node Status</BrutalCardTitle>
                  </BrutalCardHeader>
                  <BrutalCardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            strokeWidth={3}
                            stroke="#0D0D0D"
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: "#fff",
                              border: "3px solid #0D0D0D",
                              borderRadius: "8px",
                              fontWeight: "bold",
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </BrutalCardContent>
                </BrutalCard>
              </motion.div>

              {/* Version Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <BrutalCard variant="purple">
                  <BrutalCardHeader>
                    <BrutalCardTitle>Version Distribution</BrutalCardTitle>
                  </BrutalCardHeader>
                  <BrutalCardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={versionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            strokeWidth={3}
                            stroke="#0D0D0D"
                          >
                            {versionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: "#fff",
                              border: "3px solid #0D0D0D",
                              borderRadius: "8px",
                              fontWeight: "bold",
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </BrutalCardContent>
                </BrutalCard>
              </motion.div>

              {/* Region Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <BrutalCard variant="orange">
                  <BrutalCardHeader>
                    <BrutalCardTitle>
                      Geographic Distribution (Top 5)
                    </BrutalCardTitle>
                  </BrutalCardHeader>
                  <BrutalCardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={regionData}>
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11 }}
                            interval={0}
                          />
                          <YAxis />
                          <Tooltip
                            contentStyle={{
                              background: "#fff",
                              border: "3px solid #0D0D0D",
                              borderRadius: "8px",
                              fontWeight: "bold",
                            }}
                          />
                          <Bar
                            dataKey="pods"
                            fill="#F97316"
                            stroke="#0D0D0D"
                            strokeWidth={2}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </BrutalCardContent>
                </BrutalCard>
              </motion.div>

              {/* Top Storage Nodes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <BrutalCard variant="yellow">
                  <BrutalCardHeader>
                    <BrutalCardTitle>Top Storage Nodes</BrutalCardTitle>
                  </BrutalCardHeader>
                  <BrutalCardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={storageData}>
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis
                            tickFormatter={(v) => `${Math.round(v)} GB`}
                            tick={{ fontSize: 10 }}
                            allowDecimals={false}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                const isCopied = copiedAddress === data.address;
                                return (
                                  <div
                                    className={`border-3 border-black rounded-lg p-3 shadow-brutal-sm transition-colors ${
                                      isCopied
                                        ? "bg-green text-white"
                                        : "bg-white"
                                    }`}
                                  >
                                    <p className="font-bold mb-1">
                                      {data.name}
                                    </p>
                                    <p
                                      className={`text-sm mb-1 ${
                                        isCopied
                                          ? "text-white/80"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      Storage: {formatBytes(data.storage)}
                                    </p>
                                    <p
                                      className={`text-xs font-bold ${
                                        isCopied
                                          ? "text-white"
                                          : "text-yellow-dark"
                                      }`}
                                    >
                                      {isCopied
                                        ? "✓ Address Copied!"
                                        : "Click to copy address"}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar
                            dataKey="storageGB"
                            fill="#FBBF24"
                            stroke="#0D0D0D"
                            strokeWidth={2}
                            cursor="pointer"
                            onClick={(_, index) => {
                              const node = storageData[index];
                              if (node?.address) copyToClipboard(node.address);
                            }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </BrutalCardContent>
                </BrutalCard>
              </motion.div>
            </div>
          </>
        ) : (
          <>
            {/* Historical Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <QuickStat
                icon={Server}
                label="Total Pods"
                value={networkLoading ? "..." : historicalStats.totalPods}
                color="purple"
              />
              <QuickStat
                icon={TrendingUp}
                label="Online"
                value={networkLoading ? "..." : historicalStats.online}
                color="green"
              />
              <QuickStat
                icon={Activity}
                label="Avg CPU"
                value={
                  networkLoading
                    ? "..."
                    : `${historicalStats.avgCpu.toFixed(1)}%`
                }
                color="orange"
              />
              <QuickStat
                icon={BarChart3}
                label="Avg RAM"
                value={
                  networkLoading
                    ? "..."
                    : `${historicalStats.avgRam.toFixed(1)}%`
                }
                color="yellow"
              />
            </div>

            {/* Historical Charts */}
            <div className="space-y-6">
              {/* Network Health */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <BrutalCard variant="green">
                  <BrutalCardHeader>
                    <BrutalCardTitle>Node Status Over Time</BrutalCardTitle>
                  </BrutalCardHeader>
                  <BrutalCardContent>
                    <div className="flex gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green border-2 border-black" />
                        <span className="text-sm font-bold">Online</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange border-2 border-black" />
                        <span className="text-sm font-bold">Offline</span>
                      </div>
                    </div>
                    <NetworkHealthChart
                      data={chartData?.nodes || []}
                      isLoading={networkLoading || !chartData}
                    />
                  </BrutalCardContent>
                </BrutalCard>
              </motion.div>

              {/* Resource Usage */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <BrutalCard variant="purple">
                  <BrutalCardHeader>
                    <BrutalCardTitle>Resource Utilization</BrutalCardTitle>
                  </BrutalCardHeader>
                  <BrutalCardContent>
                    <div className="flex gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple border-2 border-black" />
                        <span className="text-sm font-bold">CPU</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-cyan-500 border-2 border-black" />
                        <span className="text-sm font-bold">RAM</span>
                      </div>
                    </div>
                    <ResourceUsageChart
                      data={chartData?.resources || []}
                      isLoading={networkLoading || !chartData}
                    />
                  </BrutalCardContent>
                </BrutalCard>
              </motion.div>

              {/* Storage Trends */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <BrutalCard variant="yellow">
                  <BrutalCardHeader>
                    <BrutalCardTitle>Storage & Streams</BrutalCardTitle>
                  </BrutalCardHeader>
                  <BrutalCardContent>
                    <div className="flex gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow border-2 border-black" />
                        <span className="text-sm font-bold">Storage</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange border-2 border-black" />
                        <span className="text-sm font-bold">Streams</span>
                      </div>
                    </div>
                    <StorageTrendChart
                      data={chartData?.storage || []}
                      isLoading={networkLoading || !chartData}
                    />
                  </BrutalCardContent>
                </BrutalCard>
              </motion.div>

              {/* Network Comparison - Online Nodes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <BrutalCard variant="orange">
                  <BrutalCardHeader>
                    <BrutalCardTitle>
                      Network Comparison - Online Nodes
                    </BrutalCardTitle>
                  </BrutalCardHeader>
                  <BrutalCardContent>
                    <NetworkComparisonChart
                      networks={comparisonNetworks}
                      data={comparisonData}
                      isLoading={
                        comparisonLoading || comparisonNetworks.length === 0
                      }
                      metric="online"
                    />
                  </BrutalCardContent>
                </BrutalCard>
              </motion.div>

              {/* Network Comparison - CPU */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <BrutalCard variant="default">
                  <BrutalCardHeader>
                    <BrutalCardTitle>
                      Network Comparison - CPU Usage
                    </BrutalCardTitle>
                  </BrutalCardHeader>
                  <BrutalCardContent>
                    <NetworkComparisonChart
                      networks={comparisonNetworks}
                      data={comparisonData}
                      isLoading={
                        comparisonLoading || comparisonNetworks.length === 0
                      }
                      metric="avgCpu"
                    />
                  </BrutalCardContent>
                </BrutalCard>
              </motion.div>
            </div>

            {/* Data Notice */}
            <div className="mt-8 p-4 border-3 border-black bg-gray-100">
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold mb-1">
                    About Historical Data
                  </h4>
                  <p className="text-xs text-gray-600">
                    10 minutes periodic snapshots of network data are collected
                    for historical analysis . Data is retained for 30 days. The
                    metrics shown represent aggregated network-wide statistics
                    including node availability, resource utilization, and
                    storage capacity over time.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface QuickStatProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: "purple" | "green" | "orange" | "yellow";
}

const colorStyles = {
  purple: "bg-purple/10 border-purple text-purple",
  green: "bg-green/10 border-green text-green",
  orange: "bg-orange/10 border-orange text-orange",
  yellow: "bg-yellow/10 border-yellow text-yellow-dark",
};

function QuickStat({ icon: Icon, label, value, color }: QuickStatProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`brutal-card rounded-lg p-4 ${colorStyles[color]}`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-8 h-8" />
        <div>
          <p className="text-xs font-bold uppercase opacity-70">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}
