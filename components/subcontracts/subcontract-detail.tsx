'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Empty } from '@/components/ui/empty'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Edit, Plus, FileText, ClipboardCheck, Award, Building2, Calendar, TrendingUp, Phone, Mail, User } from 'lucide-react'
import { formatDate, formatPercent } from '@/lib/format'
import { useCurrencyFormat } from '@/hooks/use-currency-format'

interface SubcontractDetailProps {
  subcontract: {
    id: string
    code: string
    description: string | null
    status: string
    total_amount: number
    start_date: string | null
    end_date: string | null
    project?: { code: string; name: string } | null
    subcontractor?: { 
      name: string
      cif?: string
      contact_person?: string
      phone?: string
      email?: string
    } | null
  }
  measurementActs: Array<{
    id: string
    code: string
    status: string
    period_start: string
    period_end: string
    total: number
  }>
  certificates: Array<{
    id: string
    code: string
    status: string
    period_start: string
    period_end: string
    total: number
  }>
  certifiedAmount: number
  progress: number
  pendingAmount: number
}

export function SubcontractDetail({
  subcontract,
  measurementActs,
  certificates,
  certifiedAmount,
  progress,
  pendingAmount,
}: SubcontractDetailProps) {
  const { format } = useCurrencyFormat()
  const totalAmount = subcontract.total_amount || 0

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header Info */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="w-5 h-5 text-primary" />
                  {subcontract.code}
                </CardTitle>
                <CardDescription className="mt-1">
                  {subcontract.description || 'Sin descripción'}
                </CardDescription>
              </div>
              <StatusBadge status={subcontract.status} type="subcontract" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Proyecto</p>
                  <p className="font-medium">
                    {subcontract.project?.code} - {subcontract.project?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Subcontratista</p>
                  <p className="font-medium">{subcontract.subcontractor?.name}</p>
                  {subcontract.subcontractor?.cif && (
                    <p className="text-xs text-muted-foreground">CUIT: {subcontract.subcontractor.cif}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Período</p>
                  <p className="font-medium">
                    {formatDate(subcontract.start_date || '')} - {formatDate(subcontract.end_date || '')}
                  </p>
                </div>
              </div>
              {subcontract.subcontractor?.contact_person && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Contacto</p>
                    <p className="font-medium">{subcontract.subcontractor.contact_person}</p>
                    {subcontract.subcontractor.phone && (
                      <p className="text-xs text-muted-foreground">{subcontract.subcontractor.phone}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
            {subcontract.subcontractor?.email && (
              <div className="pt-4 border-t">
                <a 
                  href={`mailto:${subcontract.subcontractor.email}`}
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  {subcontract.subcontractor.email}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="measurement_acts" className="w-full">
        <TabsList>
          <TabsTrigger value="measurement_acts" className="gap-2">
            <ClipboardCheck className="w-4 h-4" />
            Actas de Medición
          </TabsTrigger>
          <TabsTrigger value="certificates" className="gap-2">
            <Award className="w-4 h-4" />
            Certificaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="measurement_acts" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Actas de Medición</CardTitle>
                <CardDescription>Historial de actas del subcontrato</CardDescription>
              </div>
              <Button asChild>
                <Link href={`/actas-medicion/nuevo?subcontract=${subcontract.id}`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Acta
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {measurementActs.length === 0 ? (
                <Empty
                  title="Sin actas de medición"
                  description="No hay actas de medición para este subcontrato"
                >
                  <Button asChild>
                    <Link href={`/actas-medicion/nuevo?subcontract=${subcontract.id}`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Acta
                    </Link>
                  </Button>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead className="text-right">Importe</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {measurementActs.map((am) => (
                      <TableRow key={am.id}>
                        <TableCell className="font-medium">{am.code}</TableCell>
                        <TableCell>
                          {formatDate(am.period_start)} - {formatDate(am.period_end)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {format(am.total || 0)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={am.status} type="measurement_act" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/actas-medicion/${am.id}`}>Ver</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={2}>Total</TableCell>
                      <TableCell className="text-right font-bold">
                        {format(measurementActs.reduce((sum, am) => sum + (am.total || 0), 0))}
                      </TableCell>
                      <TableCell colSpan={2} />
                    </TableRow>
                  </TableFooter>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Certificaciones</CardTitle>
                <CardDescription>Historial de certificaciones del subcontrato</CardDescription>
              </div>
              <Button asChild>
                <Link href={`/certificaciones/nuevo?subcontract=${subcontract.id}`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Certificación
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {certificates.length === 0 ? (
                <Empty
                  title="Sin certificaciones"
                  description="No hay certificaciones para este subcontrato"
                >
                  <Button asChild>
                    <Link href={`/certificaciones/nuevo?subcontract=${subcontract.id}`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Certificación
                    </Link>
                  </Button>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead className="text-right">Importe</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-medium">{cert.code}</TableCell>
                        <TableCell>
                          {formatDate(cert.period_start)} - {formatDate(cert.period_end)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {format(cert.total || 0)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={cert.status} type="certificate" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/certificaciones/${cert.id}`}>Ver</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={2}>Total</TableCell>
                      <TableCell className="text-right font-bold">
                        {format(certificates.reduce((sum, c) => sum + (c.total || 0), 0))}
                      </TableCell>
                      <TableCell colSpan={2} />
                    </TableRow>
                  </TableFooter>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
