// Formatting utilities for the application

export type Currency = 'ARS' | 'USD'

// Default currency for the application
export const DEFAULT_CURRENCY: Currency = 'ARS'

const currencyConfig: Record<Currency, { locale: string; symbol: string; code: string }> = {
  ARS: { locale: 'es-AR', symbol: '$', code: 'ARS' },
  USD: { locale: 'en-US', symbol: 'US$', code: 'USD' },
}

export function formatCurrency(amount: number, currency: Currency = DEFAULT_CURRENCY): string {
  const config = currencyConfig[currency]
  
  // For ARS, use a custom format to show $ with thousands separator
  if (currency === 'ARS') {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatCurrencyCompact(amount: number, currency: Currency = DEFAULT_CURRENCY): string {
  const config = currencyConfig[currency]
  
  if (amount >= 1000000) {
    return `${config.symbol} ${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `${config.symbol} ${(amount / 1000).toFixed(0)}K`
  }
  return formatCurrency(amount, currency)
}

export function formatNumber(num: number, decimals = 2): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

export function formatDateLong(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100)
}

export function calculateProgress(certified: number, total: number): number {
  if (total === 0) return 0
  return Math.min(100, Math.round((certified / total) * 100))
}
