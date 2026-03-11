import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/page-header'
import { ProjectsList } from '@/components/projects/projects-list'

export default async function ProyectosPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <>
      <PageHeader
        title="Proyectos"
        breadcrumbs={[
          { label: 'Panel', href: '/dashboard' },
          { label: 'Proyectos' },
        ]}
      />
      <div className="flex-1 p-6">
        <ProjectsList projects={projects || []} />
      </div>
    </>
  )
}
