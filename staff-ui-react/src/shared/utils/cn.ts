import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

/**
 * Utility function to merge Tailwind CSS classes with proper conflict resolution
 * Combines clsx for conditional classes and tailwind-merge for Tailwind conflicts
 * 
 * @param inputs - Class values (strings, objects, arrays, etc.)
 * @returns Merged class string with conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Export clsx for direct usage when tailwind-merge is not needed
export { clsx };

// Type utilities for className props
export type ClassNameValue = ClassValue;
export type ClassName = string;