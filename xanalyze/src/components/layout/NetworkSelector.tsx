'use client'

import { useNodes, NETWORK_RPC_ENDPOINTS } from '@/contexts/NodesContext'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ChevronDown, Server, Wifi } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export function NetworkSelector() {
  const { selectedNetwork, setSelectedNetwork, currentNetwork, registryStatus, isCached } = useNodes()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getNetworkColor = (type: 'devnet' | 'mainnet') => {
    return type === 'mainnet' ? 'bg-purple' : 'bg-orange'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-3 px-4 py-2 rounded-lg border-3 border-black',
          'bg-white shadow-brutal-sm',
          'font-bold uppercase tracking-wide text-sm',
          'transition-all duration-150'
        )}
      >
        <div className={cn(
          'w-2.5 h-2.5 rounded-full',
          registryStatus === 'success'
            ? getNetworkColor(currentNetwork.type)
            : registryStatus === 'loading'
            ? 'bg-yellow animate-pulse'
            : 'bg-gray-400'
        )} />
        <span>{currentNetwork.name}</span>
        {isCached && (
          <span className="text-xs text-gray-500 font-normal">(cached)</span>
        )}
        <ChevronDown className={cn(
          'w-4 h-4 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={cn(
            'absolute top-full mt-2 right-0 z-50',
            'bg-white border-3 border-black',
            'rounded-lg shadow-brutal overflow-hidden min-w-[200px]'
          )}
        >
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <Server className="w-3 h-3" />
              Devnet
            </div>
            {NETWORK_RPC_ENDPOINTS.filter(n => n.type === 'devnet').map(network => (
              <NetworkOption
                key={network.id}
                network={network}
                isSelected={selectedNetwork === network.id}
                onClick={() => {
                  setSelectedNetwork(network.id)
                  setIsOpen(false)
                }}
              />
            ))}
          </div>
          <div className="border-t-2 border-black p-2">
            <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <Wifi className="w-3 h-3" />
              Mainnet
            </div>
            {NETWORK_RPC_ENDPOINTS.filter(n => n.type === 'mainnet').map(network => (
              <NetworkOption
                key={network.id}
                network={network}
                isSelected={selectedNetwork === network.id}
                onClick={() => {
                  setSelectedNetwork(network.id)
                  setIsOpen(false)
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

interface NetworkOptionProps {
  network: { id: string; name: string; type: 'devnet' | 'mainnet' }
  isSelected: boolean
  onClick: () => void
}

function NetworkOption({ network, isSelected, onClick }: NetworkOptionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-md',
        'font-medium text-sm transition-colors',
        isSelected
          ? 'bg-black text-white'
          : 'hover:bg-gray-100'
      )}
    >
      <div className={cn(
        'w-2 h-2 rounded-full',
        network.type === 'mainnet' ? 'bg-purple' : 'bg-orange'
      )} />
      {network.name}
      {isSelected && <span className="ml-auto">✓</span>}
    </button>
  )
}
