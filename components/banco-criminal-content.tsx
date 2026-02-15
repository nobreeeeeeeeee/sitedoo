"use client"

import { useState } from "react"
import {
  Database,
  Search,
  User,
  FileWarning,
  AlertTriangle,
  Clock,
  StickyNote,
  Plus,
  ChevronDown,
  ChevronRight,
  Shield,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { mockCriminals, type Criminal } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { sendCriminalWebhook } from "@/lib/discord-webhook"

function getWarrantStatusInfo(status: string) {
  switch (status) {
    case "ativo":
      return { label: "Ativo", className: "bg-accent/10 text-accent" }
    case "cumprido":
      return { label: "Cumprido", className: "bg-chart-3/10 text-chart-3" }
    case "expirado":
      return { label: "Expirado", className: "bg-muted text-muted-foreground" }
    default:
      return { label: status, className: "bg-muted text-muted-foreground" }
  }
}

export function BancoCriminalContent() {
  const { user } = useAuth()
  const [criminals] = useState<Criminal[]>(mockCriminals)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCriminal, setSelectedCriminal] = useState<Criminal | null>(null)
  const [showRegister, setShowRegister] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>("history")
  const [registerData, setRegisterData] = useState({
    name: "",
    alias: "",
    rg: "",
  })

  const filtered = criminals.filter((c) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.alias.toLowerCase().includes(q) ||
      c.rg.includes(q)
    )
  })

  const activeWarrants = criminals.reduce(
    (acc, c) => acc + c.warrants.filter((w) => w.status === "ativo").length,
    0
  )

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    sendCriminalWebhook(
      registerData.name,
      registerData.alias,
      registerData.rg,
      user?.name || ""
    )
    toast.success("Cidadao cadastrado no banco de dados criminal.")
    setShowRegister(false)
    setRegisterData({ name: "", alias: "", rg: "" })
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Banco de Dados Criminal</h1>
          <p className="text-sm text-muted-foreground">
            Consulta e registro de cidadaos no sistema
          </p>
        </div>
        <Button
          onClick={() => setShowRegister(true)}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Cadastrar Cidadao
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{criminals.length}</p>
            <p className="text-xs text-muted-foreground">Registrados</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <AlertTriangle className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{activeWarrants}</p>
            <p className="text-xs text-muted-foreground">Mandados Ativos</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
            <FileWarning className="h-5 w-5 text-chart-4" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {criminals.reduce((acc, c) => acc + c.history.length, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Ocorrencias</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Busca rapida: nome, apelido ou RG..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-border bg-secondary/50 pl-9 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* List */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">
              Cidadaos Registrados ({filtered.length})
            </h2>
          </div>
          <div className="divide-y divide-border">
            {filtered.map((criminal) => {
              const hasActiveWarrant = criminal.warrants.some((w) => w.status === "ativo")
              return (
                <button
                  key={criminal.id}
                  onClick={() => {
                    setSelectedCriminal(criminal)
                    setExpandedSection("history")
                  }}
                  className={cn(
                    "flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/20",
                    selectedCriminal?.id === criminal.id && "bg-secondary/30"
                  )}
                >
                  <div className="relative">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-sm font-bold text-foreground">
                      {criminal.name.charAt(0)}
                    </div>
                    {hasActiveWarrant && (
                      <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-card bg-accent animate-pulse-dot" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {criminal.name}
                      </p>
                      {hasActiveWarrant && (
                        <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                          Mandado Ativo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      &quot;{criminal.alias}&quot; - RG: {criminal.rg}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {criminal.history.length} ocorrencia(s)
                    </p>
                  </div>
                </button>
              )
            })}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
                <Database className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Nenhum resultado encontrado</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="rounded-xl border border-border bg-card">
          {selectedCriminal ? (
            <div className="flex flex-col">
              {/* Profile Header */}
              <div className="border-b border-border px-5 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-lg font-bold text-foreground">
                    {selectedCriminal.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {selectedCriminal.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Vulgo: &quot;{selectedCriminal.alias}&quot; | RG: {selectedCriminal.rg}
                    </p>
                  </div>
                </div>
              </div>

              {/* Expandable sections */}
              <div className="divide-y divide-border">
                {/* History */}
                <div>
                  <button
                    onClick={() => toggleSection("history")}
                    className="flex w-full items-center gap-2 px-5 py-3 text-left transition-colors hover:bg-secondary/20"
                  >
                    {expandedSection === "history" ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      Historico Criminal ({selectedCriminal.history.length})
                    </span>
                  </button>
                  {expandedSection === "history" && (
                    <div className="px-5 pb-4">
                      <div className="flex flex-col gap-2">
                        {selectedCriminal.history.map((record) => (
                          <div
                            key={record.id}
                            className="rounded-lg border border-border bg-secondary/20 p-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-accent">
                                {record.type}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(record.date).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-foreground">
                              {record.description}
                            </p>
                            <p className="mt-1 text-[10px] text-muted-foreground">
                              Policial: {record.officer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Warrants */}
                <div>
                  <button
                    onClick={() => toggleSection("warrants")}
                    className="flex w-full items-center gap-2 px-5 py-3 text-left transition-colors hover:bg-secondary/20"
                  >
                    {expandedSection === "warrants" ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <AlertTriangle className="h-4 w-4 text-chart-4" />
                    <span className="text-sm font-medium text-foreground">
                      Mandados ({selectedCriminal.warrants.length})
                    </span>
                  </button>
                  {expandedSection === "warrants" && (
                    <div className="px-5 pb-4">
                      {selectedCriminal.warrants.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {selectedCriminal.warrants.map((warrant) => {
                            const statusInfo = getWarrantStatusInfo(warrant.status)
                            return (
                              <div
                                key={warrant.id}
                                className="rounded-lg border border-border bg-secondary/20 p-3"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-foreground">
                                    {warrant.type}
                                  </span>
                                  <span
                                    className={cn(
                                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                                      statusInfo.className
                                    )}
                                  >
                                    {statusInfo.label}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-foreground">
                                  {warrant.description}
                                </p>
                                <p className="mt-1 text-[10px] text-muted-foreground">
                                  Emitido: {new Date(warrant.issuedDate).toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Nenhum mandado registrado.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <button
                    onClick={() => toggleSection("notes")}
                    className="flex w-full items-center gap-2 px-5 py-3 text-left transition-colors hover:bg-secondary/20"
                  >
                    {expandedSection === "notes" ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <StickyNote className="h-4 w-4 text-chart-3" />
                    <span className="text-sm font-medium text-foreground">
                      Anotacoes ({selectedCriminal.notes.length})
                    </span>
                  </button>
                  {expandedSection === "notes" && (
                    <div className="px-5 pb-4">
                      {selectedCriminal.notes.length > 0 ? (
                        <ul className="flex flex-col gap-1.5">
                          {selectedCriminal.notes.map((note, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 rounded-lg border border-border bg-secondary/20 p-3 text-xs text-foreground"
                            >
                              <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-chart-4" />
                              {note}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground">Nenhuma anotacao.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 px-5 py-20">
              <Shield className="h-12 w-12 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">
                Selecione um cidadao para visualizar seus dados
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Register Dialog */}
      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <User className="h-5 w-5 text-primary" />
              Cadastrar Cidadao
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegister} className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Nome Completo</Label>
              <Input
                placeholder="Nome do cidadao"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Apelido / Vulgo</Label>
                <Input
                  placeholder="Ex: Paulao"
                  value={registerData.alias}
                  onChange={(e) => setRegisterData({ ...registerData, alias: e.target.value })}
                  className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">RG</Label>
                <Input
                  placeholder="00.000.000-0"
                  value={registerData.rg}
                  onChange={(e) => setRegisterData({ ...registerData, rg: e.target.value })}
                  className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowRegister(false)}
                className="flex-1 text-muted-foreground hover:text-foreground"
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                Cadastrar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
