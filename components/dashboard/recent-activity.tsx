import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import { Activity, ClipboardCheck, Award } from 'lucide-react'

interface RecentActivityProps {
  recentAMs: Array<{
    id: string
    code: string
    status: string
    created_at: string
    subcontract?: {
      code: string
      subcontractor?: {
        name: string
      }
    }
  }>
  recentCertificates: Array<{
    id: string
    code: string
    status: string
    total: number
    created_at: string
    subcontract?: {
      code: string
      subcontractor?: {
        name: string
      }
    }
  }>
}

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  pending_approval: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  invoiced: 'Facturado',
  paid: 'Pagado',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  pending_approval: 'outline',
  approved: 'default',
  rejected: 'destructive',
  invoiced: 'secondary',
  paid: 'default',
}

export function RecentActivity({ recentAMs, recentCertificates }: RecentActivityProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Combine and sort by created_at
  const allActivity = [
    ...recentAMs.map(am => ({ ...am, type: 'am' as const })),
    ...recentCertificates.map(cert => ({ ...cert, type: 'cert' as const })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Actividad Reciente
        </CardTitle>
        <CardDescription>
          Últimas actualizaciones del sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {allActivity.length === 0 ? (
          <Empty 
            title="Sin actividad"
            description="No hay actividad reciente para mostrar"
          />
        ) : (
          <div className="space-y-3">
            {allActivity.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.type === 'am' ? `/actas-medicion/${item.id}` : `/certificaciones/${item.id}`}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${item.type === 'am' ? 'bg-chart-2/10' : 'bg-chart-1/10'}`}>
                  {item.type === 'am' ? (
                    <ClipboardCheck className="w-4 h-4 text-chart-2" />
                  ) : (
                    <Award className="w-4 h-4 text-chart-1" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{item.code}</p>
                    <Badge variant={statusVariants[item.status] || 'secondary'}>
                      {statusLabels[item.status] || item.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {item.subcontract?.subcontractor?.name || 'Sin subcontratista'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(item.created_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
