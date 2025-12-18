'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ComparisonData } from '@/lib/useHistoricalData'

const NETWORK_COLORS: Record<string, string> = {
  devnet1: '#8B5CF6',  // Purple
  devnet2: '#06B6D4',  // Cyan
  mainnet1: '#10B981', // Green
  mainnet2: '#F97316', // Orange
}

interface NetworkComparisonChartProps {
  networks: string[]
  data: Record<string, ComparisonData[]>
  isLoading?: boolean
  metric: 'online' | 'total' | 'avgCpu'
}

export function NetworkComparisonChart({
  networks,
  data,
  isLoading,
  metric
}: NetworkComparisonChartProps) {
  const chartData = useMemo(() => {
    if (!data || networks.length === 0) return []

    // Get all unique timestamps
    const allTimes = new Set<number>()
    Object.values(data).forEach(networkData => {
      networkData.forEach(d => allTimes.add(d.time))
    })

    // Sort timestamps
    const sortedTimes = Array.from(allTimes).sort((a, b) => a - b)

    // Build chart data
    return sortedTimes.map(time => {
      const point: Record<string, number | string> = {
        time: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: time,
      }

      networks.forEach(network => {
        const networkData = data[network]?.find(d => d.time === time)
        point[network] = networkData?.[metric] || 0
      })

      return point
    })
  }, [data, networks, metric])

  const metricLabel = {
    online: 'Online Nodes',
    total: 'Total Pods',
    avgCpu: 'CPU Usage (%)',
  }[metric]

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { timestamp: number }; dataKey: string; value: number; color: string }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const date = new Date(data.timestamp as number)
      return (
        <div className="bg-white border-3 border-black p-3 shadow-brutal-sm">
          <p className="text-xs font-bold text-gray-600 mb-2">
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 border-2 border-black"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm font-bold uppercase">{entry.dataKey}</span>
                </div>
                <span className="font-mono font-bold" style={{ color: entry.color }}>
                  {metric === 'avgCpu' ? `${entry.value.toFixed(1)}%` : entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center border-3 border-black bg-gray-100">
        <div className="animate-pulse font-bold text-gray-500">LOADING COMPARISON DATA...</div>
      </div>
    )
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center border-3 border-black bg-gray-100">
        <div className="font-bold text-gray-500">NO COMPARISON DATA AVAILABLE</div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4">
        {networks.map(network => (
          <div key={network} className="flex items-center gap-2">
            <div
              className="w-4 h-4 border-2 border-black"
              style={{ backgroundColor: NETWORK_COLORS[network] || '#666' }}
            />
            <span className="text-xs font-bold uppercase">{network}</span>
          </div>
        ))}
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#0D0D0D" opacity={0.2} />
          <XAxis
            dataKey="time"
            tick={{ fill: '#0D0D0D', fontSize: 10, fontWeight: 'bold' }}
            tickLine={{ stroke: '#0D0D0D' }}
            axisLine={{ stroke: '#0D0D0D', strokeWidth: 2 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#0D0D0D', fontSize: 10, fontWeight: 'bold' }}
            tickLine={{ stroke: '#0D0D0D' }}
            axisLine={{ stroke: '#0D0D0D', strokeWidth: 2 }}
            width={40}
            tickFormatter={metric === 'avgCpu' ? (v) => `${v}%` : undefined}
          />
          <Tooltip content={<CustomTooltip />} />
          {networks.map(network => (
            <Line
              key={network}
              type="monotone"
              dataKey={network}
              stroke={NETWORK_COLORS[network] || '#666'}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, stroke: '#0D0D0D', strokeWidth: 2 }}
            />
          ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
