'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useNodes, NodeData } from '@/contexts/NodesContext'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, MapPin } from 'lucide-react'
import { BrutalButton } from '@/components/ui/BrutalButton'

interface Node2D {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  data: NodeData
  region?: string
}

interface Link2D {
  source: string
  target: string
}

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
    GB: 'Europe', DE: 'Europe', FR: 'Europe', IT: 'Europe', ES: 'Europe', NL: 'Europe', RU: 'Europe', PL: 'Europe', SE: 'Europe', NO: 'Europe', FI: 'Europe', DK: 'Europe', CH: 'Europe', AT: 'Europe', BE: 'Europe', IE: 'Europe', PT: 'Europe', CZ: 'Europe', GR: 'Europe', UA: 'Europe',
    JP: 'Asia', CN: 'Asia', KR: 'Asia', IN: 'Asia', SG: 'Asia', HK: 'Asia', TW: 'Asia', TH: 'Asia', VN: 'Asia', ID: 'Asia', MY: 'Asia', PH: 'Asia',
    AU: 'Oceania', NZ: 'Oceania',
    BR: 'South America', AR: 'South America', CL: 'South America', CO: 'South America',
    ZA: 'Africa', EG: 'Africa', NG: 'Africa', KE: 'Africa',
  }
  return regionMap[countryCode] || 'Unknown'
}

export function NetworkTopology2D() {
  const { nodes } = useNodes()
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  // Convert nodes to 2D positions using force simulation
  const [nodes2D, setNodes2D] = useState<Node2D[]>([])

  // Initialize and update nodes
  useEffect(() => {
    if (nodes.length === 0) return

    const newNodes: Node2D[] = nodes.map((node, i) => {
      // Position nodes in a circle initially, then let simulation adjust
      const angle = (i / nodes.length) * 2 * Math.PI
      const radius = Math.min(dimensions.width, dimensions.height) * 0.35
      const centerX = dimensions.width / 2
      const centerY = dimensions.height / 2

      // Group by region
      const region = getRegionFromCountry(node.location?.countryCode)
      const regionIndex = Object.keys(REGION_COLORS).indexOf(region)
      const regionAngle = (regionIndex / Object.keys(REGION_COLORS).length) * 2 * Math.PI

      // Add some randomness within region
      const randomOffset = Math.random() * 50 - 25

      return {
        id: node.address,
        x: centerX + Math.cos(angle + regionAngle * 0.3) * (radius + randomOffset),
        y: centerY + Math.sin(angle + regionAngle * 0.3) * (radius + randomOffset),
        vx: 0,
        vy: 0,
        data: node,
        region,
      }
    })

    setNodes2D(newNodes)
  }, [nodes, dimensions])

  // Simple force simulation
  useEffect(() => {
    if (nodes2D.length === 0) return

    let animationId: number
    const centerX = dimensions.width / 2
    const centerY = dimensions.height / 2

    const simulate = () => {
      setNodes2D(prevNodes => {
        const newNodes = prevNodes.map(node => ({ ...node }))

        // Apply forces
        for (let i = 0; i < newNodes.length; i++) {
          const node = newNodes[i]

          // Repulsion from other nodes
          for (let j = i + 1; j < newNodes.length; j++) {
            const other = newNodes[j]
            const dx = node.x - other.x
            const dy = node.y - other.y
            const dist = Math.sqrt(dx * dx + dy * dy) || 1
            const minDist = 60

            if (dist < minDist) {
              const force = (minDist - dist) / dist * 0.5
              node.vx += dx * force
              node.vy += dy * force
              other.vx -= dx * force
              other.vy -= dy * force
            }
          }

          // Attraction to center (weak)
          node.vx += (centerX - node.x) * 0.001
          node.vy += (centerY - node.y) * 0.001

          // Apply velocity with damping
          node.x += node.vx * 0.1
          node.y += node.vy * 0.1
          node.vx *= 0.9
          node.vy *= 0.9

          // Boundary constraints
          node.x = Math.max(30, Math.min(dimensions.width - 30, node.x))
          node.y = Math.max(30, Math.min(dimensions.height - 30, node.y))
        }

        return newNodes
      })

      animationId = requestAnimationFrame(simulate)
    }

    // Run simulation for a short time
    const startTime = Date.now()
    const runSimulation = () => {
      if (Date.now() - startTime < 2000) {
        simulate()
      }
    }

    runSimulation()

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [nodes2D.length, dimensions])

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setDimensions({ width, height })
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Generate links based on peer connections (simulated for now)
  const links = useMemo(() => {
    const result: Link2D[] = []
    const onlineNodes = nodes2D.filter(n => n.data.status === 'online')

    // Connect nodes in same region
    onlineNodes.forEach((node, i) => {
      const sameRegion = onlineNodes.filter(
        (n, j) => j !== i && n.region === node.region
      )
      // Connect to 1-2 nearby nodes in same region
      sameRegion.slice(0, 2).forEach(other => {
        if (!result.some(l =>
          (l.source === node.id && l.target === other.id) ||
          (l.source === other.id && l.target === node.id)
        )) {
          result.push({ source: node.id, target: other.id })
        }
      })
    })

    return result
  }, [nodes2D])

  // Pan and zoom handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(z => Math.max(0.5, Math.min(3, z * delta)))
  }

  const resetView = () => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }

  const getNodeColor = (node: NodeData) => {
    if (node.status === 'offline') return '#F97316'
    if (node.status === 'loading') return '#FBBF24'
    return REGION_COLORS[getRegionFromCountry(node.location?.countryCode)]
  }

  // Group nodes by region for legend
  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    nodes2D.forEach(node => {
      const region = node.region || 'Unknown'
      counts[region] = (counts[region] || 0) + 1
    })
    return counts
  }, [nodes2D])

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <BrutalButton onClick={() => setZoom(z => Math.min(3, z * 1.2))} size="sm">
          <ZoomIn className="w-4 h-4" />
        </BrutalButton>
        <BrutalButton onClick={() => setZoom(z => Math.max(0.5, z * 0.8))} size="sm">
          <ZoomOut className="w-4 h-4" />
        </BrutalButton>
        <BrutalButton onClick={resetView} size="sm">
          <RotateCcw className="w-4 h-4" />
        </BrutalButton>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-10 brutal-card rounded-lg p-3 bg-white/90 dark:bg-black/90">
        <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-600">
          Regions
        </h3>
        <div className="space-y-1">
          {Object.entries(regionCounts).map(([region, count]) => (
            <div key={region} className="flex items-center gap-2 text-xs">
              <span
                className="w-3 h-3 rounded-full border border-black"
                style={{ backgroundColor: REGION_COLORS[region] }}
              />
              <span className="font-medium">{region}</span>
              <span className="text-gray-500">({count})</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="cursor-grab active:cursor-grabbing bg-gray-50 dark:bg-gray-950"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <defs>
          {/* Glow filter for online nodes */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`}>
          {/* Grid pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-200 dark:text-gray-800"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Links */}
          {links.map((link, i) => {
            const source = nodes2D.find(n => n.id === link.source)
            const target = nodes2D.find(n => n.id === link.target)
            if (!source || !target) return null

            const isHighlighted = hoveredNode === source.id || hoveredNode === target.id

            return (
              <line
                key={`${link.source}-${link.target}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={isHighlighted ? '#8B5CF6' : '#D1D5DB'}
                strokeWidth={isHighlighted ? 2 : 1}
                strokeDasharray={isHighlighted ? 'none' : '4,4'}
                className="transition-all duration-200"
              />
            )
          })}

          {/* Nodes */}
          {nodes2D.map(node => {
            const isHovered = hoveredNode === node.id
            const isOnline = node.data.status === 'online'

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedNode(node.data)}
                className="cursor-pointer"
              >
                {/* Node circle */}
                <circle
                  r={isHovered ? 14 : 10}
                  fill={getNodeColor(node.data)}
                  stroke="#0D0D0D"
                  strokeWidth={3}
                  filter={isOnline ? 'url(#glow)' : undefined}
                  className="transition-all duration-200"
                />

                {/* Status indicator */}
                {isOnline && (
                  <circle
                    r={3}
                    cx={8}
                    cy={-8}
                    fill="#10B981"
                    stroke="#0D0D0D"
                    strokeWidth={1}
                  />
                )}

                {/* Label on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={-50}
                      y={-40}
                      width={100}
                      height={24}
                      fill="#0D0D0D"
                      rx={4}
                    />
                    <text
                      y={-24}
                      textAnchor="middle"
                      fill="white"
                      fontSize={10}
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {node.data.label}
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* Node Detail Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-4 right-4 z-10 brutal-card rounded-lg p-4 bg-white dark:bg-gray-900 w-72"
          >
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ×
            </button>
            <h3 className="font-bold text-lg mb-2">
              {selectedNode.label}
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-mono text-gray-600">{selectedNode.address}</p>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    selectedNode.status === 'online' ? 'bg-green' : 'bg-orange'
                  )}
                />
                <span className="font-medium uppercase">
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
                <p className="text-purple font-mono">
                  v{selectedNode.version.version}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats overlay */}
      <div className="absolute bottom-4 left-4 z-10 text-xs font-mono text-gray-500">
        {nodes2D.length} nodes | {links.length} connections | Zoom: {(zoom * 100).toFixed(0)}%
      </div>
    </div>
  )
}
