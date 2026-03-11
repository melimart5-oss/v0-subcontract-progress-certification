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
import { CheckCircle, XCircle, AlertTriangle, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ApprovalActionsProps {
  amId: string
  currentStatus?: string
}

const approvalStepInfo = {
  pending_jefe: {
    title: 'Aprobación Jefe de Obra',
    description: 'Esta acta requiere tu aprobación como Jefe de Obra. Al aprobar, pasará a revisión del Administrador.',
    nextStep: 'Administrador',
  },
  pending_admin: {
    title: 'Aprobación Final',
    description: 'Esta acta ya fue aprobada por el Jefe de Obra. Tu aprobación finaliza el proceso y permite generar la certificación.',
    nextStep: null,
  },
}

export function ApprovalActions({ amId, currentStatus }: ApprovalActionsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const handleApprove = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      // Get user profile to determine next status
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      // Determine next status based on current status and role
      let nextStatus = 'approved'
      if (currentStatus === 'pending_jefe' && profile?.role === 'jefe_obra') {
        nextStatus = 'pending_admin' // Move to admin approval
      } else if (currentStatus === 'pending_admin' && profile?.role === 'admin') {
        nextStatus = 'approved' // Final approval
      }

      const { error } = await supabase
        .from('measurement_acts')
        .update({
          status: nextStatus,
          ...(nextStatus === 'approved' ? {
            approved_by: user.id,
            approved_at: new Date().toISOString(),
          } : {}),
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

  const stepInfo = approvalStepInfo[currentStatus as keyof typeof approvalStepInfo] || {
    title: 'Acción Requerida',
    description: 'Esta acta de medición está pendiente de tu aprobación',
    nextStep: null,
  }

  return (
    <Card className="border-warning bg-warning/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <CardTitle className="text-lg">{stepInfo.title}</CardTitle>
              <CardDescription className="mt-0.5">
                {stepInfo.description}
              </CardDescription>
            </div>
          </div>
          {stepInfo.nextStep && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span>Siguiente:</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <ArrowRight className="w-3 h-3" />
                {stepInfo.nextStep}
              </Badge>
            </div>
          )}
        </div>
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
