'use client'

import { useCurrency } from '@/lib/currency-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { DollarSign, Settings } from 'lucide-react'
import { useState } from 'react'
import type { Currency } from '@/lib/format'

const currencyLabels: Record<Currency, { label: string; symbol: string }> = {
  ARS: { label: 'Peso Argentino', symbol: '$' },
  USD: { label: 'Dólar US', symbol: 'US$' },
}

export function CurrencySelector() {
  const { currency, setCurrency, exchangeRate, setExchangeRate } = useCurrency()
  const [showRateDialog, setShowRateDialog] = useState(false)
  const [tempRate, setTempRate] = useState(exchangeRate.toString())

  const handleSaveRate = () => {
    const rate = parseFloat(tempRate)
    if (rate > 0) {
      setExchangeRate(rate)
      setShowRateDialog(false)
    }
  }

  return (
    <Dialog open={showRateDialog} onOpenChange={setShowRateDialog}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">{currencyLabels[currency].symbol}</span>
            <span className="font-medium">{currency}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Moneda</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setCurrency('ARS')}
            className={currency === 'ARS' ? 'bg-accent' : ''}
          >
            <span className="mr-2 font-medium">$</span>
            Peso Argentino (ARS)
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setCurrency('USD')}
            className={currency === 'USD' ? 'bg-accent' : ''}
          >
            <span className="mr-2 font-medium">US$</span>
            Dólar US (USD)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DialogTrigger asChild>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Tipo de cambio
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tipo de Cambio</DialogTitle>
          <DialogDescription>
            Configura el tipo de cambio ARS/USD para conversiones
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel>1 USD =</FieldLabel>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={tempRate}
                onChange={(e) => setTempRate(e.target.value)}
                placeholder="1000"
                className="flex-1"
              />
              <span className="text-muted-foreground">ARS</span>
            </div>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowRateDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveRate}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
