'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
  ZoomableGroup,
} from 'react-simple-maps'

// Simple hash function for consistent pseudo-random positioning
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

// Get grid-based position for nodes (spreads them evenly in a grid pattern)
function getGridPosition(
  index: number,
  total: number,
  centerLng: number,
  centerLat: number
): [number, number] {
  // Calculate grid dimensions
  const cols = Math.ceil(Math.sqrt(total))
  const rows = Math.ceil(total / cols)

  // Grid cell position
  const col = index % cols
  const row = Math.floor(index / cols)

  // Spread radius scales with number of nodes
  const spreadLng = Math.min(6, 2 + total * 0.2)
  const spreadLat = spreadLng * 0.6

  // Calculate position in grid
  const cellWidth = spreadLng / Math.max(1, cols - 1)
  const cellHeight = spreadLat / Math.max(1, rows - 1)

  const lng = centerLng - spreadLng / 2 + col * cellWidth
  const lat = centerLat - spreadLat / 2 + row * cellHeight

  return [lng, lat]
}
import { useNodes, NodeData } from '@/contexts/NodesContext'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, shortenAddress } from '@/lib/utils'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Globe,
  MapPin,
  ChevronLeft,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { BrutalButton } from '@/components/ui/BrutalButton'

// World TopoJSON
const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// Map common country name variations to TopoJSON names
const COUNTRY_NAME_MAP: Record<string, string> = {
  'usa': 'united states of america',
  'united states': 'united states of america',
  'us': 'united states of america',
  'uk': 'united kingdom',
  'britain': 'united kingdom',
  'great britain': 'united kingdom',
  'england': 'united kingdom',
  'russia': 'russia',
  'south korea': 'south korea',
  'korea': 'south korea',
  'north korea': 'dem. rep. korea',
  'taiwan': 'taiwan',
  'czech republic': 'czechia',
  'czechia': 'czechia',
  'vietnam': 'vietnam',
  'viet nam': 'vietnam',
  'uae': 'united arab emirates',
  'iran': 'iran',
  'syria': 'syria',
  'laos': 'laos',
  'bolivia': 'bolivia',
  'venezuela': 'venezuela',
  'tanzania': 'tanzania',
  'ivory coast': "côte d'ivoire",
  'cote d\'ivoire': "côte d'ivoire",
  'congo': 'dem. rep. congo',
  'democratic republic of congo': 'dem. rep. congo',
  'dr congo': 'dem. rep. congo',
}

// Normalize country name for matching
function normalizeCountryName(name: string): string {
  if (!name) return ''
  const lower = name.toLowerCase().trim()
  return COUNTRY_NAME_MAP[lower] || lower
}

// Country centroids for placing markers (approximate lat/lng)
const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  // North America
  US: [-95.7, 37.1],
  CA: [-106.3, 56.1],
  MX: [-102.5, 23.6],
  // Europe
  GB: [-3.4, 55.4],
  DE: [10.4, 51.2],
  FR: [2.2, 46.2],
  IT: [12.6, 41.9],
  ES: [-3.7, 40.5],
  NL: [5.3, 52.1],
  PL: [19.1, 51.9],
  SE: [18.6, 60.1],
  NO: [8.5, 60.5],
  FI: [25.7, 61.9],
  DK: [9.5, 56.3],
  CH: [8.2, 46.8],
  AT: [14.6, 47.5],
  BE: [4.5, 50.5],
  IE: [-8.2, 53.4],
  PT: [-8.2, 39.4],
  CZ: [15.5, 49.8],
  GR: [21.8, 39.1],
  UA: [31.2, 48.4],
  RU: [105.3, 61.5],
  RO: [25.0, 46.0],
  HU: [19.5, 47.2],
  SK: [19.7, 48.7],
  BG: [25.5, 42.7],
  HR: [15.2, 45.1],
  RS: [21.0, 44.0],
  SI: [14.5, 46.2],
  LT: [24.0, 55.2],
  LV: [24.6, 56.9],
  EE: [25.0, 58.6],
  // Asia
  JP: [138.3, 36.2],
  CN: [104.2, 35.9],
  KR: [127.8, 35.9],
  IN: [78.9, 20.6],
  SG: [103.8, 1.4],
  HK: [114.2, 22.3],
  TW: [121.0, 23.7],
  TH: [100.5, 15.9],
  VN: [108.3, 14.1],
  ID: [113.9, -0.8],
  MY: [101.7, 4.2],
  PH: [121.8, 12.9],
  PK: [69.3, 30.4],
  BD: [90.4, 23.7],
  MM: [96.0, 21.9],
  KH: [105.0, 12.6],
  LA: [102.5, 19.9],
  NP: [84.1, 28.4],
  LK: [80.8, 7.9],
  AE: [54.0, 23.4],
  SA: [45.1, 23.9],
  IL: [34.9, 31.0],
  TR: [35.2, 39.0],
  // Oceania
  AU: [133.8, -25.3],
  NZ: [174.9, -40.9],
  // South America
  BR: [-51.9, -14.2],
  AR: [-63.6, -38.4],
  CL: [-71.5, -35.7],
  CO: [-74.3, 4.6],
  PE: [-75.0, -9.2],
  VE: [-66.6, 6.4],
  EC: [-78.2, -1.8],
  UY: [-55.8, -32.5],
  PY: [-58.4, -23.4],
  BO: [-64.0, -16.3],
  // Africa
  ZA: [22.9, -30.6],
  EG: [30.8, 26.8],
  NG: [8.7, 9.1],
  KE: [38.0, -0.0],
  MA: [-7.1, 31.8],
  GH: [-1.0, 7.9],
  TZ: [34.9, -6.4],
  ET: [40.5, 9.1],
  // Unknown - place in Atlantic Ocean
  Unknown: [-30, 20],
}

// Region colors matching the neo-brutalist palette
const REGION_COLORS: Record<string, string> = {
  'North America': '#8B5CF6', // purple
  'Europe': '#10B981', // green
  'Asia': '#F97316', // orange
  'Oceania': '#FBBF24', // yellow
  'South America': '#EC4899', // pink
  'Africa': '#14B8A6', // teal
  'Unknown': '#6B7280', // gray
}

// Map country codes to regions
function getRegionFromCountry(countryCode?: string): string {
  if (!countryCode) return 'Unknown'
  const regionMap: Record<string, string> = {
    US: 'North America', CA: 'North America', MX: 'North America',
    GB: 'Europe', DE: 'Europe', FR: 'Europe', IT: 'Europe', ES: 'Europe', NL: 'Europe', RU: 'Europe', PL: 'Europe', SE: 'Europe', NO: 'Europe', FI: 'Europe', DK: 'Europe', CH: 'Europe', AT: 'Europe', BE: 'Europe', IE: 'Europe', PT: 'Europe', CZ: 'Europe', GR: 'Europe', UA: 'Europe', RO: 'Europe', HU: 'Europe', SK: 'Europe', BG: 'Europe', HR: 'Europe', RS: 'Europe', SI: 'Europe', LT: 'Europe', LV: 'Europe', EE: 'Europe',
    JP: 'Asia', CN: 'Asia', KR: 'Asia', IN: 'Asia', SG: 'Asia', HK: 'Asia', TW: 'Asia', TH: 'Asia', VN: 'Asia', ID: 'Asia', MY: 'Asia', PH: 'Asia', PK: 'Asia', BD: 'Asia', MM: 'Asia', KH: 'Asia', LA: 'Asia', NP: 'Asia', LK: 'Asia', AE: 'Asia', SA: 'Asia', IL: 'Asia', TR: 'Asia',
    AU: 'Oceania', NZ: 'Oceania',
    BR: 'South America', AR: 'South America', CL: 'South America', CO: 'South America', PE: 'South America', VE: 'South America', EC: 'South America', UY: 'South America', PY: 'South America', BO: 'South America',
    ZA: 'Africa', EG: 'Africa', NG: 'Africa', KE: 'Africa', MA: 'Africa', GH: 'Africa', TZ: 'Africa', ET: 'Africa',
  }
  return regionMap[countryCode] || 'Unknown'
}

// Region center coordinates for zooming
const REGION_CENTERS: Record<string, { coordinates: [number, number]; zoom: number }> = {
  'North America': { coordinates: [-100, 45], zoom: 2.5 },
  'Europe': { coordinates: [15, 50], zoom: 4 },
  'Asia': { coordinates: [100, 30], zoom: 2.2 },
  'Oceania': { coordinates: [140, -25], zoom: 3.5 },
  'South America': { coordinates: [-60, -15], zoom: 2.5 },
  'Africa': { coordinates: [20, 5], zoom: 2.5 },
}

interface CountryCluster {
  countryCode: string
  countryName: string
  region: string
  nodes: NodeData[]
  coordinates: [number, number]
  onlineCount: number
  offlineCount: number
}

type ViewMode = 'world' | 'region' | 'country'

export function WorldMapTopology() {
  const { nodes } = useNodes()
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [0, 20],
    zoom: 1,
  })
  const [viewMode, setViewMode] = useState<ViewMode>('world')
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<CountryCluster | null>(null)
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null)
  const [showConnections, setShowConnections] = useState(false) // Off by default

  // Group nodes by country
  const countryClusters = useMemo(() => {
    const clusters: Map<string, CountryCluster> = new Map()

    nodes.forEach(node => {
      const countryCode = node.location?.countryCode || 'Unknown'
      const countryName = node.location?.country || 'Unknown'

      if (!clusters.has(countryCode)) {
        const coordinates = COUNTRY_CENTROIDS[countryCode] || [0, 0]
        clusters.set(countryCode, {
          countryCode,
          countryName,
          region: getRegionFromCountry(countryCode),
          nodes: [],
          coordinates,
          onlineCount: 0,
          offlineCount: 0,
        })
      }

      const cluster = clusters.get(countryCode)!
      cluster.nodes.push(node)
      if (node.status === 'online') {
        cluster.onlineCount++
      } else {
        cluster.offlineCount++
      }
    })

    return Array.from(clusters.values()).filter(c => c.countryCode !== 'Unknown')
  }, [nodes])

  // Group clusters by region
  const regionData = useMemo(() => {
    const regions: Record<string, { clusters: CountryCluster[]; totalNodes: number; onlineNodes: number }> = {}

    countryClusters.forEach(cluster => {
      if (!regions[cluster.region]) {
        regions[cluster.region] = { clusters: [], totalNodes: 0, onlineNodes: 0 }
      }
      regions[cluster.region].clusters.push(cluster)
      regions[cluster.region].totalNodes += cluster.nodes.length
      regions[cluster.region].onlineNodes += cluster.onlineCount
    })

    return regions
  }, [countryClusters])

  // Get visible clusters based on view mode
  const visibleClusters = useMemo(() => {
    if (viewMode === 'world') {
      return countryClusters
    }
    if (viewMode === 'region' && selectedRegion) {
      return countryClusters.filter(c => c.region === selectedRegion)
    }
    return countryClusters
  }, [countryClusters, viewMode, selectedRegion])

  // Connection types matching reference project
  type ConnectionType = 'bidirectional-active' | 'bidirectional-inactive' | 'unidirectional-active' | 'unidirectional-inactive'

  // Connection style config
  const CONNECTION_STYLES: Record<ConnectionType, { color: string; dashArray: string; width: number }> = {
    'bidirectional-active': { color: '#00CCCC', dashArray: 'none', width: 2.5 },      // Cyan solid
    'bidirectional-inactive': { color: '#6699FF', dashArray: '8,4', width: 2 },       // Blue dashed
    'unidirectional-active': { color: '#FFCC00', dashArray: '4,4', width: 2 },        // Yellow dotted
    'unidirectional-inactive': { color: '#666666', dashArray: '2,4', width: 1.5 },    // Gray dotted
  }

  // Build peer connection lookup for bidirectional checks
  const peerConnections = useMemo(() => {
    const connections = new Map<string, Set<string>>()
    nodes.forEach(node => {
      if (!node.pods?.pods) return
      const sourceIp = node.address.split(':')[0]
      const peers = new Set<string>()
      node.pods.pods.forEach(pod => {
        peers.add(pod.address.split(':')[0])
      })
      connections.set(sourceIp, peers)
    })
    return connections
  }, [nodes])

  // Generate connection lines based on actual peer data
  const connectionLines = useMemo(() => {
    if (!showConnections) return []

    const lines: Array<{
      from: [number, number]
      to: [number, number]
      fromCountry: string
      toCountry: string
      type: ConnectionType
    }> = []

    const connectionSet = new Set<string>()
    const MAX_CONNECTIONS = 500

    // Get all nodes with location data
    const nodesWithLocation = nodes.filter(n =>
      n.status !== 'loading' &&
      n.location?.lat !== undefined &&
      n.location?.lng !== undefined
    )

    // Build connections based on actual peer data
    nodesWithLocation.forEach(node => {
      if (lines.length >= MAX_CONNECTIONS) return
      if (!node.pods?.pods || node.pods.pods.length === 0) return

      const sourceIp = node.address.split(':')[0]
      const sourceLat = node.location!.lat!
      const sourceLng = node.location!.lng!
      const sourceCountry = node.location?.countryCode || 'Unknown'

      node.pods.pods.forEach(pod => {
        if (lines.length >= MAX_CONNECTIONS) return

        const targetIp = pod.address.split(':')[0]
        const targetNode = nodesWithLocation.find(n => n.address.split(':')[0] === targetIp)

        if (!targetNode || targetNode.address === node.address) return
        if (!targetNode.location?.lat || !targetNode.location?.lng) return

        // Create unique connection ID to avoid duplicates
        const connectionId = [node.address, targetNode.address].sort().join('-')
        if (connectionSet.has(connectionId)) return
        connectionSet.add(connectionId)

        // Check if connection is active (last seen < 5 minutes)
        const isActive = Date.now() / 1000 - pod.last_seen_timestamp < 300

        // Check if bidirectional using pre-built lookup
        const targetPeers = peerConnections.get(targetIp)
        const isBidirectional = targetPeers?.has(sourceIp) ?? false

        // Determine connection type
        let type: ConnectionType
        if (isBidirectional) {
          type = isActive ? 'bidirectional-active' : 'bidirectional-inactive'
        } else {
          type = isActive ? 'unidirectional-active' : 'unidirectional-inactive'
        }

        lines.push({
          from: [sourceLng, sourceLat],
          to: [targetNode.location.lng!, targetNode.location.lat!],
          fromCountry: sourceCountry,
          toCountry: targetNode.location?.countryCode || 'Unknown',
          type,
        })
      })
    })

    return lines
  }, [nodes, showConnections, peerConnections])

  // Zoom presets for different views
  const zoomToRegion = useCallback((region: string) => {
    const preset = REGION_CENTERS[region] || { coordinates: [0, 20], zoom: 1 }
    setPosition(preset)
    setViewMode('region')
    setSelectedRegion(region)
    setSelectedCountry(null)
  }, [])

  const zoomToCountry = useCallback((cluster: CountryCluster) => {
    setPosition({
      coordinates: cluster.coordinates,
      zoom: 6,
    })
    setViewMode('country')
    setSelectedCountry(cluster)
  }, [])

  const resetView = useCallback(() => {
    setPosition({ coordinates: [0, 20], zoom: 1 })
    setViewMode('world')
    setSelectedRegion(null)
    setSelectedCountry(null)
    setSelectedNode(null)
  }, [])

  const goBack = useCallback(() => {
    if (viewMode === 'country' && selectedRegion) {
      zoomToRegion(selectedRegion)
    } else {
      resetView()
    }
  }, [viewMode, selectedRegion, zoomToRegion, resetView])

  return (
    <div className="relative w-full h-full" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <BrutalButton
          onClick={() => setPosition(p => ({ ...p, zoom: Math.min(10, p.zoom * 1.5) }))}
          size="sm"
        >
          <ZoomIn className="w-4 h-4" />
        </BrutalButton>
        <BrutalButton
          onClick={() => setPosition(p => ({ ...p, zoom: Math.max(1, p.zoom / 1.5) }))}
          size="sm"
        >
          <ZoomOut className="w-4 h-4" />
        </BrutalButton>
        <BrutalButton onClick={resetView} size="sm">
          <RotateCcw className="w-4 h-4" />
        </BrutalButton>
        <BrutalButton
          onClick={() => setShowConnections(s => !s)}
          size="sm"
          variant={showConnections ? 'purple' : 'outline'}
          title={showConnections ? 'Hide topology lines' : 'Show topology lines'}
        >
          <Globe className="w-4 h-4" />
        </BrutalButton>
        {/* Topology toggle label */}
        <span className="text-[10px] text-gray-500 text-center -mt-1">
          {showConnections ? 'Lines ON' : 'Lines OFF'}
        </span>
      </div>

      {/* Region Legend */}
      <div className="absolute top-4 right-4 z-10 brutal-card rounded-lg p-3" style={{ backgroundColor: '#FFFFFF' }}>
        {/* Back button when zoomed - at top of panel */}
        {viewMode !== 'world' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 pb-2 border-b border-gray-200"
          >
            <BrutalButton onClick={goBack} size="sm" variant="outline" className="w-full">
              <ChevronLeft className="w-4 h-4" />
              Back
            </BrutalButton>
          </motion.div>
        )}
        <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-600">
          {viewMode === 'world' ? 'Regions' : viewMode === 'region' ? selectedRegion : selectedCountry?.countryName}
        </h3>
        {viewMode === 'world' ? (
          <div className="space-y-1">
            {Object.entries(regionData).map(([region, data]) => (
              <button
                key={region}
                onClick={() => zoomToRegion(region)}
                className="flex items-center gap-2 text-xs w-full hover:bg-gray-100 p-1 rounded transition-colors"
              >
                <span
                  className="w-3 h-3 rounded-full border-2 border-black"
                  style={{ backgroundColor: REGION_COLORS[region] }}
                />
                <span className="font-medium flex-1 text-left">{region}</span>
                <span className="text-gray-500">({data.totalNodes})</span>
              </button>
            ))}
          </div>
        ) : viewMode === 'region' ? (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {visibleClusters.map(cluster => (
              <button
                key={cluster.countryCode}
                onClick={() => zoomToCountry(cluster)}
                className="flex items-center gap-2 text-xs w-full hover:bg-gray-100 p-1 rounded transition-colors"
              >
                <span className="text-lg">{getFlagEmoji(cluster.countryCode)}</span>
                <span className="font-medium flex-1 text-left">{cluster.countryName}</span>
                <span className="text-green">{cluster.onlineCount}</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-500">{cluster.nodes.length}</span>
              </button>
            ))}
          </div>
        ) : selectedCountry ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Wifi className="w-4 h-4 text-green" />
              <span>{selectedCountry.onlineCount} online</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <WifiOff className="w-4 h-4 text-orange" />
              <span>{selectedCountry.offlineCount} offline</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2 max-h-48 overflow-y-auto">
              {selectedCountry.nodes.map(node => (
                <button
                  key={node.address}
                  onClick={() => setSelectedNode(node)}
                  className={cn(
                    'flex items-center gap-2 text-xs w-full p-1 rounded transition-colors',
                    selectedNode?.address === node.address
                      ? 'bg-purple/20'
                      : 'hover:bg-gray-100'
                  )}
                >
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      node.status === 'online' ? 'bg-green' : 'bg-orange'
                    )}
                  />
                  <span className="font-mono truncate flex-1 text-left">
                    {node.pubkey ? shortenAddress(node.pubkey, 4) : node.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Map */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 140,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          center={position.coordinates}
          zoom={position.zoom}
          onMoveEnd={({ coordinates, zoom }) => setPosition({ coordinates, zoom })}
          minZoom={1}
          maxZoom={10}
        >
          {/* Map Geography - Clickable regions */}
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map(geo => {
                // TopoJSON uses 'name' property for country names
                const geoCountryName = geo.properties.name as string
                const normalizedGeoName = normalizeCountryName(geoCountryName)

                // Find cluster by matching normalized country name
                const cluster = countryClusters.find(c => {
                  const normalizedClusterName = normalizeCountryName(c.countryName)
                  return (
                    normalizedClusterName === normalizedGeoName ||
                    normalizedGeoName.includes(normalizedClusterName) ||
                    normalizedClusterName.includes(normalizedGeoName)
                  )
                })

                const hasNodes = !!cluster
                const region = cluster?.region || 'Unknown'
                const regionColor = hasNodes ? (REGION_COLORS[region] || '#6B7280') : '#F3F4F6'

                // Color countries that have nodes with their region color
                let fillColor = '#F3F4F6' // default gray for countries without nodes
                if (hasNodes) {
                  fillColor = regionColor // solid region color for countries with nodes
                }

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="#0D0D0D"
                    strokeWidth={0.5}
                    onClick={() => {
                      if (cluster) {
                        // If we have a cluster for this country, zoom to it
                        zoomToCountry(cluster)
                      }
                    }}
                    style={{
                      default: { outline: 'none', cursor: hasNodes ? 'pointer' : 'default' },
                      hover: {
                        fill: hasNodes ? '#D1D5DB' : '#E5E7EB',
                        outline: 'none',
                        cursor: hasNodes ? 'pointer' : 'default'
                      },
                      pressed: { fill: '#9CA3AF', outline: 'none' },
                    }}
                  />
                )
              })
            }
          </Geographies>

          {/* Connection Lines - Styled by connection type */}
          {showConnections && connectionLines.map((line, i) => {
            const style = CONNECTION_STYLES[line.type]
            return (
              <Line
                key={`${line.fromCountry}-${line.toCountry}-${i}`}
                from={line.from}
                to={line.to}
                stroke={style.color}
                strokeWidth={style.width / position.zoom}
                strokeLinecap="round"
                strokeOpacity={0.8}
                strokeDasharray={style.dashArray}
              />
            )
          })}

          {/* Connection lines between nodes in same country - using actual peer data */}
          {viewMode === 'country' && selectedCountry && (() => {
            // Get node position - use actual lat/lng if available, otherwise use grid
            const getNodePosition = (node: NodeData, index: number): [number, number] => {
              if (node.location?.lat !== undefined && node.location?.lng !== undefined) {
                return [node.location.lng, node.location.lat]
              }
              return getGridPosition(index, selectedCountry.nodes.length, selectedCountry.coordinates[0], selectedCountry.coordinates[1])
            }

            // Generate connections based on actual peer data
            const nodeConnections: Array<{ from: [number, number]; to: [number, number]; type: ConnectionType }> = []
            const connectionSet = new Set<string>()

            selectedCountry.nodes.forEach((node, nodeIdx) => {
              if (!node.pods?.pods) return

              const sourceIp = node.address.split(':')[0]

              node.pods.pods.forEach(pod => {
                const targetIp = pod.address.split(':')[0]
                const targetIdx = selectedCountry.nodes.findIndex(n => n.address.split(':')[0] === targetIp)

                if (targetIdx === -1 || targetIdx === nodeIdx) return

                // Avoid duplicate connections
                const connectionId = [node.address, selectedCountry.nodes[targetIdx].address].sort().join('-')
                if (connectionSet.has(connectionId)) return
                connectionSet.add(connectionId)

                const targetNode = selectedCountry.nodes[targetIdx]
                const isActive = Date.now() / 1000 - pod.last_seen_timestamp < 300
                const targetPeers = peerConnections.get(targetIp)
                const isBidirectional = targetPeers?.has(sourceIp) ?? false

                let type: ConnectionType
                if (isBidirectional) {
                  type = isActive ? 'bidirectional-active' : 'bidirectional-inactive'
                } else {
                  type = isActive ? 'unidirectional-active' : 'unidirectional-inactive'
                }

                nodeConnections.push({
                  from: getNodePosition(node, nodeIdx),
                  to: getNodePosition(targetNode, targetIdx),
                  type,
                })
              })
            })

            return nodeConnections.map((conn, i) => {
              const style = CONNECTION_STYLES[conn.type]
              return (
                <Line
                  key={`node-conn-${i}`}
                  from={conn.from}
                  to={conn.to}
                  stroke={style.color}
                  strokeWidth={style.width / position.zoom}
                  strokeOpacity={0.8}
                  strokeDasharray={style.dashArray}
                />
              )
            })
          })()}

          {/* Individual node markers - use actual coordinates when available */}
          {viewMode === 'country' && selectedCountry && selectedCountry.nodes.map((node, i) => {
            // Use actual lat/lng if available, otherwise fall back to grid
            const hasCoords = node.location?.lat !== undefined && node.location?.lng !== undefined
            const [lng, lat] = hasCoords
              ? [node.location!.lng!, node.location!.lat!]
              : getGridPosition(i, selectedCountry.nodes.length, selectedCountry.coordinates[0], selectedCountry.coordinates[1])

            const isSelected = selectedNode?.address === node.address
            const nodeSize = isSelected ? 12 : 8

            return (
              <Marker
                key={node.address}
                coordinates={[lng, lat]}
                onClick={() => setSelectedNode(node)}
                style={{ cursor: 'pointer' }}
              >
                {/* Glow ring for online nodes */}
                {node.status === 'online' && (
                  <circle
                    r={(nodeSize + 4) / position.zoom}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth={1 / position.zoom}
                    strokeOpacity={0.4}
                  />
                )}
                {/* Node circle */}
                <circle
                  r={nodeSize / position.zoom}
                  fill={node.status === 'online' ? '#10B981' : '#F97316'}
                  stroke="#0D0D0D"
                  strokeWidth={2 / position.zoom}
                />
              </Marker>
            )
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Node Detail Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-4 right-4 z-10 brutal-card rounded-lg p-4 w-80"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl font-bold"
            >
              ×
            </button>
            <h3 className="font-bold text-lg mb-2">
              {selectedNode.pubkey ? shortenAddress(selectedNode.pubkey, 6) : selectedNode.label}
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-mono text-gray-600 text-xs">{selectedNode.address}</p>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    selectedNode.status === 'online' ? 'bg-green' : 'bg-orange'
                  )}
                />
                <span className="font-bold uppercase">
                  {selectedNode.status}
                </span>
              </div>
              {selectedNode.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {selectedNode.location.city}, {selectedNode.location.country}
                </div>
              )}
              {selectedNode.version && (
                <p className="text-purple font-mono text-xs">
                  v{selectedNode.version.version.length > 20
                    ? `${selectedNode.version.version.slice(0, 8)}…${selectedNode.version.version.slice(-8)}`
                    : selectedNode.version.version}
                </p>
              )}
              {selectedNode.stats && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">CPU</p>
                    <p className="font-mono font-bold">{selectedNode.stats.cpu_percent.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Uptime</p>
                    <p className="font-mono font-bold">{formatUptime(selectedNode.stats.uptime)}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Legend */}
      {showConnections && (
        <div className="absolute bottom-16 left-4 z-10 text-xs brutal-card rounded p-2" style={{ backgroundColor: '#FFFFFF' }}>
          <p className="font-bold uppercase text-gray-500 mb-2">Connections</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke="#00CCCC" strokeWidth="2.5" /></svg>
              <span className="text-gray-600">Bidirectional (Active)</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke="#6699FF" strokeWidth="2" strokeDasharray="4,2" /></svg>
              <span className="text-gray-600">Bidirectional (Inactive)</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke="#FFCC00" strokeWidth="2" strokeDasharray="2,2" /></svg>
              <span className="text-gray-600">Unidirectional (Active)</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke="#666666" strokeWidth="1.5" strokeDasharray="1,2" /></svg>
              <span className="text-gray-600">Unidirectional (Inactive)</span>
            </div>
          </div>
        </div>
      )}

      {/* Stats overlay */}
      <div className="absolute bottom-4 left-4 z-10 text-xs font-mono brutal-card rounded p-2" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="flex items-center gap-3 text-gray-600">
          <span>{nodes.length} nodes</span>
          <span className="text-gray-300">|</span>
          <span className={countryClusters.length > 0 ? 'text-green' : 'text-orange'}>
            {countryClusters.length} countries
          </span>
          <span className="text-gray-300">|</span>
          <span>Zoom: {position.zoom.toFixed(1)}x</span>
        </div>
        {nodes.length > 0 && countryClusters.length === 0 && (
          <div className="mt-1 text-orange flex items-center gap-1">
            <span className="animate-pulse">●</span>
            Loading locations...
          </div>
        )}
      </div>
    </div>
  )
}

// Helper functions
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  if (days > 0) return `${days}d ${hours}h`
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}
