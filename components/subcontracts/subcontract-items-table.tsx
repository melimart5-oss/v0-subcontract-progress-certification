'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import { useCurrencyFormat } from '@/hooks/use-currency-format'

interface SubcontractItem {
  id: string
  item_number: string
  description: string
  unit: string
  unit_price: number
  contracted_quantity: number
}

interface SubcontractItemsTableProps {
  items: SubcontractItem[]
  totalAmount: number
}

export function SubcontractItemsTable({ items, totalAmount }: SubcontractItemsTableProps) {
  const { format } = useCurrencyFormat()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Nº</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead className="w-20">Ud.</TableHead>
          <TableHead className="text-right w-28">P. Unitario</TableHead>
          <TableHead className="text-right w-24">Cantidad</TableHead>
          <TableHead className="text-right w-32">Importe</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.item_number}</TableCell>
            <TableCell>{item.description}</TableCell>
            <TableCell>{item.unit}</TableCell>
            <TableCell className="text-right">{format(item.unit_price)}</TableCell>
            <TableCell className="text-right">{item.contracted_quantity}</TableCell>
            <TableCell className="text-right font-medium">
              {format(item.unit_price * item.contracted_quantity)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={5} className="text-right font-medium">Total</TableCell>
          <TableCell className="text-right font-bold">
            {format(totalAmount)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}
