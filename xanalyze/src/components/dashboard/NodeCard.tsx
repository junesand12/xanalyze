'use client'

import { NodeData } from '@/contexts/NodesContext'
import { BrutalCard } from '@/components/ui/BrutalCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatBytes, formatUptime, shortenAddress } from '@/lib/utils'
import { motion } from 'framer-motion'
import { MapPin, Cpu, HardDrive, Clock, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NodeCardProps {
  node: NodeData
  onClick?: () => void
  className?: string
}

export function NodeCard({ node, onClick, className }: NodeCardProps) {
  const isOnline = node.status === 'online'
  const isLoading = node.status === 'loading'

  return (
    <BrutalCard
      onClick={onClick}
      className={cn(
        'cursor-pointer h-full flex flex-col',
        isLoading && 'opacity-70',
        className
      )}
    >
      {/* Header - fixed height */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg truncate">
              {node.pubkey ? shortenAddress(node.pubkey, 6) : node.label}
            </h3>
            <StatusBadge status={node.status} size="sm" showLabel={false} />
          </div>
          <p className="text-sm text-gray-500 font-mono truncate">
            {node.address}
          </p>
        </div>
        {node.version && (
          <span
            className="text-xs font-mono bg-purple/10 text-purple px-2 py-1 rounded border border-purple shrink-0"
            title={`v${node.version.version}`}
          >
            v{node.version.version.length > 12
              ? `${node.version.version.slice(0, 5)}…${node.version.version.slice(-7)}`
              : node.version.version}
          </span>
        )}
      </div>

      {/* Location - fixed height */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3 min-h-[24px]">
        {node.location ? (
          <>
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{node.location.city}, {node.location.country}</span>
            {node.location.countryCode && (
              <span className="text-lg flex-shrink-0">{getFlagEmoji(node.location.countryCode)}</span>
            )}
          </>
        ) : (
          <span className="text-gray-400">Location unknown</span>
        )}
      </div>

      {/* Stats section - fixed height with flex-grow to push to bottom */}
      <div className="mt-auto pt-3 border-t-2 border-black/10 dark:border-white/10 min-h-[72px] flex items-center">
        {isOnline && node.stats ? (
          <div className="grid grid-cols-3 gap-2 w-full">
            <StatMini
              icon={Cpu}
              label="CPU"
              value={`${node.stats.cpu_percent.toFixed(1)}%`}
              color="text-yellow"
            />
            <StatMini
              icon={HardDrive}
              label="Storage"
              value={formatBytes(node.stats.file_size)}
              color="text-purple"
            />
            <StatMini
              icon={Clock}
              label="Uptime"
              value={formatUptime(node.stats.uptime)}
              color="text-green"
            />
          </div>
        ) : !isOnline && !isLoading ? (
          <p className="text-sm text-orange font-medium">
            {node.error || 'Node is unreachable'}
          </p>
        ) : isLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-gray-300 border-t-purple rounded-full"
            />
            Fetching data...
          </div>
        ) : null}
      </div>
    </BrutalCard>
  )
}

interface StatMiniProps {
  icon: React.ElementType
  label: string
  value: string
  color: string
}

function StatMini({ icon: Icon, label, value, color }: StatMiniProps) {
  return (
    <div className="text-center">
      <div className={cn('flex items-center justify-center gap-1 mb-1', color)}>
        <Icon className="w-3 h-3" />
        <span className="text-xs font-bold uppercase">{label}</span>
      </div>
      <p className="font-mono font-bold text-sm">{value}</p>
    </div>
  )
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
