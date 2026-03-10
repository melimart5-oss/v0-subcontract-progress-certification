'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { CheckCircle, XCircle } from 'lucide-react'

interface ApprovalActionsProps {
  amId: string
}

export function ApprovalActions({ amId }: ApprovalActionsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const handleApprove = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const { error } = await supabase
        .from('measurement_acts')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', amId)

      if (error) throw error

      router.refresh()
    } catch (err) {
      console.error('Error approving:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const { error } = await supabase
        .from('measurement_acts')
        .update({
          status: 'rejected',
          notes: rejectionReason ? `Rechazado: ${rejectionReason}` : 'Rechazado',
        })
        .eq('id', amId)

      if (error) throw error

      router.refresh()
    } catch (err) {
      console.error('Error rejecting:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-warning bg-warning/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-warning-foreground">
          Acción Requerida
        </CardTitle>
        <CardDescription>
          Esta acta de medición está pendiente de tu aprobación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="default" disabled={loading}>
                {loading ? <Spinner className="mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Aprobar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Aprobación</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro de que deseas aprobar esta acta de medición? 
                  Esta acción permitirá generar la certificación correspondiente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleApprove}>
                  Aprobar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={loading}>
                {loading ? <Spinner className="mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                Rechazar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Rechazar Acta de Medición</AlertDialogTitle>
                <AlertDialogDescription>
                  Indica el motivo del rechazo para que el jefe de producción pueda corregirlo.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Textarea
                  placeholder="Motivo del rechazo..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleReject}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Rechazar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
