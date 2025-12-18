'use client'

import { NodeData, useNodes } from '@/contexts/NodesContext'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Cpu, HardDrive, Clock, Server, Copy, Check, ExternalLink } from 'lucide-react'
import { formatBytes, formatUptime, shortenAddress, cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { BrutalButton } from '@/components/ui/BrutalButton'

interface NodeDetailModalProps {
  node: NodeData | null
  onClose: () => void
}

export function NodeDetailModal({ node, onClose }: NodeDetailModalProps) {
  const { currentNetwork } = useNodes()
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getSolscanUrl = (pubkey: string) => {
    const baseUrl = 'https://solscan.io/account'
    const cluster = currentNetwork.type === 'devnet' ? '?cluster=devnet' : ''
    return `${baseUrl}/${pubkey}${cluster}`
  }

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  if (!node || !mounted) return null

  const isOnline = node.status === 'online'

  const modalContent = (
    <AnimatePresence>
      {node && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-lg px-4"
          >
            <div className="bg-white dark:bg-gray-900 border-3 border-black dark:border-white rounded-xl shadow-brutal overflow-hidden">
              {/* Header */}
              <div className={cn(
                'p-4 border-b-3 border-black dark:border-white',
                isOnline ? 'bg-green/10' : 'bg-orange/10'
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Server className="w-5 h-5" />
                      <h2 className="font-bold text-xl truncate">
                        {node.label}
                      </h2>
                      <StatusBadge status={node.status} size="sm" />
                    </div>
                    {node.version && (
                      <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                        Version {node.version.version}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Address */}
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                    Address
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg truncate">
                      {node.address}
                    </code>
                    <button
                      onClick={() => copyToClipboard(node.address, 'address')}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      {copiedField === 'address' ? (
                        <Check className="w-4 h-4 text-green" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Pubkey */}
                {node.pubkey && (
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                      Public Key
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg truncate">
                        {node.pubkey}
                      </code>
                      <button
                        onClick={() => copyToClipboard(node.pubkey!, 'pubkey')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        {copiedField === 'pubkey' ? (
                          <Check className="w-4 h-4 text-green" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Location */}
                {node.location && (
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                      Location
                    </label>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>
                        {node.location.city}, {node.location.country}
                        {node.location.countryCode && (
                          <span className="ml-2 text-lg">{getFlagEmoji(node.location.countryCode)}</span>
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Stats */}
                {isOnline && node.stats && (
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">
                      Performance
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <StatBlock
                        icon={Cpu}
                        label="CPU Usage"
                        value={`${node.stats.cpu_percent.toFixed(1)}%`}
                        color="yellow"
                      />
                      <StatBlock
                        icon={HardDrive}
                        label="Storage"
                        value={formatBytes(node.stats.file_size)}
                        color="purple"
                      />
                      <StatBlock
                        icon={Clock}
                        label="Uptime"
                        value={formatUptime(node.stats.uptime)}
                        color="green"
                      />
                    </div>
                  </div>
                )}

                {/* Error message */}
                {!isOnline && node.error && (
                  <div className="p-3 bg-orange/10 border-2 border-orange rounded-lg">
                    <p className="text-sm text-orange font-medium">{node.error}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t-3 border-black/10 dark:border-white/10 flex gap-3">
                <BrutalButton
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </BrutalButton>
                <BrutalButton
                  onClick={() => node.pubkey && window.open(getSolscanUrl(node.pubkey), '_blank')}
                  variant="purple"
                  className="flex-1"
                  disabled={!node.pubkey}
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Solscan
                </BrutalButton>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}

interface StatBlockProps {
  icon: React.ElementType
  label: string
  value: string
  color: 'yellow' | 'purple' | 'green'
}

const colorStyles = {
  yellow: 'bg-yellow/10 border-yellow text-yellow-dark',
  purple: 'bg-purple/10 border-purple text-purple',
  green: 'bg-green/10 border-green text-green',
}

function StatBlock({ icon: Icon, label, value, color }: StatBlockProps) {
  return (
    <div className={cn('p-3 rounded-lg border-2', colorStyles[color])}>
      <div className="flex items-center gap-1 mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-bold uppercase">{label}</span>
      </div>
      <p className="font-mono font-bold text-lg">{value}</p>
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
