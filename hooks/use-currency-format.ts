'use client'

import { useCurrency } from '@/lib/currency-context'
import { formatCurrency, formatCurrencyCompact, type Currency } from '@/lib/format'

export function useCurrencyFormat() {
  const { currency, exchangeRate } = useCurrency()

  // Convert amount from ARS to the selected currency
  const convertAmount = (amountInARS: number): number => {
    if (currency === 'USD') {
      return amountInARS / exchangeRate
    }
    return amountInARS
  }

  // Format amount in the selected currency
  const format = (amountInARS: number): string => {
    const converted = convertAmount(amountInARS)
    return formatCurrency(converted, currency)
  }

  // Format amount in compact form (e.g., $1.5M)
  const formatCompact = (amountInARS: number): string => {
    const converted = convertAmount(amountInARS)
    return formatCurrencyCompact(converted, currency)
  }

  // Format with both currencies shown
  const formatDual = (amountInARS: number): { primary: string; secondary: string } => {
    if (currency === 'ARS') {
      return {
        primary: formatCurrency(amountInARS, 'ARS'),
        secondary: formatCurrency(amountInARS / exchangeRate, 'USD'),
      }
    }
    return {
      primary: formatCurrency(amountInARS / exchangeRate, 'USD'),
      secondary: formatCurrency(amountInARS, 'ARS'),
    }
  }

  return {
    currency,
    exchangeRate,
    format,
    formatCompact,
    formatDual,
    convertAmount,
  }
}
