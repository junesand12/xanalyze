'use client'

import { cn } from '@/lib/utils'
import { motion, HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'

interface BrutalCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode
  variant?: 'default' | 'purple' | 'green' | 'orange' | 'yellow'
  hover?: boolean
  className?: string
}

const variantBgColors = {
  default: '#FFFFFF',
  purple: '#EDE9FE',
  green: '#D1FAE5',
  orange: '#FFEDD5',
  yellow: '#FEF3C7',
}

export const BrutalCard = forwardRef<HTMLDivElement, BrutalCardProps>(
  ({ children, variant = 'default', hover = true, className, style, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { x: -2, y: -2 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          'brutal-card rounded-lg p-4',
          className
        )}
        {...props}
        style={{ backgroundColor: variantBgColors[variant], ...style }}
      >
        {children}
      </motion.div>
    )
  }
)

BrutalCard.displayName = 'BrutalCard'

interface BrutalCardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function BrutalCardHeader({ children, className }: BrutalCardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  )
}

interface BrutalCardTitleProps {
  children: React.ReactNode
  className?: string
}

export function BrutalCardTitle({ children, className }: BrutalCardTitleProps) {
  return (
    <h3 className={cn('text-lg font-bold uppercase tracking-wide', className)}>
      {children}
    </h3>
  )
}

interface BrutalCardContentProps {
  children: React.ReactNode
  className?: string
}

export function BrutalCardContent({ children, className }: BrutalCardContentProps) {
  return <div className={cn('', className)}>{children}</div>
}
