'use client'

import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { NetworkSelector } from '@/components/layout/NetworkSelector'
import { BrutalCard, BrutalCardHeader, BrutalCardTitle, BrutalCardContent } from '@/components/ui/BrutalCard'
import { useNodes } from '@/contexts/NodesContext'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { Activity, Server, HardDrive, Globe, Copy, Check } from 'lucide-react'
import { formatBytes, shortenAddress } from '@/lib/utils'

const COLORS = ['#8B5CF6', '#10B981', '#F97316', '#FBBF24', '#EC4899', '#14B8A6']

export default function AnalyticsPage() {
  const { nodes, currentNetwork } = useNodes()

  const onlineNodes = nodes.filter(n => n.status === 'online')
  const offlineNodes = nodes.filter(n => n.status === 'offline')

  // Status distribution
  const statusData = useMemo(() => [
    { name: 'Online', value: onlineNodes.length, color: '#10B981' },
    { name: 'Offline', value: offlineNodes.length, color: '#F97316' },
  ], [onlineNodes.length, offlineNodes.length])

  // Version distribution
  const versionData = useMemo(() => {
    const versions: Record<string, number> = {}
    onlineNodes.forEach(node => {
      const v = node.version?.version || 'Unknown'
      versions[v] = (versions[v] || 0) + 1
    })
    return Object.entries(versions)
      .map(([name, value], i) => ({ name: `v${name}`, value, color: COLORS[i % COLORS.length] }))
      .sort((a, b) => b.value - a.value)
  }, [onlineNodes])

  // Region distribution (by country) - top 5
  const regionData = useMemo(() => {
    const regions: Record<string, number> = {}
    nodes.forEach(node => {
      const r = node.location?.country || 'Unknown'
      regions[r] = (regions[r] || 0) + 1
    })
    return Object.entries(regions)
      .map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [nodes])

  // Storage distribution (top 10 nodes)
  const storageData = useMemo(() => {
    return onlineNodes
      .filter(n => n.stats?.file_size)
      .sort((a, b) => (b.stats?.file_size || 0) - (a.stats?.file_size || 0))
      .slice(0, 10)
      .map(node => ({
        name: node.label,
        address: node.pubkey || node.address,
        storage: node.stats?.file_size || 0,
      }))
  }, [onlineNodes])

  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const copyToClipboard = async (address: string) => {
    await navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  // Aggregate stats
  const aggregateStats = useMemo(() => {
    const totalStorage = onlineNodes.reduce((acc, n) => acc + (n.stats?.file_size || 0), 0)
    const avgCpu = onlineNodes.length > 0
      ? onlineNodes.reduce((acc, n) => acc + (n.stats?.cpu_percent || 0), 0) / onlineNodes.length
      : 0
    const avgRam = onlineNodes.length > 0
      ? onlineNodes.reduce((acc, n) => {
          const used = n.stats?.ram_used || 0
          const total = n.stats?.ram_total || 1
          return acc + (used / total) * 100
        }, 0) / onlineNodes.length
      : 0

    return { totalStorage, avgCpu, avgRam }
  }, [onlineNodes])

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
            value={`${nodes.length > 0 ? ((onlineNodes.length / nodes.length) * 100).toFixed(1) : 0}%`}
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
                          background: '#fff',
                          border: '3px solid #0D0D0D',
                          borderRadius: '8px',
                          fontWeight: 'bold',
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
                          background: '#fff',
                          border: '3px solid #0D0D0D',
                          borderRadius: '8px',
                          fontWeight: 'bold',
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
                <BrutalCardTitle>Geographic Distribution (Top 5)</BrutalCardTitle>
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
                          background: '#fff',
                          border: '3px solid #0D0D0D',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                        }}
                      />
                      <Bar dataKey="value" fill="#F97316" stroke="#0D0D0D" strokeWidth={2} />
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
                      <YAxis tickFormatter={(v) => formatBytes(v)} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            const isCopied = copiedAddress === data.address
                            return (
                              <div className={`border-3 border-black rounded-lg p-3 shadow-brutal-sm transition-colors ${isCopied ? 'bg-green text-white' : 'bg-white'}`}>
                                <p className="font-bold mb-1">{data.name}</p>
                                <p className={`text-sm mb-1 ${isCopied ? 'text-white/80' : 'text-gray-600'}`}>
                                  Storage: {formatBytes(data.storage)}
                                </p>
                                <p className={`text-xs font-bold ${isCopied ? 'text-white' : 'text-yellow-dark'}`}>
                                  {isCopied ? '✓ Address Copied!' : 'Click to copy address'}
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar
                        dataKey="storage"
                        fill="#FBBF24"
                        stroke="#0D0D0D"
                        strokeWidth={2}
                        cursor="pointer"
                        onClick={(_, index) => {
                          const node = storageData[index]
                          if (node?.address) copyToClipboard(node.address)
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </BrutalCardContent>
            </BrutalCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

interface QuickStatProps {
  icon: React.ElementType
  label: string
  value: string | number
  color: 'purple' | 'green' | 'orange' | 'yellow'
}

const colorStyles = {
  purple: 'bg-purple/10 border-purple text-purple',
  green: 'bg-green/10 border-green text-green',
  orange: 'bg-orange/10 border-orange text-orange',
  yellow: 'bg-yellow/10 border-yellow text-yellow-dark',
}

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
  )
}
