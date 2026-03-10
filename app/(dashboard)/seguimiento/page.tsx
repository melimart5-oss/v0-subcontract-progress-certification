import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingUp, FileText, Award } from 'lucide-react'

export default async function SeguimientoPage() {
  const supabase = await createClient()

  // Fetch all data for tracking
  const [
    { data: subcontracts },
    { data: certificates },
    { data: measurementActs },
  ] = await Promise.all([
    supabase.from('subcontracts').select(`
      *,
      subcontractor:subcontractors(name),
      project:projects(code, name)
    `).eq('status', 'active'),
    supabase.from('certificates').select('*').eq('status', 'approved'),
    supabase.from('measurement_acts').select('*'),
  ])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate totals
  const totalContracted = subcontracts?.reduce((acc, s) => acc + (s.total_amount || 0), 0) || 0
  const totalCertified = certificates?.reduce((acc, c) => acc + (c.total || 0), 0) || 0
  const certificationPercentage = totalContracted > 0 
    ? (totalCertified / totalContracted) * 100 
    : 0

  // Calculate per-subcontract stats
  const subcontractStats = subcontracts?.map(sub => {
    const subCertificates = certificates?.filter(c => c.subcontract_id === sub.id) || []
    const certified = subCertificates.reduce((acc, c) => acc + (c.total || 0), 0)
    const percentage = sub.total_amount > 0 ? (certified / sub.total_amount) * 100 : 0
    
    return {
      ...sub,
      certified,
      percentage,
      certificateCount: subCertificates.length,
    }
  }) || []

  // Sort by certification percentage
  const sortedStats = [...subcontractStats].sort((a, b) => b.percentage - a.percentage)

  return (
    <>
      <PageHeader
        title="Seguimiento"
        breadcrumbs={[
          { label: 'Panel', href: '/dashboard' },
          { label: 'Seguimiento' },
        ]}
      />
      <div className="flex-1 p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Contratado
              </CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalContracted)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {subcontracts?.length || 0} subcontratos activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Certificado
              </CardTitle>
              <div className="p-2 rounded-lg bg-chart-2/10">
                <Award className="w-4 h-4 text-chart-2" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCertified)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {certificates?.length || 0} certificaciones aprobadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avance Global
              </CardTitle>
              <div className="p-2 rounded-lg bg-chart-1/10">
                <TrendingUp className="w-4 h-4 text-chart-1" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{certificationPercentage.toFixed(1)}%</div>
              <Progress value={certificationPercentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendiente Certificar
              </CardTitle>
              <div className="p-2 rounded-lg bg-warning/10">
                <BarChart3 className="w-4 h-4 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalContracted - totalCertified)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {(100 - certificationPercentage).toFixed(1)}% restante
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subcontract Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Avance por Subcontrato
            </CardTitle>
            <CardDescription>
              Porcentaje de certificación de cada subcontrato activo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {sortedStats.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No hay subcontratos activos para mostrar
                </p>
              ) : (
                sortedStats.map((stat) => (
                  <div key={stat.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{stat.code}</p>
                          <Badge variant="outline" className="shrink-0">
                            {stat.certificateCount} cert.
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {stat.subcontractor?.name} | {stat.project?.code}
                        </p>
                      </div>
                      <div className="text-right ml-4 shrink-0">
                        <p className="font-bold">{stat.percentage.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(stat.certified)} / {formatCurrency(stat.total_amount)}
                        </p>
                      </div>
                    </div>
                    <Progress 
                      value={stat.percentage} 
                      className="h-2"
                    />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
