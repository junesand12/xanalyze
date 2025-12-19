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
import { NodeHistoryEntry } from '@/lib/useHistoricalData'

interface NodeHistoryChartProps {
  data: NodeHistoryEntry[]
  isLoading?: boolean
  chartType: 'resources' | 'storage' | 'activity'
}

export function NodeHistoryChart({ data, isLoading, chartType }: NodeHistoryChartProps) {
  const chartData = useMemo(() => {
    return data.map(d => ({
      ...d,
      time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date(d.timestamp).getTime(),
      cpu: d.cpu || 0,
      ram: d.ram || 0,
      storageGB: (d.storage || 0) / (1024 * 1024 * 1024),
      uptimeHours: (d.uptime || 0) / 3600,
      streams: d.activeStreams || 0,
      peers: d.peersCount || 0,
    }))
  }, [data])

  const ResourcesTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { timestamp: number; cpu: number; ram: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const date = new Date(data.timestamp)
      return (
        <div className="bg-white border-3 border-black p-2 shadow-brutal-sm text-sm">
          <p className="text-xs font-bold text-gray-600 mb-1">
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </p>
          <p className="font-mono font-bold text-purple">CPU: {data.cpu.toFixed(1)}%</p>
          <p className="font-mono font-bold text-cyan-500">RAM: {data.ram.toFixed(1)}%</p>
        </div>
      )
    }
    return null
  }

  const StorageTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { timestamp: number; storageGB: number; uptimeHours: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const date = new Date(data.timestamp)
      return (
        <div className="bg-white border-3 border-black p-2 shadow-brutal-sm text-sm">
          <p className="text-xs font-bold text-gray-600 mb-1">
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </p>
          <p className="font-mono font-bold text-yellow-600">Storage: {data.storageGB.toFixed(2)} GB</p>
          <p className="font-mono font-bold text-green">Uptime: {data.uptimeHours.toFixed(1)} hrs</p>
        </div>
      )
    }
    return null
  }

  const ActivityTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { timestamp: number; streams: number; peers: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const date = new Date(data.timestamp)
      return (
        <div className="bg-white border-3 border-black p-2 shadow-brutal-sm text-sm">
          <p className="text-xs font-bold text-gray-600 mb-1">
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </p>
          <p className="font-mono font-bold text-orange">Streams: {data.streams}</p>
          <p className="font-mono font-bold text-purple">Peers: {data.peers}</p>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="h-[140px] flex items-center justify-center bg-gray-50 border-2 border-black">
        <div className="animate-pulse font-bold text-xs text-gray-500">LOADING...</div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[140px] flex items-center justify-center bg-gray-50 border-2 border-black">
        <div className="text-xs text-gray-500 font-bold">NO HISTORY DATA</div>
      </div>
    )
  }

  if (chartType === 'resources') {
    return (
      <div className="h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#0D0D0D" opacity={0.1} />
            <XAxis
              dataKey="time"
              tick={{ fill: '#0D0D0D', fontSize: 9, fontWeight: 'bold' }}
              tickLine={false}
              axisLine={{ stroke: '#0D0D0D', strokeWidth: 1 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#0D0D0D', fontSize: 9, fontWeight: 'bold' }}
              tickLine={false}
              axisLine={{ stroke: '#0D0D0D', strokeWidth: 1 }}
              width={35}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<ResourcesTooltip />} />
            <Line type="monotone" dataKey="cpu" stroke="#8B5CF6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="ram" stroke="#06B6D4" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (chartType === 'storage') {
    return (
      <div className="h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#0D0D0D" opacity={0.1} />
            <XAxis
              dataKey="time"
              tick={{ fill: '#0D0D0D', fontSize: 9, fontWeight: 'bold' }}
              tickLine={false}
              axisLine={{ stroke: '#0D0D0D', strokeWidth: 1 }}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="storage"
              tick={{ fill: '#0D0D0D', fontSize: 9, fontWeight: 'bold' }}
              tickLine={false}
              axisLine={{ stroke: '#0D0D0D', strokeWidth: 1 }}
              width={35}
              tickFormatter={(v) => `${v.toFixed(0)}G`}
            />
            <YAxis
              yAxisId="uptime"
              orientation="right"
              tick={{ fill: '#0D0D0D', fontSize: 9, fontWeight: 'bold' }}
              tickLine={false}
              axisLine={{ stroke: '#0D0D0D', strokeWidth: 1 }}
              width={30}
              tickFormatter={(v) => `${v.toFixed(0)}h`}
            />
            <Tooltip content={<StorageTooltip />} />
            <Line yAxisId="storage" type="monotone" dataKey="storageGB" stroke="#FBBF24" strokeWidth={2} dot={false} />
            <Line yAxisId="uptime" type="monotone" dataKey="uptimeHours" stroke="#10B981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (chartType === 'activity') {
    return (
      <div className="h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#0D0D0D" opacity={0.1} />
            <XAxis
              dataKey="time"
              tick={{ fill: '#0D0D0D', fontSize: 9, fontWeight: 'bold' }}
              tickLine={false}
              axisLine={{ stroke: '#0D0D0D', strokeWidth: 1 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#0D0D0D', fontSize: 9, fontWeight: 'bold' }}
              tickLine={false}
              axisLine={{ stroke: '#0D0D0D', strokeWidth: 1 }}
              width={35}
              allowDecimals={false}
            />
            <Tooltip content={<ActivityTooltip />} />
            <Line type="monotone" dataKey="streams" stroke="#F97316" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="peers" stroke="#8B5CF6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return null
}
