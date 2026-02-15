"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Shield, Eye, EyeOff, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { corporations, ranks, mockOfficers } from "@/lib/mock-data"
import { sendLoginWebhook, sendRegistrationWebhook } from "@/lib/discord-webhook"

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [id, setId] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [registerData, setRegisterData] = useState({
    name: "",
    id: "",
    corporation: "",
    rank: "",
    email: "",
    password: "",
  })
  const { login, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const result = login(id, password)
    if (result.success) {
      toast.success(result.message)
      const officer = mockOfficers.find((o) => o.id === id)
      if (officer) {
        sendLoginWebhook(officer.name, officer.id, officer.corporation, officer.rank)
      }
      router.push("/dashboard")
    } else {
      toast.error(result.message)
    }
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    sendRegistrationWebhook(
      registerData.name,
      registerData.id,
      registerData.corporation,
      registerData.rank
    )
    toast.success("Cadastro enviado! Aguarde aprovacao do administrador.")
    setMode("login")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(30,64,175,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(30,64,175,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Central da Policia RP</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sistema MDT - Mobile Data Terminal</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-2xl shadow-primary/5">
          {mode === "login" ? (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground">Acesso ao Sistema</h2>
                <p className="text-sm text-muted-foreground">Insira suas credenciais policiais</p>
              </div>
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="officer-id" className="text-foreground">ID Policial</Label>
                  <Input
                    id="officer-id"
                    placeholder="Ex: 001"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password" className="text-foreground">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-border bg-secondary/50 pr-10 text-foreground placeholder:text-muted-foreground"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="mt-2 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Acessar Sistema
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Demo: Use ID 001 ou 002 com qualquer senha
                </p>
              </form>
              <div className="mt-6 border-t border-border pt-4">
                <button
                  onClick={() => setMode("register")}
                  className="flex w-full items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  Cadastrar novo policial
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground">Cadastro de Policial</h2>
                <p className="text-sm text-muted-foreground">Preencha seus dados para solicitar acesso</p>
              </div>
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Nome RP</Label>
                  <Input
                    placeholder="Seu nome no servidor"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">ID Policial</Label>
                    <Input
                      placeholder="Ex: 011"
                      value={registerData.id}
                      onChange={(e) => setRegisterData({ ...registerData, id: e.target.value })}
                      className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">E-mail</Label>
                    <Input
                      type="email"
                      placeholder="email@rp.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Corporacao</Label>
                    <Select
                      value={registerData.corporation}
                      onValueChange={(v) => setRegisterData({ ...registerData, corporation: v })}
                    >
                      <SelectTrigger className="border-border bg-secondary/50 text-foreground">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-card text-foreground">
                        {corporations.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Patente</Label>
                    <Select
                      value={registerData.rank}
                      onValueChange={(v) => setRegisterData({ ...registerData, rank: v })}
                    >
                      <SelectTrigger className="border-border bg-secondary/50 text-foreground">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-card text-foreground">
                        {ranks.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Senha</Label>
                  <Input
                    type="password"
                    placeholder="Crie uma senha"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
                <Button type="submit" className="mt-2 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Solicitar Cadastro
                </Button>
              </form>
              <div className="mt-6 border-t border-border pt-4">
                <button
                  onClick={() => setMode("login")}
                  className="flex w-full items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Voltar ao login
                </button>
              </div>
            </>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Central da Policia RP v1.0 - Sistema restrito a agentes autorizados
        </p>
      </div>
    </div>
  )
}
