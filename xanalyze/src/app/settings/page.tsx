'use client'

import { PageHeader } from '@/components/layout/PageHeader'
import { BrutalCard, BrutalCardHeader, BrutalCardTitle, BrutalCardContent } from '@/components/ui/BrutalCard'
import { BrutalButton } from '@/components/ui/BrutalButton'
import { motion } from 'framer-motion'
import { Database, Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function SettingsPage() {
  const [cacheCleared, setCacheCleared] = useState(false)

  const clearCache = () => {
    // Clear localStorage cache
    if (typeof window !== 'undefined') {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('xnode_cache_')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))

      // Clear IndexedDB
      if (window.indexedDB) {
        indexedDB.deleteDatabase('xnode_cache')
      }

      setCacheCleared(true)
      setTimeout(() => setCacheCleared(false), 3000)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <PageHeader
          title="Settings"
          description="Configure your XAnalyze experience"
          variant="purple"
        />

        <div className="space-y-6">
          {/* Cache Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <BrutalCard>
              <BrutalCardHeader>
                <BrutalCardTitle>
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Cache Management
                  </div>
                </BrutalCardTitle>
              </BrutalCardHeader>
              <BrutalCardContent>
                <p className="text-gray-600 mb-4">
                  Clear cached data to fetch fresh information from the network.
                  This includes node data, geolocation, and registry information.
                </p>
                <div className="flex items-center gap-4">
                  <BrutalButton
                    onClick={clearCache}
                    variant="orange"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Cache
                  </BrutalButton>
                  {cacheCleared && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-green font-bold"
                    >
                      Cache cleared!
                    </motion.span>
                  )}
                </div>
              </BrutalCardContent>
            </BrutalCard>
          </motion.div>

          {/* Keyboard Shortcuts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <BrutalCard variant="green">
              <BrutalCardHeader>
                <BrutalCardTitle>
                  Keyboard Shortcuts
                </BrutalCardTitle>
              </BrutalCardHeader>
              <BrutalCardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Shortcut keys={['⌘', 'R']} description="Refresh data" />
                  <Shortcut keys={['1']} description="Dashboard" />
                  <Shortcut keys={['2']} description="Topology" />
                  <Shortcut keys={['3']} description="Leaderboard" />
                  <Shortcut keys={['4']} description="Analytics" />
                  <Shortcut keys={['5']} description="Activity" />
                </div>
              </BrutalCardContent>
            </BrutalCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

interface ShortcutProps {
  keys: string[]
  description: string
}

function Shortcut({ keys, description }: ShortcutProps) {
  return (
    <div className="flex items-center justify-between p-2 bg-green/5 rounded border-2 border-green/20">
      <span className="text-gray-700 font-medium">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <kbd
            key={i}
            className="px-2 py-1 bg-green text-white border-2 border-black rounded font-mono text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  )
}
