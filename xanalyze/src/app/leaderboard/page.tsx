'use client'

import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { NetworkSelector } from '@/components/layout/NetworkSelector'
import { BrutalCard } from '@/components/ui/BrutalCard'
import { useNodes } from '@/contexts/NodesContext'
import { motion } from 'framer-motion'
import { Trophy, Medal, Award, Star, TrendingUp, Clock, HardDrive, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatBytes, formatUptime, shortenAddress } from '@/lib/utils'
import { NETWORK_RPC_ENDPOINTS } from '@/contexts/NodesContext'

type SortField = 'credits' | 'uptime' | 'storage' | 'cpu'

export default function LeaderboardPage() {
  const { nodes, podCredits, selectedNetwork } = useNodes()
  const [sortBy, setSortBy] = useState<SortField>('credits')

  const rankedNodes = useMemo(() => {
    const onlineNodes = nodes.filter(n => n.status === 'online')

    return onlineNodes
      .map(node => ({
        ...node,
        credits: node.pubkey ? (podCredits.get(node.pubkey) || 0) : 0,
      }))
      .sort((a, b) => {
        switch (sortBy) {
          case 'credits':
            return b.credits - a.credits
          case 'uptime':
            return (b.stats?.uptime || 0) - (a.stats?.uptime || 0)
          case 'storage':
            return (b.stats?.file_size || 0) - (a.stats?.file_size || 0)
          case 'cpu':
            return (a.stats?.cpu_percent || 100) - (b.stats?.cpu_percent || 100) // Lower is better
          default:
            return 0
        }
      })
  }, [nodes, podCredits, sortBy])

  // Calculate max storage for achievements
  const maxStorage = useMemo(() => {
    return Math.max(...rankedNodes.map(n => n.stats?.file_size || 0), 1)
  }, [rankedNodes])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-orange" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold text-gray-500">{rank}</span>
    }
  }

  const getRankStyle = (rank: number): { bg?: string; border?: string } => {
    switch (rank) {
      case 1:
        return { bg: '#FEF3C7', border: 'border-l-4 border-l-yellow' }
      case 2:
        return { bg: '#E5E7EB', border: 'border-l-4 border-l-gray-400' }
      case 3:
        return { bg: '#FFEDD5', border: 'border-l-4 border-l-orange' }
      default:
        return {}
    }
  }

  // Get performance tier based on credits (passed as rank index)
  const getPerformanceTier = (rankIndex: number, totalNodes: number) => {
    const percentile = (rankIndex + 1) / totalNodes
    if (percentile <= 0.1) return { tier: 'ELITE', color: 'yellow', bg: 'bg-yellow/10' }
    if (percentile <= 0.25) return { tier: 'TOP', color: 'purple', bg: 'bg-purple/10' }
    if (percentile <= 0.5) return { tier: 'HIGH', color: 'blue', bg: 'bg-blue/10' }
    return null
  }

  // Get uptime achievement
  const getUptimeAchievement = (uptime: number) => {
    const uptimePercent = (uptime / (30 * 24 * 60 * 60)) * 100 // 30 days in seconds
    if (uptimePercent >= 99) return { text: '99%+', color: 'green', bg: 'bg-green/10' }
    if (uptimePercent >= 95) return { text: '95%+', color: 'blue', bg: 'bg-blue/10' }
    return null
  }

  // Get storage achievement
  const getStorageAchievement = (storage: number, maxStorage: number) => {
    const storagePercent = (storage / maxStorage) * 100
    if (storagePercent >= 90) return { text: 'STORAGE', color: 'orange', bg: 'bg-orange/10', icon: HardDrive }
    if (storagePercent >= 75) return { text: 'STORAGE+', color: 'orange', bg: 'bg-orange/10', icon: HardDrive }
    return null
  }

  // Get efficiency achievement
  const getEfficiencyAchievement = (cpu: number) => {
    if (cpu <= 10) return { text: 'EFFICIENT', color: 'green', bg: 'bg-green/10', icon: Cpu }
    if (cpu <= 25) return { text: 'OPTIMAL', color: 'yellow', bg: 'bg-yellow/10', icon: Cpu }
    return null
  }

  // Check if node is from current network
  const getCurrentNetworkConfig = () => {
    return NETWORK_RPC_ENDPOINTS.find(n => n.id === selectedNetwork)
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Leaderboard"
          description="Top performing nodes ranked by reputation and metrics"
          variant="orange"
        >
          <NetworkSelector />
        </PageHeader>

        {/* Sort options */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-sm font-bold uppercase text-gray-500">Sort by:</span>
          <SortButton
            active={sortBy === 'credits'}
            onClick={() => setSortBy('credits')}
            icon={Star}
            label="Credits"
          />
          <SortButton
            active={sortBy === 'uptime'}
            onClick={() => setSortBy('uptime')}
            icon={Clock}
            label="Uptime"
          />
          <SortButton
            active={sortBy === 'storage'}
            onClick={() => setSortBy('storage')}
            icon={HardDrive}
            label="Storage"
          />
          <SortButton
            active={sortBy === 'cpu'}
            onClick={() => setSortBy('cpu')}
            icon={Cpu}
            label="Efficiency"
          />
        </div>

        {/* Leaderboard */}
        <div className="space-y-3">
          {rankedNodes.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No online nodes to rank</p>
            </div>
          ) : (
            rankedNodes.map((node, index) => {
              const rank = index + 1
              return (
                <motion.div
                  key={node.address}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <BrutalCard
                    className={cn(
                      'flex items-center gap-4',
                      getRankStyle(rank).border
                    )}
                    hover={rank > 3}
                    style={getRankStyle(rank).bg ? { backgroundColor: getRankStyle(rank).bg } : undefined}
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                      {getRankIcon(rank)}
                    </div>

                    {/* Node info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg truncate">
                          {node.pubkey ? shortenAddress(node.pubkey, 8) : node.label}
                        </h3>
                        {node.location?.countryCode && (
                          <img
                            src={`https://flagcdn.com/w20/${node.location.countryCode.toLowerCase()}.png`}
                            alt={node.location.country}
                            className="w-5 h-3 rounded-sm shadow-sm"
                            title={node.location.country}
                          />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 font-mono truncate">
                        {node.location ? `${node.location.city}, ${node.location.country}` : node.address}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">Credits</p>
                        <p className="font-mono font-bold text-purple">{node.credits.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">Uptime</p>
                        <p className="font-mono font-bold text-green">{formatUptime(node.stats?.uptime || 0)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">Storage</p>
                        <p className="font-mono font-bold text-orange">{formatBytes(node.stats?.file_size || 0)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">CPU</p>
                        <p className="font-mono font-bold text-yellow">{(node.stats?.cpu_percent || 0).toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* Version and flags section */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Network type badge */}
                      {getCurrentNetworkConfig() && (
                        <span className={cn(
                          'text-xs font-mono px-2 py-1 rounded border uppercase',
                          getCurrentNetworkConfig()?.type === 'mainnet'
                            ? 'bg-red/10 text-red border-red'
                            : 'bg-blue/10 text-blue border-blue'
                        )}>
                          {getCurrentNetworkConfig()?.type === 'mainnet' ? 'MAINNET' : 'DEVNET'}
                        </span>
                      )}

                      {/* Performance tier badge */}
                      {(() => {
                        const tier = getPerformanceTier(index, rankedNodes.length)
                        return tier && (
                          <span className={cn(
                            'text-xs font-mono px-2 py-1 rounded border uppercase',
                            tier.bg,
                            `text-${tier.color} border-${tier.color}`
                          )}>
                            {tier.tier}
                          </span>
                        )
                      })()}

                      {/* Uptime achievement badge */}
                      {(() => {
                        const achievement = getUptimeAchievement(node.stats?.uptime || 0)
                        return achievement && (
                          <span className={cn(
                            'text-xs font-mono px-2 py-1 rounded border',
                            achievement.bg,
                            `text-${achievement.color} border-${achievement.color}`
                          )}>
                            <Clock className="inline w-3 h-3 mr-1" />
                            {achievement.text}
                          </span>
                        )
                      })()}

                      {/* Storage achievement badge */}
                      {(() => {
                        const achievement = getStorageAchievement(node.stats?.file_size || 0, maxStorage)
                        return achievement && (
                          <span className={cn(
                            'text-xs font-mono px-2 py-1 rounded border flex items-center gap-1',
                            achievement.bg,
                            `text-${achievement.color} border-${achievement.color}`
                          )}>
                            <achievement.icon className="w-3 h-3" />
                            {achievement.text}
                          </span>
                        )
                      })()}

                      {/* Efficiency achievement badge */}
                      {(() => {
                        const achievement = getEfficiencyAchievement(node.stats?.cpu_percent || 0)
                        return achievement && (
                          <span className={cn(
                            'text-xs font-mono px-2 py-1 rounded border flex items-center gap-1',
                            achievement.bg,
                            `text-${achievement.color} border-${achievement.color}`
                          )}>
                            <achievement.icon className="w-3 h-3" />
                            {achievement.text}
                          </span>
                        )
                      })()}

                      {/* Version badge */}
                      {node.version && (
                        <span className="text-xs font-mono bg-purple/10 text-purple px-2 py-1 rounded border border-purple">
                          v{node.version.version}
                        </span>
                      )}
                    </div>
                  </BrutalCard>
                </motion.div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

interface SortButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ElementType
  label: string
}

function SortButton({ active, onClick, icon: Icon, label }: SortButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border-2 font-bold text-sm uppercase transition-all',
        active
          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-brutal-sm'
          : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}
