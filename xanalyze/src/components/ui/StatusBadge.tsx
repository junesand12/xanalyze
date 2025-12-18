'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'loading' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const statusConfig = {
  online: {
    label: 'Online',
    dotClass: 'bg-green animate-pulse-glow',
    bgClass: 'bg-green/10 border-green',
    textClass: 'text-green-dark',
  },
  offline: {
    label: 'Offline',
    dotClass: 'bg-orange',
    bgClass: 'bg-orange/10 border-orange',
    textClass: 'text-orange-dark',
  },
  loading: {
    label: 'Loading',
    dotClass: 'bg-yellow animate-pulse',
    bgClass: 'bg-yellow/10 border-yellow',
    textClass: 'text-yellow-dark',
  },
  warning: {
    label: 'Warning',
    dotClass: 'bg-yellow',
    bgClass: 'bg-yellow/10 border-yellow',
    textClass: 'text-yellow-dark',
  },
}

const sizeConfig = {
  sm: { dot: 'w-2 h-2', text: 'text-xs px-2 py-0.5' },
  md: { dot: 'w-2.5 h-2.5', text: 'text-sm px-3 py-1' },
  lg: { dot: 'w-3 h-3', text: 'text-base px-4 py-1.5' },
}

export function StatusBadge({
  status,
  size = 'md',
  showLabel = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status]
  const sizes = sizeConfig[size]

  if (!showLabel) {
    return (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={cn('inline-block rounded-full', sizes.dot, config.dotClass)}
      />
    )
  }

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'inline-flex items-center gap-2 rounded-md border-2 font-bold uppercase tracking-wider',
        config.bgClass,
        config.textClass,
        sizes.text,
        className
      )}
    >
      <span className={cn('rounded-full', sizes.dot, config.dotClass)} />
      {config.label}
    </motion.span>
  )
}
