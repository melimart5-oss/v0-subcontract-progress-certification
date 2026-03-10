import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, TrendingUp, Clock, Award } from 'lucide-react'

interface DashboardStatsProps {
  stats: {
    totalSubcontracts: number
    activeSubcontracts: number
    totalContractedAmount: number
    totalCertifiedAmount: number
    pendingAMs: number
    pendingCertificates: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const certificationPercentage = stats.totalContractedAmount > 0 
    ? ((stats.totalCertifiedAmount / stats.totalContractedAmount) * 100).toFixed(1)
    : '0'

  const statItems = [
    {
      title: 'Subcontratos Activos',
      value: stats.activeSubcontracts,
      subtitle: `${stats.totalSubcontracts} totales`,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Importe Contratado',
      value: formatCurrency(stats.totalContractedAmount),
      subtitle: 'Total acumulado',
      icon: TrendingUp,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
    {
      title: 'Importe Certificado',
      value: formatCurrency(stats.totalCertifiedAmount),
      subtitle: `${certificationPercentage}% del contratado`,
      icon: Award,
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10',
    },
    {
      title: 'Pendientes Aprobación',
      value: stats.pendingAMs + stats.pendingCertificates,
      subtitle: `${stats.pendingAMs} AMs, ${stats.pendingCertificates} Cert.`,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${item.bgColor}`}>
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{item.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
