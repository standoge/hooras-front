import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import {
  expandModuleDependencies,
  RECOMMENDED_DOMAIN_MODULES,
  type SetupModuleOption,
} from '@/api/setup'
import { useSetupModules, useSetupMutations, useSetupStatus } from '@/api/hooks/useSetup'
import { TextField, PasswordField } from '@/components/forms'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'

const STEPS = [
  { id: 'instance', label: 'Instancia' },
  { id: 'auth', label: 'Autenticación' },
  { id: 'student-data', label: 'Datos estudiantiles' },
  { id: 'modules', label: 'Módulos' },
  { id: 'admin', label: 'Administrador' },
  { id: 'summary', label: 'Resumen' },
] as const

type StepId = (typeof STEPS)[number]['id']

function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="mb-8 flex flex-wrap gap-2">
      {STEPS.map((step, index) => {
        const done = index < current
        const active = index === current
        return (
          <li
            key={step.id}
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
              active
                ? 'border-primary bg-primary/10 text-primary'
                : done
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : 'border-border text-muted-foreground'
            }`}
          >
            {done ? <CheckCircle2 className="size-3.5" /> : <Circle className="size-3.5" />}
            {step.label}
          </li>
        )
      })}
    </ol>
  )
}

function ConnectorStep({
  title,
  description,
  connectorType,
  modules,
  selectedKey,
  useDemo,
  externalUrl,
  onSelect,
  onUseDemoChange,
  onExternalUrlChange,
  onSave,
  isSaving,
}: {
  title: string
  description: string
  connectorType: string
  modules: SetupModuleOption[]
  selectedKey: string
  useDemo: boolean
  externalUrl: string
  onSelect: (key: string) => void
  onUseDemoChange: (value: boolean) => void
  onExternalUrlChange: (value: string) => void
  onSave: () => void
  isSaving: boolean
}) {
  const options = modules.filter((m) => m.moduleType === connectorType)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-3">
        {options.map((mod) => (
          <button
            key={mod.moduleKey}
            type="button"
            onClick={() => onSelect(mod.moduleKey)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              selectedKey === mod.moduleKey
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <div className="font-medium">{mod.displayName}</div>
            <p className="mt-1 text-sm text-muted-foreground">{mod.description}</p>
          </button>
        ))}
      </div>

      {selectedKey && (
        <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="use-demo">Usar proveedor demo integrado</Label>
              <p className="text-xs text-muted-foreground">
                Recomendado para evaluación sin sistemas externos.
              </p>
            </div>
            <Switch id="use-demo" checked={useDemo} onCheckedChange={onUseDemoChange} />
          </div>

          {!useDemo && (
            <TextField
              label="URL del proveedor externo"
              name="apiBaseUrl"
              value={externalUrl}
              onChange={(e) => onExternalUrlChange(e.target.value)}
              placeholder="https://auth.colegio.edu"
              required
            />
          )}
        </div>
      )}

      <Button onClick={onSave} disabled={!selectedKey || isSaving}>
        {isSaving ? 'Guardando…' : 'Guardar conector'}
      </Button>
    </div>
  )
}

export function SetupWizardPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data: status } = useSetupStatus()
  const { data: allModules = [] } = useSetupModules()
  const mutations = useSetupMutations()

  const [stepIndex, setStepIndex] = useState(0)
  const [collegeName, setCollegeName] = useState('')
  const [demoMode, setDemoMode] = useState(true)
  const [authModuleKey, setAuthModuleKey] = useState('dummy-auth-connector')
  const [studentModuleKey, setStudentModuleKey] = useState('dummy-student-data-connector')
  const [authUseDemo, setAuthUseDemo] = useState(true)
  const [studentUseDemo, setStudentUseDemo] = useState(true)
  const [authExternalUrl, setAuthExternalUrl] = useState('')
  const [studentExternalUrl, setStudentExternalUrl] = useState('')
  const [selectedModules, setSelectedModules] = useState<string[]>(RECOMMENDED_DOMAIN_MODULES)
  const [adminUsername, setAdminUsername] = useState('admin')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('')
  const [adminDisplayName, setAdminDisplayName] = useState('Administrador')
  const [adminEmail, setAdminEmail] = useState('')
  const [testResult, setTestResult] = useState<{ allOk: boolean; results: Array<{ type: string; ok: boolean; message?: string }> } | null>(null)

  const domainModules = useMemo(
    () =>
      allModules.filter(
        (m) => m.moduleType !== 'auth_connector' && m.moduleType !== 'student_data_connector',
      ),
    [allModules],
  )

  const resolvedModules = useMemo(
    () => expandModuleDependencies(selectedModules, allModules),
    [selectedModules, allModules],
  )

  const toggleModule = (moduleKey: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleKey) ? prev.filter((k) => k !== moduleKey) : [...prev, moduleKey],
    )
  }

  const handleError = (error: unknown, fallback: string) => {
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : fallback,
      variant: 'destructive',
    })
  }

  const saveInstance = async () => {
    try {
      await mutations.saveInstance.mutateAsync({
        collegeName,
        locale: 'es-SV',
        timezone: 'America/El_Salvador',
        demoMode,
      })
      setStepIndex(1)
    } catch (error) {
      handleError(error, 'No se pudo guardar la instancia.')
    }
  }

  const saveAuthConnector = async () => {
    try {
      await mutations.configureAuthConnector.mutateAsync({
        moduleKey: authModuleKey,
        useDemoProvider: authUseDemo,
        secrets: authUseDemo ? undefined : { apiBaseUrl: authExternalUrl },
      })
      setStepIndex(2)
    } catch (error) {
      handleError(error, 'No se pudo configurar el conector de autenticación.')
    }
  }

  const saveStudentConnector = async () => {
    try {
      await mutations.configureStudentDataConnector.mutateAsync({
        moduleKey: studentModuleKey,
        useDemoProvider: studentUseDemo,
        secrets: studentUseDemo ? undefined : { apiBaseUrl: studentExternalUrl },
      })
      setStepIndex(3)
    } catch (error) {
      handleError(error, 'No se pudo configurar el conector de datos estudiantiles.')
    }
  }

  const saveModules = async () => {
    try {
      await mutations.configureModules.mutateAsync(resolvedModules)
      setStepIndex(4)
    } catch (error) {
      handleError(error, 'No se pudieron configurar los módulos.')
    }
  }

  const saveAdmin = async () => {
    if (adminPassword !== adminPasswordConfirm) {
      toast({ title: 'Las contraseñas no coinciden', variant: 'destructive' })
      return
    }
    try {
      await mutations.createAdmin.mutateAsync({
        username: adminUsername,
        password: adminPassword,
        displayName: adminDisplayName,
        email: adminEmail || undefined,
      })
      setStepIndex(5)
    } catch (error) {
      handleError(error, 'No se pudo crear el administrador.')
    }
  }

  const runTests = async () => {
    try {
      const result = await mutations.testConnectors.mutateAsync()
      setTestResult(result)
    } catch (error) {
      handleError(error, 'No se pudieron probar los conectores.')
    }
  }

  const finishSetup = async () => {
    try {
      await mutations.complete.mutateAsync()
      toast({
        title: 'Instancia configurada',
        description: 'Inicia sesión con tu cuenta de administrador.',
      })
      await navigate({ to: '/login' })
    } catch (error) {
      handleError(error, 'No se pudo completar la configuración.')
    }
  }

  const currentStep = STEPS[stepIndex]?.id as StepId

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Configuración inicial</h1>
          <p className="mt-2 text-muted-foreground">
            Configure los módulos y conectores de su instancia de Horas Sociales.
          </p>
        </div>

        <StepIndicator current={stepIndex} />

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {currentStep === 'instance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Datos de la institución</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Identifique su colegio o universidad en la plataforma.
                </p>
              </div>
              <TextField
                label="Nombre del colegio"
                name="collegeName"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="Universidad de El Salvador"
                required
              />
              <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
                <div>
                  <Label>Modo demostración</Label>
                  <p className="text-xs text-muted-foreground">
                    Incluye usuarios y datos de ejemplo para pruebas.
                  </p>
                </div>
                <Switch checked={demoMode} onCheckedChange={setDemoMode} />
              </div>
              <Button onClick={saveInstance} disabled={!collegeName.trim() || mutations.saveInstance.isPending}>
                Continuar
              </Button>
            </div>
          )}

          {currentStep === 'auth' && (
            <ConnectorStep
              title="Conector de autenticación"
              description="Seleccione cómo los usuarios iniciarán sesión en la plataforma."
              connectorType="auth_connector"
              modules={allModules}
              selectedKey={authModuleKey}
              useDemo={authUseDemo}
              externalUrl={authExternalUrl}
              onSelect={setAuthModuleKey}
              onUseDemoChange={setAuthUseDemo}
              onExternalUrlChange={setAuthExternalUrl}
              onSave={saveAuthConnector}
              isSaving={mutations.configureAuthConnector.isPending}
            />
          )}

          {currentStep === 'student-data' && (
            <ConnectorStep
              title="Conector de datos estudiantiles"
              description="Conecte el sistema académico para consultar perfiles y progreso."
              connectorType="student_data_connector"
              modules={allModules}
              selectedKey={studentModuleKey}
              useDemo={studentUseDemo}
              externalUrl={studentExternalUrl}
              onSelect={setStudentModuleKey}
              onUseDemoChange={setStudentUseDemo}
              onExternalUrlChange={setStudentExternalUrl}
              onSave={saveStudentConnector}
              isSaving={mutations.configureStudentDataConnector.isPending}
            />
          )}

          {currentStep === 'modules' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Módulos de dominio</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Active las funcionalidades que necesita su institución.
                </p>
              </div>

              {(['recommended', 'optional'] as const).map((tier) => {
                const items = domainModules.filter((m) => m.setupTier === tier)
                if (!items.length) return null
                return (
                  <div key={tier} className="space-y-3">
                    <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                      {tier === 'recommended' ? 'Recomendados' : 'Opcionales'}
                    </h3>
                    {items.map((mod) => (
                      <label
                        key={mod.moduleKey}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 hover:bg-muted/30"
                      >
                        <Checkbox
                          checked={selectedModules.includes(mod.moduleKey)}
                          onCheckedChange={() => toggleModule(mod.moduleKey)}
                        />
                        <div>
                          <div className="font-medium">{mod.displayName}</div>
                          <p className="text-sm text-muted-foreground">{mod.description}</p>
                          {mod.dependencies.length > 0 && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Dependencias: {mod.dependencies.join(', ')}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )
              })}

              <p className="text-xs text-muted-foreground">
                Módulos que se instalarán: {resolvedModules.join(', ')}
              </p>

              <Button onClick={saveModules} disabled={mutations.configureModules.isPending}>
                Continuar
              </Button>
            </div>
          )}

          {currentStep === 'admin' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Cuenta de administrador</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cree el primer usuario con permisos de administración.
                </p>
              </div>
              <TextField
                label="Usuario"
                name="adminUsername"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                required
              />
              <TextField
                label="Nombre para mostrar"
                name="adminDisplayName"
                value={adminDisplayName}
                onChange={(e) => setAdminDisplayName(e.target.value)}
              />
              <TextField
                label="Correo electrónico"
                name="adminEmail"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
              <PasswordField
                label="Contraseña"
                name="adminPassword"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
              <PasswordField
                label="Confirmar contraseña"
                name="adminPasswordConfirm"
                value={adminPasswordConfirm}
                onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                required
              />
              <Button
                onClick={saveAdmin}
                disabled={
                  !adminUsername || !adminPassword || mutations.createAdmin.isPending
                }
              >
                Continuar
              </Button>
            </div>
          )}

          {currentStep === 'summary' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Resumen y confirmación</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Revise la configuración antes de activar la instancia.
                </p>
              </div>

              <ul className="space-y-2 text-sm">
                {[
                  { label: 'Institución', ok: status?.steps.instance },
                  { label: 'Conector de autenticación', ok: status?.steps.authConnector },
                  { label: 'Conector de datos estudiantiles', ok: status?.steps.studentDataConnector },
                  { label: 'Módulos instalados', ok: status?.steps.modules },
                  { label: 'Administrador creado', ok: status?.steps.admin },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-2">
                    {item.ok ? (
                      <CheckCircle2 className="size-4 text-emerald-600" />
                    ) : (
                      <Circle className="size-4 text-muted-foreground" />
                    )}
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={runTests} disabled={mutations.testConnectors.isPending}>
                  {mutations.testConnectors.isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Probando…
                    </>
                  ) : (
                    'Probar conectores'
                  )}
                </Button>
                <Button onClick={finishSetup} disabled={mutations.complete.isPending}>
                  {mutations.complete.isPending ? 'Finalizando…' : 'Completar configuración'}
                </Button>
              </div>

              {testResult && (
                <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
                  {testResult.results.map((r) => (
                    <div key={r.type} className={r.ok ? 'text-emerald-700' : 'text-destructive'}>
                      {r.type}: {r.ok ? 'OK' : r.message ?? 'Error'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
