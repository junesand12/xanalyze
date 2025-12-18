'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'purple' | 'green' | 'orange' | 'yellow'
  className?: string
}

const variantStyles = {
  purple: {
    bg: 'bg-purple/10',
    icon: 'bg-purple text-white',
    border: 'border-purple',
  },
  green: {
    bg: 'bg-green/10',
    icon: 'bg-green text-white',
    border: 'border-green',
  },
  orange: {
    bg: 'bg-orange/10',
    icon: 'bg-orange text-white',
    border: 'border-orange',
  },
  yellow: {
    bg: 'bg-yellow/10',
    icon: 'bg-yellow text-black',
    border: 'border-yellow',
  },
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'purple',
  className,
}: StatCardProps) {
  const styles = variantStyles[variant]

  return (
    <motion.div
      whileHover={{ x: -2, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'brutal-card rounded-lg p-4',
        styles.bg,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-bold tracking-tight"
          >
            {value}
          </motion.p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-sm font-bold',
              trend.isPositive ? 'text-green' : 'text-orange'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn(
            'p-3 rounded-lg border-2 border-black dark:border-white',
            styles.icon
          )}>
            <Icon className="w-6 h-6" strokeWidth={2.5} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
