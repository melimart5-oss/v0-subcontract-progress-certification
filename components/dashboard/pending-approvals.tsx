import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { ClipboardCheck, Award, ArrowRight, Clock } from 'lucide-react'

interface PendingApprovalsProps {
  pendingAMs: Array<{
    id: string
    code: string
    period_start: string
    period_end: string
    subcontract?: {
      code: string
      subcontractor?: {
        name: string
      }
    }
  }>
  pendingCertificates: Array<{
    id: string
    code: string
    total: number
    subcontract?: {
      code: string
      subcontractor?: {
        name: string
      }
    }
  }>
}

export function PendingApprovals({ pendingAMs, pendingCertificates }: PendingApprovalsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    })
  }

  const hasItems = pendingAMs.length > 0 || pendingCertificates.length > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning" />
              Pendientes de Aprobación
            </CardTitle>
            <CardDescription>
              Documentos que requieren tu revisión
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-warning/10 text-warning-foreground">
            {pendingAMs.length + pendingCertificates.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!hasItems ? (
          <Empty 
            title="Sin pendientes"
            description="No hay documentos pendientes de aprobación"
          />
        ) : (
          <div className="space-y-4">
            {pendingAMs.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4" />
                  Actas de Medición
                </h4>
                <div className="space-y-2">
                  {pendingAMs.map((am) => (
                    <Link 
                      key={am.id} 
                      href={`/actas-medicion/${am.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{am.code}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {am.subcontract?.subcontractor?.name || 'Sin subcontratista'}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium">
                          {formatDate(am.period_start)} - {formatDate(am.period_end)}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 ml-2 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {pendingCertificates.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Certificaciones
                </h4>
                <div className="space-y-2">
                  {pendingCertificates.map((cert) => (
                    <Link 
                      key={cert.id} 
                      href={`/certificaciones/${cert.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{cert.code}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {cert.subcontract?.subcontractor?.name || 'Sin subcontratista'}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-primary">
                          {formatCurrency(cert.total)}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 ml-2 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href="/actas-medicion?status=pending_approval">
                  Ver todas las AMs
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href="/certificaciones?status=pending_approval">
                  Ver certificaciones
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
