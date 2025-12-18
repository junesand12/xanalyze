'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChartNodeData } from '@/lib/useHistoricalData'

interface NetworkHealthChartProps {
  data: ChartNodeData[]
  isLoading?: boolean
}

export function NetworkHealthChart({ data, isLoading }: NetworkHealthChartProps) {
  const chartData = useMemo(() => {
    return data.map(d => ({
      ...d,
      offline: (d.total || 0) - (d.online || 0),
      time: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: d.time,
    }))
  }, [data])

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { timestamp: number; total: number }; dataKey: string; value: number }> }) => {
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
                <div className="w-3 h-3 bg-green border-2 border-black" />
                <span className="text-sm font-bold">Online</span>
              </div>
              <span className="font-mono font-bold text-green">{payload.find(p => p.dataKey === 'online')?.value || 0}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange border-2 border-black" />
                <span className="text-sm font-bold">Offline</span>
              </div>
              <span className="font-mono font-bold text-orange">{payload.find(p => p.dataKey === 'offline')?.value || 0}</span>
            </div>
            <div className="border-t-2 border-black mt-2 pt-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-bold">Total</span>
                <span className="font-mono font-bold text-purple">{data.total}</span>
              </div>
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
        <div className="font-bold text-gray-500">NO HISTORICAL DATA AVAILABLE YET</div>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorOnlineBrutal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorOfflineBrutal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F97316" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#F97316" stopOpacity={0.1} />
            </linearGradient>
          </defs>
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
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="online"
            stackId="1"
            stroke="#10B981"
            strokeWidth={3}
            fill="url(#colorOnlineBrutal)"
          />
          <Area
            type="monotone"
            dataKey="offline"
            stackId="1"
            stroke="#F97316"
            strokeWidth={3}
            fill="url(#colorOfflineBrutal)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
