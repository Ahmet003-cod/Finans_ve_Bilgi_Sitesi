import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes efficiently, handling conflicts and conditional logic.
 *
 * @param inputs - Class definitions to be conditionally applied and merged.
 * @returns A computed string of tailwind classes.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
