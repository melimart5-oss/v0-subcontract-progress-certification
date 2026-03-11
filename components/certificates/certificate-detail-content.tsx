'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import { CheckCircle } from 'lucide-react'
import { formatDate } from '@/lib/format'
import { useCurrencyFormat } from '@/hooks/use-currency-format'

interface CertificateItem {
  id: string
  certified_quantity: number
  certified_amount: number
  accumulated_quantity: number
  subcontract_item?: {
    item_number: string
    description: string
    unit: string
    unit_price: number
  }
}

interface CertificateDetailContentProps {
  certificate: {
    subtotal: number
    tax_rate: number
    tax_amount: number
    total: number
    status: string
    approved_at?: string | null
    approved_by_profile?: { full_name: string } | null
    items?: CertificateItem[]
  }
}

export function CertificateSummaryCard({ certificate }: CertificateDetailContentProps) {
  const { format } = useCurrencyFormat()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen Económico</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Subtotal</p>
          <p className="text-xl font-medium">{format(certificate.subtotal || 0)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">IVA ({certificate.tax_rate}%)</p>
          <p className="text-xl font-medium">{format(certificate.tax_amount || 0)}</p>
        </div>
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-3xl font-bold text-primary">{format(certificate.total || 0)}</p>
        </div>
        {certificate.status === 'approved' && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle className="w-4 h-4" />
              <span>Aprobado por {certificate.approved_by_profile?.full_name}</span>
            </div>
            {certificate.approved_at && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(certificate.approved_at)}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function CertificateItemsTable({ certificate }: CertificateDetailContentProps) {
  const { format } = useCurrencyFormat()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalle de Partidas Certificadas</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Nº</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="w-16">Ud.</TableHead>
              <TableHead className="text-right w-24">P. Unitario</TableHead>
              <TableHead className="text-right w-24">Certificado</TableHead>
              <TableHead className="text-right w-24">Acumulado</TableHead>
              <TableHead className="text-right w-28">Importe</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certificate.items?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {item.subcontract_item?.item_number}
                </TableCell>
                <TableCell>{item.subcontract_item?.description}</TableCell>
                <TableCell>{item.subcontract_item?.unit}</TableCell>
                <TableCell className="text-right">
                  {format(item.subcontract_item?.unit_price || 0)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {item.certified_quantity}
                </TableCell>
                <TableCell className="text-right">
                  {item.accumulated_quantity}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {format(item.certified_amount || 0)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6} className="text-right">Subtotal</TableCell>
              <TableCell className="text-right font-medium">
                {format(certificate.subtotal || 0)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={6} className="text-right">
                IVA ({certificate.tax_rate}%)
              </TableCell>
              <TableCell className="text-right font-medium">
                {format(certificate.tax_amount || 0)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={6} className="text-right font-bold">Total</TableCell>
              <TableCell className="text-right font-bold text-lg">
                {format(certificate.total || 0)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  )
}
