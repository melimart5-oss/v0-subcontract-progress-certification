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
import { CheckCircle, XCircle } from 'lucide-react'
import { formatDate } from '@/lib/format'
import { useCurrencyFormat } from '@/hooks/use-currency-format'

interface MeasurementActItem {
  id: string
  measured_quantity: number
  accumulated_quantity: number
  subcontract_item?: {
    item_number: string
    description: string
    unit: string
    unit_price: number
    contracted_quantity: number
  }
}

interface MeasurementActSummaryCardProps {
  totalMeasured: number
  status: string
  approvedAt?: string | null
  approvedByName?: string | null
}

export function MeasurementActSummaryCard({
  totalMeasured,
  status,
  approvedAt,
  approvedByName,
}: MeasurementActSummaryCardProps) {
  const { format } = useCurrencyFormat()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Medición</p>
          <p className="text-2xl font-bold">{format(totalMeasured)}</p>
        </div>
        {status === 'approved' && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle className="w-4 h-4" />
              <span>Aprobado por {approvedByName}</span>
            </div>
            {approvedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(approvedAt)}
              </p>
            )}
          </div>
        )}
        {status === 'rejected' && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <XCircle className="w-4 h-4" />
              <span>Rechazado</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface MeasurementActItemsTableProps {
  items: MeasurementActItem[]
  totalMeasured: number
}

export function MeasurementActItemsTable({ items, totalMeasured }: MeasurementActItemsTableProps) {
  const { format } = useCurrencyFormat()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalle de Mediciones</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Nº</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="w-16">Ud.</TableHead>
              <TableHead className="text-right w-24">P. Unitario</TableHead>
              <TableHead className="text-right w-24">Contratado</TableHead>
              <TableHead className="text-right w-24">Medición</TableHead>
              <TableHead className="text-right w-24">Acumulado</TableHead>
              <TableHead className="text-right w-28">Importe</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {item.subcontract_item?.item_number}
                </TableCell>
                <TableCell>{item.subcontract_item?.description}</TableCell>
                <TableCell>{item.subcontract_item?.unit}</TableCell>
                <TableCell className="text-right">
                  {format(item.subcontract_item?.unit_price || 0)}
                </TableCell>
                <TableCell className="text-right">
                  {item.subcontract_item?.contracted_quantity}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {item.measured_quantity}
                </TableCell>
                <TableCell className="text-right">
                  {item.accumulated_quantity}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {format(
                    item.measured_quantity * (item.subcontract_item?.unit_price || 0)
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={7} className="text-right font-medium">
                Total
              </TableCell>
              <TableCell className="text-right font-bold">
                {format(totalMeasured)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  )
}
