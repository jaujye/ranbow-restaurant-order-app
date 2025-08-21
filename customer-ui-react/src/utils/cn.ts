import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function for combining and merging Tailwind CSS classes
 * @param inputs - Class names to be combined
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Common class combinations for consistent styling
 */
export const variants = {
  // Button sizes
  buttonSize: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  },
  
  // Button variants
  buttonVariant: {
    primary: 'btn-primary',
    secondary: 'btn-secondary', 
    accent: 'btn-accent',
    ghost: 'btn-ghost',
    rainbow: 'btn-rainbow',
  },
  
  // Input sizes
  inputSize: {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
  },
  
  // Card variants
  cardVariant: {
    default: 'card',
    hover: 'card card-hover',
    rainbow: 'card-rainbow',
  },
}