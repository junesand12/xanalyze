'use client'

import { useNodes } from '@/contexts/NodesContext'
import { StatCard } from '@/components/ui/StatCard'
import { formatBytes } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  Server,
  ServerOff,
  HardDrive,
  Cpu,
  MemoryStick,
  Clock
} from 'lucide-react'

export function NetworkStats() {
  const { nodes, registryStatus, isLoading } = useNodes()

  const onlineNodes = nodes.filter(n => n.status === 'online')
  const offlineNodes = nodes.filter(n => n.status === 'offline')

  // Calculate aggregate stats
  const totalStorage = onlineNodes.reduce((acc, node) => {
    return acc + (node.stats?.file_size || 0)
  }, 0)

  const avgCpu = onlineNodes.length > 0
    ? onlineNodes.reduce((acc, node) => acc + (node.stats?.cpu_percent || 0), 0) / onlineNodes.length
    : 0

  const avgRam = onlineNodes.length > 0
    ? onlineNodes.reduce((acc, node) => {
        const used = node.stats?.ram_used || 0
        const total = node.stats?.ram_total || 1
        return acc + (used / total) * 100
      }, 0) / onlineNodes.length
    : 0

  const totalUptime = onlineNodes.reduce((acc, node) => {
    return acc + (node.stats?.uptime || 0)
  }, 0)

  const avgUptime = onlineNodes.length > 0 ? totalUptime / onlineNodes.length : 0
  const uptimeDays = Math.floor(avgUptime / 86400)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  if (registryStatus === 'loading' && nodes.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="brutal-card rounded-lg p-4 h-32 animate-pulse bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
    >
      <motion.div variants={item}>
        <StatCard
          title="Online Nodes"
          value={onlineNodes.length}
          subtitle={`of ${nodes.length} total`}
          icon={Server}
          variant="green"
        />
      </motion.div>

      <motion.div variants={item}>
        <StatCard
          title="Offline Nodes"
          value={offlineNodes.length}
          subtitle={isLoading ? 'Checking...' : 'Unreachable'}
          icon={ServerOff}
          variant="orange"
        />
      </motion.div>

      <motion.div variants={item}>
        <StatCard
          title="Total Storage"
          value={formatBytes(totalStorage)}
          subtitle="Network capacity"
          icon={HardDrive}
          variant="purple"
        />
      </motion.div>

      <motion.div variants={item}>
        <StatCard
          title="Avg CPU"
          value={`${avgCpu.toFixed(1)}%`}
          subtitle="Utilization"
          icon={Cpu}
          variant="yellow"
        />
      </motion.div>

      <motion.div variants={item}>
        <StatCard
          title="Avg RAM"
          value={`${avgRam.toFixed(1)}%`}
          subtitle="Memory usage"
          icon={MemoryStick}
          variant="purple"
        />
      </motion.div>

      <motion.div variants={item}>
        <StatCard
          title="Avg Uptime"
          value={`${uptimeDays}d`}
          subtitle="Per node"
          icon={Clock}
          variant="green"
        />
      </motion.div>
    </motion.div>
  )
}
