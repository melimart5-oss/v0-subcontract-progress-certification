'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/format'
import { useCurrencyFormat } from '@/hooks/use-currency-format'

interface Certificate {
  id: string
  code: string
  status: string
  total: number
  period_start: string
  period_end: string
}

interface CertificatesTableProps {
  certificates: Certificate[]
}

export function CertificatesTable({ certificates }: CertificatesTableProps) {
  const { format } = useCurrencyFormat()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Período</TableHead>
          <TableHead className="text-right">Total</TableHead>
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
              {format(cert.total)}
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
    </Table>
  )
}
