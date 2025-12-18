'use client'

import { PageHeader } from '@/components/layout/PageHeader'
import { NetworkSelector } from '@/components/layout/NetworkSelector'
import { BrutalCard, BrutalCardHeader, BrutalCardTitle, BrutalCardContent } from '@/components/ui/BrutalCard'
import { useNodes } from '@/contexts/NodesContext'
import { motion } from 'framer-motion'
import { Activity, Zap, TrendingUp, RefreshCw, Clock, ExternalLink } from 'lucide-react'
import { formatUptime, shortenAddress } from '@/lib/utils'

export default function ActivityPage() {
  const { nodes, lastUpdate, isLoading, refreshData } = useNodes()

  // Recent activity - nodes that recently came online or updated
  const recentActivity = nodes
    .filter(n => n.lastFetched)
    .sort((a, b) => (b.lastFetched || 0) - (a.lastFetched || 0))
    .slice(0, 20)

  // Nodes with highest recent activity (packets)
  const activeNodes = nodes
    .filter(n => n.status === 'online' && n.stats)
    .sort((a, b) => (b.stats?.packets_received || 0) - (a.stats?.packets_received || 0))
    .slice(0, 10)

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Activity"
          description="Real-time network activity and recent events"
          variant="purple"
        >
          <NetworkSelector />
        </PageHeader>

        {/* Activity header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple animate-pulse" />
              <span className="font-bold">Live Activity Feed</span>
            </div>
            {lastUpdate && (
              <span className="text-sm text-gray-500">
                Updated {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
          <button
            onClick={() => refreshData(true)}
            disabled={isLoading}
            className="flex items-center gap-2 text-sm font-bold uppercase text-purple hover:text-purple-dark transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Updates */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <BrutalCard variant="purple">
              <BrutalCardHeader>
                <BrutalCardTitle>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Updates
                  </div>
                </BrutalCardTitle>
              </BrutalCardHeader>
              <BrutalCardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {recentActivity.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No recent activity</p>
                  ) : (
                    recentActivity.map((node, i) => (
                      <motion.div
                        key={node.address}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-black/10 dark:border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${
                            node.status === 'online' ? 'bg-green' : 'bg-orange'
                          }`} />
                          <div>
                            <p className="font-bold text-sm">
                              {node.pubkey ? shortenAddress(node.pubkey, 6) : node.label}
                            </p>
                            <p className="text-xs text-gray-500">
                              {node.location ? `${node.location.city}, ${node.location.country}` : node.ip}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-bold uppercase ${
                            node.status === 'online' ? 'text-green' : 'text-orange'
                          }`}>
                            {node.status}
                          </span>
                          <p className="text-xs text-gray-500">
                            {node.lastFetched && new Date(node.lastFetched).toLocaleTimeString()}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </BrutalCardContent>
            </BrutalCard>
          </motion.div>

          {/* Most Active Nodes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <BrutalCard variant="green">
              <BrutalCardHeader>
                <BrutalCardTitle>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Most Active Nodes
                  </div>
                </BrutalCardTitle>
              </BrutalCardHeader>
              <BrutalCardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {activeNodes.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No active nodes</p>
                  ) : (
                    activeNodes.map((node, i) => (
                      <motion.div
                        key={node.address}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-black/10 dark:border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 flex items-center justify-center bg-green/10 text-green font-bold text-sm rounded">
                            {i + 1}
                          </span>
                          <div>
                            <p className="font-bold text-sm">
                              {node.pubkey ? shortenAddress(node.pubkey, 6) : node.label}
                            </p>
                            <p className="text-xs text-gray-500">
                              Uptime: {formatUptime(node.stats?.uptime || 0)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-green">
                            {(node.stats?.packets_received || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">packets</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </BrutalCardContent>
            </BrutalCard>
          </motion.div>

          {/* Network Stats Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <BrutalCard variant="orange">
              <BrutalCardHeader>
                <BrutalCardTitle>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Network Summary
                  </div>
                </BrutalCardTitle>
              </BrutalCardHeader>
              <BrutalCardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SummaryCard
                    label="Total Packets"
                    value={nodes
                      .reduce((acc, n) => acc + (n.stats?.packets_received || 0), 0)
                      .toLocaleString()}
                    subtext="Received"
                  />
                  <SummaryCard
                    label="Active Streams"
                    value={nodes
                      .reduce((acc, n) => acc + (n.stats?.active_streams || 0), 0)
                      .toLocaleString()}
                    subtext="Current"
                  />
                  <SummaryCard
                    label="Total Pages"
                    value={nodes
                      .reduce((acc, n) => acc + (n.stats?.total_pages || 0), 0)
                      .toLocaleString()}
                    subtext="Stored"
                  />
                  <SummaryCard
                    label="Avg Uptime"
                    value={formatUptime(
                      nodes.filter(n => n.stats).length > 0
                        ? nodes.reduce((acc, n) => acc + (n.stats?.uptime || 0), 0) /
                          nodes.filter(n => n.stats).length
                        : 0
                    )}
                    subtext="Per node"
                  />
                </div>
              </BrutalCardContent>
            </BrutalCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

interface SummaryCardProps {
  label: string
  value: string
  subtext: string
}

function SummaryCard({ label, value, subtext }: SummaryCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-black/10 dark:border-white/10">
      <p className="text-xs font-bold uppercase text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500">{subtext}</p>
    </div>
  )
}
