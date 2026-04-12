import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSalary(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '?'
  if (amount === 0) return '0'
  if (amount < 1000) return amount.toString()
  
  const kValue = amount / 1000
  // If it's a whole number of thousands, don't show decimal
  if (kValue % 1 === 0) return `${kValue.toFixed(0)}k`
  // Otherwise show 1 decimal place (e.g. 1.5k)
  return `${kValue.toFixed(1)}k`
}
