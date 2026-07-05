import { useState } from 'react'
import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
} from '@/api/hooks'
import { TextField, TextareaField } from '@/components/forms'
import { QueryState } from '@/components/feedback'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { toastMutationError, toastMutationSuccess } from '@/lib/mutations'
import type { Company, CompanyInput } from '@/api/types'
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'

const emptyForm: CompanyInput = {
  name: '',
  description: '',
  email: '',
  phone: '',
  website: '',
  address: '',
}

export function CompaniesPage() {
  const companiesQuery = useCompanies()
  const createMutation = useCreateCompany()
  const deleteMutation = useDeleteCompany()

  const [form, setForm] = useState<CompanyInput>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // hook for update (requires ID)
  const updateMutation = useUpdateCompany(editingId ?? '')

  const handleEditInit = (company: Company) => {
    setEditingId(company.id)
    setForm({
      name: company.name,
      description: company.description ?? '',
      email: company.email ?? '',
      phone: company.phone ?? '',
      website: company.website ?? '',
      address: company.address ?? '',
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return

    try {
      if (editingId) {
        await updateMutation.mutateAsync(form)
        toastMutationSuccess('Company updated')
      } else {
        await createMutation.mutateAsync(form)
        toastMutationSuccess('Company created')
      }
      setEditingId(null)
      setForm(emptyForm)
    } catch (error) {
      toastMutationError(error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company? Existing projects will remain but won\'t link to it.')) return
    try {
      await deleteMutation.mutateAsync(id)
      toastMutationSuccess('Company deleted')
      if (editingId === id) {
        handleCancelEdit()
      }
    } catch (error) {
      toastMutationError(error)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="mx-auto max-w-[var(--page-max-width)] px-4 py-10 sm:px-10 page-entrance">
      <PageHeader
        title="Companies & Organizations"
        description="Manage institutions, NGOs, and companies that provide projects for social hours."
      />

      <div className="grid gap-8 lg:grid-cols-3 items-start">
        {/* Left Side: Companies list */}
        <div className="lg:col-span-2 space-y-6">
          <QueryState
            isLoading={companiesQuery.isLoading}
            isError={companiesQuery.isError}
            error={companiesQuery.error}
            isEmpty={!companiesQuery.data?.length}
            onRetry={() => void companiesQuery.refetch()}
            emptyTitle="No companies registered yet"
            emptyDescription="Create your first company using the form on the right."
          >
            <div className="grid gap-4 sm:grid-cols-1">
              {companiesQuery.data?.map((company: Company) => (
                <article
                  key={company.id}
                  className="group relative flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-sm-2)] transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-coral-magenta opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h2 className="text-lg font-bold leading-snug text-foreground flex items-center gap-2 group-hover:text-primary transition-colors duration-200">
                        <Building2 className="h-5 w-5 text-primary shrink-0" />
                        {company.name}
                      </h2>
                      <div className="flex items-center gap-1.5 opacity-80 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-muted"
                          onClick={() => handleEditInit(company)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/5"
                          onClick={() => void handleDelete(company.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {company.description ? (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {company.description}
                      </p>
                    ) : null}

                    <div className="grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground pt-3 border-t border-border/50">
                      {company.email ? (
                        <a
                          href={`mailto:${company.email}`}
                          className="flex items-center gap-2 hover:text-foreground transition-colors truncate"
                        >
                          <Mail className="h-4 w-4 shrink-0 opacity-70" />
                          <span>{company.email}</span>
                        </a>
                      ) : null}
                      {company.phone ? (
                        <div className="flex items-center gap-2 truncate">
                          <Phone className="h-4 w-4 shrink-0 opacity-70" />
                          <span>{company.phone}</span>
                        </div>
                      ) : null}
                      {company.website ? (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 hover:text-foreground transition-colors truncate"
                        >
                          <Globe className="h-4 w-4 shrink-0 opacity-70" />
                          <span>{company.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                        </a>
                      ) : null}
                      {company.address ? (
                        <div className="flex items-center gap-2 truncate">
                          <MapPin className="h-4 w-4 shrink-0 opacity-70" />
                          <span>{company.address}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </QueryState>
        </div>

        {/* Right Side: Create/Edit form card */}
        <div className="space-y-6">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-sm)]"
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/50">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                {editingId ? (
                  <>
                    <Pencil className="h-4 w-4 text-primary" />
                    Edit Company
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 text-primary" />
                    New Company
                  </>
                )}
              </h2>
              {editingId ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleCancelEdit}
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : null}
            </div>

            <div className="space-y-4">
              <TextField
                label="Name"
                name="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <TextareaField
                label="Description"
                name="description"
                value={form.description ?? ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={form.email ?? ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <TextField
                label="Phone"
                name="phone"
                value={form.phone ?? ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <TextField
                label="Website"
                name="website"
                type="url"
                placeholder="https://example.com"
                value={form.website ?? ''}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
              <TextareaField
                label="Address"
                name="address"
                value={form.address ?? ''}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div className="mt-6 flex gap-3">
              <Button type="submit" className="w-full gradient-btn font-semibold" disabled={isPending}>
                {isPending ? 'Saving…' : editingId ? 'Save Changes' : 'Create Company'}
              </Button>
              {editingId ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
