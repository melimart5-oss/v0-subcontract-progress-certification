export type UserRole = 'admin' | 'jefe_obra' | 'jefe_produccion'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  code: string
  name: string
  description: string | null
  client: string | null
  location: string | null
  start_date: string | null
  end_date: string | null
  status: 'active' | 'completed' | 'suspended'
  created_at: string
  updated_at: string
}

export interface Subcontractor {
  id: string
  code: string
  name: string
  cif: string | null
  contact_person: string | null
  email: string | null
  phone: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export interface Subcontract {
  id: string
  project_id: string
  subcontractor_id: string
  code: string
  description: string | null
  start_date: string | null
  end_date: string | null
  total_amount: number
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  created_by: string
  created_at: string
  updated_at: string
  project?: Project
  subcontractor?: Subcontractor
  items?: SubcontractItem[]
}

export interface SubcontractItem {
  id: string
  subcontract_id: string
  item_number: string
  description: string
  unit: string
  unit_price: number
  contracted_quantity: number
  created_at: string
  updated_at: string
}

export type AMStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected'

export interface MeasurementAct {
  id: string
  subcontract_id: string
  code: string
  period_start: string
  period_end: string
  status: AMStatus
  created_by: string
  approved_by: string | null
  approved_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  subcontract?: Subcontract
  items?: MeasurementActItem[]
  created_by_profile?: Profile
  approved_by_profile?: Profile
}

export interface MeasurementActItem {
  id: string
  measurement_act_id: string
  subcontract_item_id: string
  measured_quantity: number
  accumulated_quantity: number
  notes: string | null
  created_at: string
  updated_at: string
  subcontract_item?: SubcontractItem
}

export type CertificateStatus = 'draft' | 'pending_approval' | 'approved' | 'invoiced' | 'paid'

export interface Certificate {
  id: string
  subcontract_id: string
  code: string
  period_start: string
  period_end: string
  status: CertificateStatus
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  created_by: string
  approved_by: string | null
  approved_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  subcontract?: Subcontract
  items?: CertificateItem[]
}

export interface CertificateItem {
  id: string
  certificate_id: string
  subcontract_item_id: string
  certified_quantity: number
  certified_amount: number
  accumulated_quantity: number
  accumulated_amount: number
  created_at: string
  updated_at: string
  subcontract_item?: SubcontractItem
}

export interface Attachment {
  id: string
  entity_type: 'subcontract' | 'measurement_act' | 'certificate'
  entity_id: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  uploaded_by: string
  created_at: string
}

// Dashboard stats
export interface DashboardStats {
  totalSubcontracts: number
  activeSubcontracts: number
  totalContractedAmount: number
  totalCertifiedAmount: number
  pendingAMs: number
  pendingCertificates: number
  recentAMs: MeasurementAct[]
  recentCertificates: Certificate[]
}
