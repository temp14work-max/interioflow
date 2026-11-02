/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Formats integer paise into Indian Rupee (INR) representation.
 * Example: 49900 paise -> ₹499.00, 2450000 paise -> ₹24,500.00
 */
export function formatINR(paise: number | undefined | null): string {
  if (typeof paise !== 'number' || isNaN(paise)) return '₹0.00';
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Formats a date string into readable editorial format (e.g., "26 Oct 2026")
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return String(dateString) || '—';
  }
}

/**
 * Formats relative date or timestamp (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return formatDate(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return formatDate(dateString);
  } catch {
    return formatDate(dateString);
  }
}

/**
 * Generates an order number, e.g. "IF-2026-8492"
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `IF-${year}-${rand}`;
}
