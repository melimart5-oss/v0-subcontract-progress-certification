'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, Mail } from 'lucide-react'
import { formatPercent } from '@/lib/format'
import { useCurrencyFormat } from '@/hooks/use-currency-format'

interface SubcontractSummaryCardProps {
  totalAmount: number
  certifiedAmount: number
  progress: number
  pendingAmount: number
  email?: string | null
}

export function SubcontractSummaryCard({
  totalAmount,
  certifiedAmount,
  progress,
  pendingAmount,
  email,
}: SubcontractSummaryCardProps) {
  const { format } = useCurrencyFormat()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Resumen Económico
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Importe Contratado</p>
          <p className="text-2xl font-bold">{format(totalAmount)}</p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Certificado</span>
            <span className="font-medium text-success">{format(certifiedAmount)}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatPercent(progress)} completado</span>
            <span>Pendiente: {format(pendingAmount)}</span>
          </div>
        </div>
        {email && (
          <div className="pt-4 border-t">
            <a 
              href={`mailto:${email}`}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Mail className="w-4 h-4" />
              {email}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
