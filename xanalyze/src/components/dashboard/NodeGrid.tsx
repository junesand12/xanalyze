'use client'

import { useState, useMemo } from 'react'
import { useNodes, NodeData } from '@/contexts/NodesContext'
import { NodeCard } from './NodeCard'
import { NodeDetailModal } from './NodeDetailModal'
import { BrutalButton } from '@/components/ui/BrutalButton'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Search, Filter, Grid, List, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, MapPin } from 'lucide-react'
import { cn, formatBytes, formatUptime, shortenAddress } from '@/lib/utils'

type ViewMode = 'grid' | 'table'
type StatusFilter = 'all' | 'online' | 'offline'
type SortColumn = 'label' | 'location' | 'status' | 'version' | 'cpu' | 'storage' | 'uptime'
type SortDirection = 'asc' | 'desc'

export function NodeGrid() {
  const { nodes, isLoading, refreshData, registryStatus, podCredits } = useNodes()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [versionFilter, setVersionFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null)
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Get unique versions for filter
  const versions = useMemo(() => {
    const versionSet = new Set<string>()
    nodes.forEach(node => {
      if (node.version?.version) {
        versionSet.add(node.version.version)
      }
    })
    return Array.from(versionSet).sort()
  }, [nodes])

  const filteredNodes = useMemo(() => {
    let filtered = nodes.filter(node => {
      // Status filter
      if (statusFilter !== 'all' && node.status !== statusFilter) {
        return false
      }

      // Version filter
      if (versionFilter !== 'all') {
        if (node.version?.version !== versionFilter) {
          return false
        }
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          node.address.toLowerCase().includes(query) ||
          node.label.toLowerCase().includes(query) ||
          node.pubkey?.toLowerCase().includes(query) ||
          node.location?.city.toLowerCase().includes(query) ||
          node.location?.country.toLowerCase().includes(query)
        )
      }

      return true
    })

    // Sort
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const direction = sortDirection === 'asc' ? 1 : -1
        switch (sortColumn) {
          case 'label':
            return direction * a.label.localeCompare(b.label)
          case 'location':
            const aLoc = a.location?.city || ''
            const bLoc = b.location?.city || ''
            return direction * aLoc.localeCompare(bLoc)
          case 'status':
            return direction * a.status.localeCompare(b.status)
          case 'version':
            const aVer = a.version?.version || ''
            const bVer = b.version?.version || ''
            return direction * aVer.localeCompare(bVer)
          case 'cpu':
            return direction * ((a.stats?.cpu_percent || 0) - (b.stats?.cpu_percent || 0))
          case 'storage':
            return direction * ((a.stats?.file_size || 0) - (b.stats?.file_size || 0))
          case 'uptime':
            return direction * ((a.stats?.uptime || 0) - (b.stats?.uptime || 0))
          default:
            return 0
        }
      })
    }

    return filtered
  }, [nodes, statusFilter, versionFilter, searchQuery, sortColumn, sortDirection])

  const onlineCount = nodes.filter(n => n.status === 'online').length
  const offlineCount = nodes.filter(n => n.status === 'offline').length

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3 h-3 opacity-30" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3" />
    ) : (
      <ArrowDown className="w-3 h-3" />
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Search */}
        <div className="relative w-full sm:flex-1 sm:min-w-[200px] sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-2 rounded-lg text-sm sm:text-base',
              'border-3 border-black',
              'bg-white',
              'font-medium placeholder',
              'focus:outline-none focus:ring-2 focus:ring-purple'
            )}
          />
        </div>

        {/* Status filter buttons */}
        <div className="flex border-3 border-black rounded-lg overflow-hidden w-full sm:w-auto">
          <FilterButton
            active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          >
            <span className="hidden sm:inline">All </span>({nodes.length})
          </FilterButton>
          <FilterButton
            active={statusFilter === 'online'}
            onClick={() => setStatusFilter('online')}
            className="border-l-2"
          >
            <span className="w-2 h-2 rounded-full bg-green mr-1" />
            <span className="hidden sm:inline">Online </span>({onlineCount})
          </FilterButton>
          <FilterButton
            active={statusFilter === 'offline'}
            onClick={() => setStatusFilter('offline')}
            className="border-l-2"
          >
            <span className="w-2 h-2 rounded-full bg-orange mr-1" />
            <span className="hidden sm:inline">Offline </span>({offlineCount})
          </FilterButton>
        </div>

        {/* Version filter */}
        {versions.length > 0 && (
          <select
            value={versionFilter}
            onChange={(e) => setVersionFilter(e.target.value)}
            className={cn(
              'px-2 sm:px-3 py-2 rounded-lg',
              'border-3 border-black',
              'bg-white',
              'font-bold text-xs sm:text-sm uppercase',
              'focus:outline-none focus:ring-2 focus:ring-purple',
              'flex-1 sm:flex-initial'
            )}
          >
            <option value="all">All Versions</option>
            {versions.map(v => (
              <option key={v} value={v}>v{v.length > 12 ? `${v.slice(0, 5)}…${v.slice(-7)}` : v}</option>
            ))}
          </select>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {/* View mode toggle */}
          <div className="flex border-3 border-black rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'grid'
                  ? 'bg-black text-white'
                  : 'bg-white hover:bg-gray-100'
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-2 border-l-2 transition-colors',
                viewMode === 'table'
                  ? 'bg-black text-white'
                  : 'bg-white hover:bg-gray-100'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Refresh button */}
          <BrutalButton
            onClick={() => refreshData(true)}
            disabled={isLoading}
            variant="outline"
            size="md"
            className="hidden sm:flex"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            <span className="hidden md:inline">Refresh</span>
          </BrutalButton>
          {/* Mobile refresh - icon only */}
          <button
            onClick={() => refreshData(true)}
            disabled={isLoading}
            className={cn(
              'sm:hidden p-2 border-3 border-black rounded-lg bg-white hover:bg-gray-100 transition-colors',
              isLoading && 'opacity-50'
            )}
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 font-medium">
        Showing {filteredNodes.length} of {nodes.length} nodes
        {searchQuery && ` matching "${searchQuery}"`}
      </p>

      {/* Node grid/table */}
      {registryStatus === 'loading' && nodes.length === 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="rounded-lg p-4 h-48 animate-pulse border-3 border-black"
              style={{ backgroundColor: '#E5E7EB' }}
            />
          ))}
        </div>
      ) : filteredNodes.length === 0 ? (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-600">
            No nodes found
          </h3>
          <p className="text-gray-500 mt-1">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredNodes.map((node) => (
            <div key={node.address} className="h-full">
              <NodeCard node={node} onClick={() => setSelectedNode(node)} />
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="border-3 border-black rounded-lg overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b-3 border-black" style={{ backgroundColor: '#F3F4F6' }}>
                <tr>
                  <th className="text-left p-3 font-bold uppercase text-xs">#</th>
                  <th
                    className="text-left p-3 font-bold uppercase text-xs cursor-pointer hover transition-colors"
                    onClick={() => handleSort('label')}
                  >
                    <div className="flex items-center gap-1">
                      Node <SortIcon column="label" />
                    </div>
                  </th>
                  <th
                    className="text-left p-3 font-bold uppercase text-xs cursor-pointer hover transition-colors"
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center gap-1">
                      Location <SortIcon column="location" />
                    </div>
                  </th>
                  <th
                    className="text-left p-3 font-bold uppercase text-xs cursor-pointer hover transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Status <SortIcon column="status" />
                    </div>
                  </th>
                  <th
                    className="text-left p-3 font-bold uppercase text-xs cursor-pointer hover transition-colors"
                    onClick={() => handleSort('version')}
                  >
                    <div className="flex items-center gap-1">
                      Version <SortIcon column="version" />
                    </div>
                  </th>
                  <th
                    className="text-right p-3 font-bold uppercase text-xs cursor-pointer hover transition-colors"
                    onClick={() => handleSort('cpu')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      CPU <SortIcon column="cpu" />
                    </div>
                  </th>
                  <th
                    className="text-right p-3 font-bold uppercase text-xs cursor-pointer hover transition-colors"
                    onClick={() => handleSort('storage')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Storage <SortIcon column="storage" />
                    </div>
                  </th>
                  <th
                    className="text-right p-3 font-bold uppercase text-xs cursor-pointer hover transition-colors"
                    onClick={() => handleSort('uptime')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Uptime <SortIcon column="uptime" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredNodes.map((node, index) => (
                  <tr
                    key={node.address}
                    className="hover cursor-pointer transition-colors"
                    onClick={() => setSelectedNode(node)}
                  >
                    <td className="p-3 text-gray-500 font-mono">{index + 1}</td>
                    <td className="p-3">
                      <div>
                        <span className="font-bold">{node.pubkey ? shortenAddress(node.pubkey, 6) : node.label}</span>
                        <p className="text-xs text-gray-500 font-mono">{node.address}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      {node.location ? (
                        <div className="flex items-center gap-1">
                          <span>{node.location.city}</span>
                          {node.location.countryCode && (
                            <span>{getFlagEmoji(node.location.countryCode)}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={node.status} size="sm" />
                    </td>
                    <td className="p-3 font-mono text-xs">
                      {node.version?.version ? (
                        <span title={node.version.version}>
                          v{node.version.version.length > 12
                            ? `${node.version.version.slice(0, 5)}…${node.version.version.slice(-7)}`
                            : node.version.version}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {node.stats?.cpu_percent !== undefined ? (
                        <span className={node.stats.cpu_percent > 80 ? 'text-orange' : ''}>
                          {node.stats.cpu_percent.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {node.stats?.file_size !== undefined ? (
                        formatBytes(node.stats.file_size)
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {node.stats?.uptime !== undefined ? (
                        formatUptime(node.stats.uptime)
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Node Detail Modal */}
      <NodeDetailModal
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  )
}

interface FilterButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}

function FilterButton({ active, onClick, children, className }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-1 flex-1 px-2 sm:px-3 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wide transition-colors min-h-[44px]',
        active
          ? 'bg-black text-white'
          : 'bg-white hover:bg-gray-100',
        className
      )}
    >
      {children}
    </button>
  )
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
