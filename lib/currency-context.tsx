'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { type Currency, DEFAULT_CURRENCY } from './format'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  exchangeRate: number // ARS to USD rate
  setExchangeRate: (rate: number) => void
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const STORAGE_KEY = 'gestobra-currency'
const EXCHANGE_RATE_KEY = 'gestobra-exchange-rate'
const DEFAULT_EXCHANGE_RATE = 1000 // Default ARS/USD rate

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY)
  const [exchangeRate, setExchangeRateState] = useState(DEFAULT_EXCHANGE_RATE)

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedCurrency = localStorage.getItem(STORAGE_KEY) as Currency | null
    const savedRate = localStorage.getItem(EXCHANGE_RATE_KEY)
    
    if (savedCurrency && (savedCurrency === 'ARS' || savedCurrency === 'USD')) {
      setCurrencyState(savedCurrency)
    }
    if (savedRate) {
      setExchangeRateState(parseFloat(savedRate))
    }
  }, [])

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    localStorage.setItem(STORAGE_KEY, newCurrency)
  }

  const setExchangeRate = (rate: number) => {
    setExchangeRateState(rate)
    localStorage.setItem(EXCHANGE_RATE_KEY, rate.toString())
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRate, setExchangeRate }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
