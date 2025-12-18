'use client'

import { useMemo } from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChartStorageData } from '@/lib/useHistoricalData'
import { formatBytes } from '@/lib/utils'

interface StorageTrendChartProps {
  data: ChartStorageData[]
  isLoading?: boolean
}

export function StorageTrendChart({ data, isLoading }: StorageTrendChartProps) {
  const chartData = useMemo(() => {
    return data.map(d => ({
      ...d,
      time: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: d.time,
      storageGB: d.storage / (1024 * 1024 * 1024),
    }))
  }, [data])

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { timestamp: number; storage: number; streams: number }; dataKey: string; value: number }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const date = new Date(data.timestamp)
      return (
        <div className="bg-white border-3 border-black p-3 shadow-brutal-sm">
          <p className="text-xs font-bold text-gray-600 mb-2">
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow border-2 border-black" />
                <span className="text-sm font-bold">Storage</span>
              </div>
              <span className="font-mono font-bold text-yellow-dark">{formatBytes(data.storage)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange border-2 border-black" />
                <span className="text-sm font-bold">Streams</span>
              </div>
              <span className="font-mono font-bold text-orange">{data.streams}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center border-3 border-black bg-gray-100">
        <div className="animate-pulse font-bold text-gray-500">LOADING CHART DATA...</div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center border-3 border-black bg-gray-100">
        <div className="font-bold text-gray-500">NO STORAGE DATA AVAILABLE YET</div>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#0D0D0D" opacity={0.2} />
          <XAxis
            dataKey="time"
            tick={{ fill: '#0D0D0D', fontSize: 10, fontWeight: 'bold' }}
            tickLine={{ stroke: '#0D0D0D' }}
            axisLine={{ stroke: '#0D0D0D', strokeWidth: 2 }}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="storage"
            tick={{ fill: '#0D0D0D', fontSize: 10, fontWeight: 'bold' }}
            tickLine={{ stroke: '#0D0D0D' }}
            axisLine={{ stroke: '#0D0D0D', strokeWidth: 2 }}
            width={50}
            tickFormatter={(v) => `${v.toFixed(1)} GB`}
          />
          <YAxis
            yAxisId="streams"
            orientation="right"
            tick={{ fill: '#0D0D0D', fontSize: 10, fontWeight: 'bold' }}
            tickLine={{ stroke: '#0D0D0D' }}
            axisLine={{ stroke: '#0D0D0D', strokeWidth: 2 }}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            yAxisId="storage"
            dataKey="storageGB"
            fill="#FBBF24"
            stroke="#0D0D0D"
            strokeWidth={2}
            opacity={0.8}
          />
          <Line
            yAxisId="streams"
            type="monotone"
            dataKey="streams"
            stroke="#F97316"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, stroke: '#0D0D0D', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
