import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind className helper
 * Combines clsx + tailwind-merge for safe class merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date into readable US style
 * Example: Jan 10, 2026
 */
export function formatDate(date: string | number | Date): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid Date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

/**
 * Format currency in PKR (Pakistan Rupee)
 * Example: PKR 12,000
 */
export function formatCurrency(amount: number): string {
  if (amount === 0) return "Custom";
  return `PKR ${amount.toLocaleString('en-US')}`;
}