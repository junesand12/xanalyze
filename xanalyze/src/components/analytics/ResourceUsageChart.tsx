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
import { ChartResourceData } from '@/lib/useHistoricalData'

interface ResourceUsageChartProps {
  data: ChartResourceData[]
  isLoading?: boolean
}

export function ResourceUsageChart({ data, isLoading }: ResourceUsageChartProps) {
  const chartData = useMemo(() => {
    return data.map(d => ({
      ...d,
      time: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: d.time,
      cpu: Number(d.cpu?.toFixed(1)) || 0,
      ram: Number(d.ram?.toFixed(1)) || 0,
    }))
  }, [data])

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { timestamp: number }; dataKey: string; value: number }> }) => {
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
                <div className="w-3 h-3 bg-purple border-2 border-black" />
                <span className="text-sm font-bold">CPU</span>
              </div>
              <span className="font-mono font-bold text-purple">{payload.find(p => p.dataKey === 'cpu')?.value || 0}%</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-500 border-2 border-black" />
                <span className="text-sm font-bold">RAM</span>
              </div>
              <span className="font-mono font-bold text-cyan-500">{payload.find(p => p.dataKey === 'ram')?.value || 0}%</span>
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
        <div className="font-bold text-gray-500">NO RESOURCE DATA AVAILABLE YET</div>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="cpu"
            stroke="#8B5CF6"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, stroke: '#0D0D0D', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="ram"
            stroke="#06B6D4"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, stroke: '#0D0D0D', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
