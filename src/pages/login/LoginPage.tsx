import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { TextField, PasswordField } from '@/components/forms'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/auth/AuthProvider'
import { toastMutationError } from '@/lib/mutations'
import heroImage from '@/assets/hero.png'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await login({ username, password })
      await navigate({ to: '/' })
    } catch (error) {
      toastMutationError(error, 'Invalid credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex h-dvh items-center justify-center overflow-hidden px-4 py-4 sm:px-6 sm:py-6 bg-background">
      {/* Background blobs for premium depth */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse-slow -z-10" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-coral-magenta/10 blur-3xl animate-pulse-slow -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl -z-10" />

      <div className="grid h-full max-h-[720px] w-full max-w-5xl grid-rows-[minmax(10rem,14rem)_minmax(0,1fr)] overflow-hidden rounded-3xl border border-border bg-card/60 backdrop-blur-xl shadow-[var(--shadow-sm-3)] md:grid-cols-[minmax(0,48%)_minmax(360px,1fr)] md:grid-rows-1 page-entrance">
        <div className="relative min-h-0 overflow-hidden bg-muted">
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
          {/* Overlay to blend the image nicely */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-ink-navy/40 to-transparent pointer-events-none" />
        </div>
        <div className="flex min-h-0 items-center justify-center overflow-y-auto rounded-r-3xl bg-card/45 p-6 sm:p-8 md:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Sign in
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">Access the Social Hours Platform</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <TextField
                label="Username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
              <PasswordField
                label="Password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <Button type="submit" className="w-full gradient-btn font-medium rounded-lg h-10 mt-2" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
