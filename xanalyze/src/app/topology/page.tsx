'use client'

import { PageHeader } from '@/components/layout/PageHeader'
import { NetworkSelector } from '@/components/layout/NetworkSelector'
import { WorldMapTopology } from '@/components/topology/WorldMapTopology'
import { useNodes } from '@/contexts/NodesContext'
import { motion } from 'framer-motion'
import { Network, AlertCircle } from 'lucide-react'

export default function TopologyPage() {
  const { nodes, registryStatus, registryError } = useNodes()
  const onlineCount = nodes.filter(n => n.status === 'online').length

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <PageHeader
          title="Topology"
          description="Interactive 2D visualization of network node connections"
          variant="green"
        >
          <NetworkSelector />
        </PageHeader>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-green" />
              <span className="font-bold">{onlineCount}</span>
              <span className="text-gray-500 text-xs sm:text-sm">online nodes</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-2">
              <span className="font-bold">{nodes.length - onlineCount}</span>
              <span className="text-gray-500 text-xs sm:text-sm">offline</span>
            </div>
          </div>
          <span className="text-xs text-gray-500 hidden md:block">
            <strong>Tip:</strong> Pinch to zoom, drag to pan, tap nodes for details.
          </span>
        </motion.div>

        {/* Topology visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="brutal-card rounded-lg overflow-hidden h-[calc(100vh-240px)] sm:h-[calc(100vh-280px)] min-h-[400px] sm:min-h-[500px]"
        >
          {registryStatus === 'error' ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <AlertCircle className="w-16 h-16 text-orange mb-4" />
              <h3 className="text-xl font-bold mb-2">Connection Error</h3>
              <p className="text-gray-600 max-w-md">
                {registryError || 'Unable to fetch network data. Please try again.'}
              </p>
            </div>
          ) : nodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-gray-200 border-t-green rounded-full mb-4"
              />
              <p className="text-gray-600 font-medium">Loading network topology...</p>
            </div>
          ) : (
            <WorldMapTopology />
          )}
        </motion.div>
      </div>
    </div>
  )
}
