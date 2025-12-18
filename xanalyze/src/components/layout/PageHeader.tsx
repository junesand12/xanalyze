'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  variant?: 'purple' | 'green' | 'orange' | 'yellow'
  className?: string
}

const variantStyles = {
  purple: 'text-purple',
  green: 'text-green',
  orange: 'text-orange',
  yellow: 'text-yellow',
}

export function PageHeader({
  title,
  description,
  children,
  variant = 'purple',
  className,
}: PageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('mb-8', className)}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className={cn(
            'text-4xl md:text-5xl font-bold uppercase tracking-tight text-shadow-brutal',
            variantStyles[variant]
          )}>
            {title}
          </h1>
          {description && (
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-xl">
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-3">
            {children}
          </div>
        )}
      </div>
    </motion.header>
  )
}
