'use client'

import { cn } from '@/lib/utils'
import { motion, HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'

interface BrutalButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode
  variant?: 'default' | 'purple' | 'green' | 'orange' | 'yellow' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const variantStyles = {
  default: 'bg-black text-white',
  purple: 'bg-purple text-white',
  green: 'bg-green text-white',
  orange: 'bg-orange text-white',
  yellow: 'bg-yellow text-black',
  outline: 'bg-transparent text-black',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export const BrutalButton = forwardRef<HTMLButtonElement, BrutalButtonProps>(
  ({ children, variant = 'default', size = 'md', className, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ x: -2, y: -2 }}
        whileTap={{ x: 2, y: 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          'brutal-btn rounded-md font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)

BrutalButton.displayName = 'BrutalButton'
