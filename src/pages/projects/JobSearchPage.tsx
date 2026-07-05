import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Search,
  MapPin,
  Building2,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  FolderPlus,
  ChevronDown,
  ChevronUp,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { SelectField } from '@/components/forms'
import { Button } from '@/components/ui/button'
import { useJobSearch, useScrapeContact, useImportJobAsProject } from '@/api/hooks'
import type { JobSearchResult, ContactInfo } from '@/api/hooks'
import type { ProjectInput } from '@/api/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_OPTIONS = [
  { label: 'All categories', value: '' },
  { label: 'Technology', value: 'Technology' },
  { label: 'Engineering', value: 'Engineering' },
  { label: 'Health', value: 'Health' },
  { label: 'Education', value: 'Education' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Commerce', value: 'Commerce' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'Design', value: 'Design' },
  { label: 'Administration', value: 'Administration' },
]

const LOCATION_OPTIONS = [
  { label: 'Any location', value: '' },
  { label: 'Remote', value: 'Remote' },
  { label: 'On-site', value: 'On-site' },
  { label: 'Hybrid', value: 'Hybrid' },
]

const LIMIT_OPTIONS = [
  { label: '10 results', value: '10' },
  { label: '15 results', value: '15' },
  { label: '25 results', value: '25' },
]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface ContactInfoPanelProps {
  jobUrl: string
  preloaded?: ContactInfo
}

function ContactInfoPanel({ jobUrl, preloaded }: ContactInfoPanelProps) {
  const [open, setOpen] = useState(false)
  const [contact, setContact] = useState<ContactInfo | null>(preloaded ?? null)
  const scrape = useScrapeContact()

  const handleToggle = async () => {
    if (!open && !contact) {
      try {
        const result = await scrape.mutateAsync(jobUrl)
        setContact(result)
      } catch {
        // error shown via scrape.isError
      }
    }
    setOpen((prev) => !prev)
  }

  const hasData = contact && (contact.email || contact.phone || contact.website || contact.contactPage)

  return (
    <div>
      <button
        id={`contact-toggle-${encodeURIComponent(jobUrl)}`}
        type="button"
        onClick={() => void handleToggle()}
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        disabled={scrape.isPending}
      >
        {scrape.isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : open ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
        View contact info
      </button>

      {open && (
        <div className="mt-3 rounded-xl border border-border bg-muted/40 p-4">
          {scrape.isError ? (
            <p className="text-sm text-destructive">
              Could not load contact info. Try again later.
            </p>
          ) : hasData ? (
            <ul className="space-y-2">
              {contact?.email && (
                <li className="flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="truncate text-foreground underline-offset-2 hover:underline"
                  >
                    {contact.email}
                  </a>
                </li>
              )}
              {contact?.phone && (
                <li className="flex items-center gap-2 text-sm">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-foreground underline-offset-2 hover:underline"
                  >
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact?.website && (
                <li className="flex items-center gap-2 text-sm">
                  <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <a
                    href={contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-foreground underline-offset-2 hover:underline"
                  >
                    {contact.website}
                  </a>
                </li>
              )}
              {contact?.contactPage && contact.contactPage !== contact.website && (
                <li className="flex items-center gap-2 text-sm">
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <a
                    href={contact.contactPage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-foreground underline-offset-2 hover:underline"
                  >
                    Contact page
                  </a>
                </li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No contact information found on this page.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

interface ImportButtonProps {
  job: JobSearchResult
}

function ImportButton({ job }: ImportButtonProps) {
  const importMutation = useImportJobAsProject()
  const [imported, setImported] = useState(false)

  const handleImport = async () => {
    const body: ProjectInput = {
      title: job.title,
      description: job.description || `Job offer from ${job.company} — ${job.url}`,
      organizationName: job.company,
      location: job.location,
      categories: job.categories,
      publicSafe: false,
    }
    try {
      await importMutation.mutateAsync(body)
      setImported(true)
    } catch {
      // error is available via importMutation.isError
    }
  }

  if (imported) {
    return (
      <span className="text-sm font-medium text-green-600 dark:text-green-400">
        ✓ Imported
      </span>
    )
  }

  return (
    <Button
      id={`import-job-${encodeURIComponent(job.url)}`}
      variant="outline"
      size="sm"
      onClick={() => void handleImport()}
      disabled={importMutation.isPending}
    >
      {importMutation.isPending ? (
        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
      ) : (
        <FolderPlus className="mr-1.5 h-3.5 w-3.5" />
      )}
      Import as project
    </Button>
  )
}

interface JobResultCardProps {
  job: JobSearchResult
  index: number
}

function JobResultCard({ job, index }: JobResultCardProps) {
  const truncatedDescription =
    job.description.length > 200
      ? job.description.slice(0, 200).trimEnd() + '…'
      : job.description

  return (
    <article
      id={`job-result-${index}`}
      className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          {/* Title + company */}
          <div className="flex flex-wrap items-start gap-2">
            <h2 className="text-lg font-semibold text-foreground">{job.title}</h2>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              {job.company}
            </span>
            {job.location && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {job.location}
              </span>
            )}
          </div>

          {/* Description */}
          {truncatedDescription && (
            <p className="mt-2 text-sm text-muted-foreground">{truncatedDescription}</p>
          )}

          {/* Categories */}
          {job.categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {job.categories.map((cat) => (
                <span
                  key={cat}
                  className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-foreground"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* Contact info (lazy-loaded) */}
          <div className="mt-4">
            <ContactInfoPanel jobUrl={job.url} preloaded={job.contactInfo} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-col items-end gap-2 sm:ml-4">
          <Button asChild variant="secondary" size="sm">
            <a
              id={`view-job-${index}`}
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              View offer
            </a>
          </Button>
          <ImportButton job={job} />
        </div>
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function JobSearchPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [limit, setLimit] = useState('10')

  const jobSearch = useJobSearch()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    jobSearch.mutate({
      query: query.trim(),
      categories: category ? [category] : undefined,
      location: location || undefined,
      limit: Number(limit),
    })
  }

  const results = jobSearch.data?.results ?? []
  const hasSearched = jobSearch.isSuccess || jobSearch.isError

  return (
    <div className="mx-auto max-w-[var(--page-max-width)] px-4 py-10 sm:px-10">
      {/* Back navigation */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/projects">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to projects
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Find Jobs"
        description="Search job listings from across the web. Filter by role, category, or location — then import matching offers as projects."
      />

      {/* Search form */}
      <form
        id="job-search-form"
        onSubmit={handleSearch}
        className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-sm)]"
      >
        {/* Primary search input */}
        <div className="mb-4">
          <label
            htmlFor="job-search-query"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Job title or keywords
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="job-search-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Software engineer, Marketing coordinator…"
              className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Filter row */}
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField
            label="Category"
            name="job-category"
            value={category}
            options={CATEGORY_OPTIONS}
            onChange={(e) => setCategory(e.target.value as string)}
          />
          <SelectField
            label="Modality / Location"
            name="job-location"
            value={location}
            options={LOCATION_OPTIONS}
            onChange={(e) => setLocation(e.target.value as string)}
          />
          <SelectField
            label="Max results"
            name="job-limit"
            value={limit}
            options={LIMIT_OPTIONS}
            onChange={(e) => setLimit(e.target.value as string)}
          />
        </div>

        {/* Submit */}
        <div className="mt-6 flex items-center justify-between gap-4">
          {jobSearch.isError && (
            <p className="text-sm text-destructive">
              {(jobSearch.error as Error)?.message ?? 'Search failed. Please try again.'}
            </p>
          )}
          <div className="ml-auto">
            <Button
              id="job-search-submit"
              type="submit"
              disabled={!query.trim() || jobSearch.isPending}
            >
              {jobSearch.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching…
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Results */}
      {hasSearched && (
        <section id="job-search-results" aria-label="Search results">
          {jobSearch.isPending ? (
            // Skeleton loading cards
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-3xl border border-border bg-card"
                />
              ))}
            </div>
          ) : jobSearch.isError ? null : results.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-12 text-center">
              <Search className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" />
              <p className="text-base font-medium text-foreground">No results found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your keywords or filters.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </p>
              <div className="grid gap-4">
                {results.map((job, i) => (
                  <JobResultCard key={`${job.url}-${i}`} job={job} index={i} />
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  )
}
