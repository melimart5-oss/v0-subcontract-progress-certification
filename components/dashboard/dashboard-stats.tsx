'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { FileText, TrendingUp, Clock, Award, ArrowUpRight } from 'lucide-react'
import { formatPercent } from '@/lib/format'
import { useCurrencyFormat } from '@/hooks/use-currency-format'

interface DashboardStatsProps {
  stats: {
    totalSubcontracts: number
    activeSubcontracts: number
    totalContractedAmount: number
    totalCertifiedAmount: number
    pendingAMs: number
    pendingCertificates: number
    projectsCount: number
    subcontractorsCount: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const { format } = useCurrencyFormat()
  
  const certificationPercentage = stats.totalContractedAmount > 0 
    ? (stats.totalCertifiedAmount / stats.totalContractedAmount) * 100
    : 0
  
  const pendingTotal = stats.pendingAMs + stats.pendingCertificates

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Subcontratos Activos */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Subcontratos Activos
          </CardTitle>
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="w-4 h-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">{stats.activeSubcontracts}</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">
              de {stats.totalSubcontracts} totales
            </span>
            <span className="inline-flex items-center text-xs font-medium text-success">
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              {stats.projectsCount} proyectos
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Importe Contratado */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Importe Contratado
          </CardTitle>
          <div className="p-2 rounded-lg bg-chart-2/10">
            <TrendingUp className="w-4 h-4 text-chart-2" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">
            {format(stats.totalContractedAmount)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.subcontractorsCount} subcontratistas
          </p>
        </CardContent>
      </Card>

      {/* Importe Certificado */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Certificado
          </CardTitle>
          <div className="p-2 rounded-lg bg-success/10">
            <Award className="w-4 h-4 text-success" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">
            {format(stats.totalCertifiedAmount)}
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Avance</span>
              <span className="font-medium">{formatPercent(certificationPercentage)}</span>
            </div>
            <Progress value={certificationPercentage} className="h-1.5" />
          </div>
        </CardContent>
      </Card>

      {/* Pendientes */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pendientes Aprobación
          </CardTitle>
          <div className={`p-2 rounded-lg ${pendingTotal > 0 ? 'bg-warning/10' : 'bg-muted'}`}>
            <Clock className={`w-4 h-4 ${pendingTotal > 0 ? 'text-warning' : 'text-muted-foreground'}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">{pendingTotal}</div>
          <div className="flex items-center gap-3 mt-2">
            <span className="inline-flex items-center gap-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-primary" />
              {stats.pendingAMs} AMs
            </span>
            <span className="inline-flex items-center gap-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-chart-2" />
              {stats.pendingCertificates} Cert.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
