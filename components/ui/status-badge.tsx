'use client'

import { cn } from '@/lib/utils'

type Status = 
  | 'draft' 
  | 'pending_jefe' 
  | 'pending_admin' 
  | 'pending_approval' 
  | 'approved' 
  | 'rejected' 
  | 'issued'
  | 'observed'
  | 'active'
  | 'completed'
  | 'cancelled'

interface StatusBadgeProps {
  status: Status | string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { 
    label: 'Borrador', 
    className: 'bg-status-draft text-status-draft-foreground' 
  },
  pending_jefe: { 
    label: 'Pte. Jefe Obra', 
    className: 'bg-status-pending text-status-pending-foreground' 
  },
  pending_admin: { 
    label: 'Pte. Administración', 
    className: 'bg-status-pending text-status-pending-foreground' 
  },
  pending_approval: { 
    label: 'Pendiente', 
    className: 'bg-status-pending text-status-pending-foreground' 
  },
  approved: { 
    label: 'Aprobada', 
    className: 'bg-status-approved text-status-approved-foreground' 
  },
  rejected: { 
    label: 'Rechazada', 
    className: 'bg-destructive text-destructive-foreground' 
  },
  issued: { 
    label: 'Emitido', 
    className: 'bg-status-issued text-status-issued-foreground' 
  },
  observed: { 
    label: 'Observada', 
    className: 'bg-status-observed text-status-observed-foreground' 
  },
  active: { 
    label: 'Activo', 
    className: 'bg-status-approved text-status-approved-foreground' 
  },
  completed: { 
    label: 'Completado', 
    className: 'bg-muted text-muted-foreground' 
  },
  cancelled: { 
    label: 'Cancelado', 
    className: 'bg-destructive/20 text-destructive' 
  },
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
}

export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || { 
    label: status, 
    className: 'bg-muted text-muted-foreground' 
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full whitespace-nowrap',
        sizeClasses[size],
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}

export function getStatusLabel(status: string): string {
  return statusConfig[status]?.label || status
}
