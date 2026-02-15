"use client"

import { useState } from "react"
import {
  FileText,
  Plus,
  Search,
  Filter,
  X,
  Calendar,
  MapPin,
  User,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import {
  mockBOs,
  occurrenceTypes,
  corporations,
  type BoletimOcorrencia,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { sendBOWebhook } from "@/lib/discord-webhook"

function getStatusInfo(status: string) {
  switch (status) {
    case "aberto":
      return { label: "Aberto", className: "bg-accent/10 text-accent" }
    case "em_andamento":
      return { label: "Em Andamento", className: "bg-chart-4/10 text-chart-4" }
    case "fechado":
      return { label: "Fechado", className: "bg-chart-3/10 text-chart-3" }
    default:
      return { label: status, className: "bg-muted text-muted-foreground" }
  }
}

export function BoletinsContent() {
  const { user } = useAuth()
  const [bos, setBos] = useState<BoletimOcorrencia[]>(mockBOs)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCorp, setFilterCorp] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [selectedBO, setSelectedBO] = useState<BoletimOcorrencia | null>(null)
  const [formData, setFormData] = useState({
    location: "",
    type: "",
    involved: "",
    description: "",
  })

  const filteredBOs = bos.filter((bo) => {
    const matchesSearch =
      !searchQuery ||
      bo.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bo.officer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bo.involved.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bo.type.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCorp = !filterCorp || bo.corporation === filterCorp
    const matchesStatus = !filterStatus || bo.status === filterStatus
    return matchesSearch && matchesCorp && matchesStatus
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const newBO: BoletimOcorrencia = {
      id: String(bos.length + 1),
      number: `BO-2025-${String(bos.length + 1).padStart(4, "0")}`,
      date: new Date().toISOString(),
      officer: user?.name || "",
      officerId: user?.id || "",
      location: formData.location,
      type: formData.type,
      involved: formData.involved,
      description: formData.description,
      status: "aberto",
      corporation: user?.corporation || "",
    }
    setBos([newBO, ...bos])
    setShowForm(false)
    setFormData({ location: "", type: "", involved: "", description: "" })
    sendBOWebhook(
      newBO.number,
      newBO.type,
      newBO.location,
      newBO.involved,
      newBO.description,
      user?.name || "",
      user?.id || "",
      user?.corporation || ""
    )
    toast.success(`${newBO.number} registrado com sucesso!`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Boletins de Ocorrencia</h1>
          <p className="text-sm text-muted-foreground">
            Registro e consulta de BOs do sistema
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Novo BO
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por numero, nome, envolvido ou tipo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-border bg-secondary/50 pl-9 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterCorp} onValueChange={setFilterCorp}>
            <SelectTrigger className="w-44 border-border bg-secondary/50 text-foreground">
              <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Corporacao" />
            </SelectTrigger>
            <SelectContent className="border-border bg-card text-foreground">
              <SelectItem value="all">Todas</SelectItem>
              {corporations.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 border-border bg-secondary/50 text-foreground">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-border bg-card text-foreground">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="aberto">Aberto</SelectItem>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="fechado">Fechado</SelectItem>
            </SelectContent>
          </Select>
          {(filterCorp || filterStatus || searchQuery) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setFilterCorp("")
                setFilterStatus("")
                setSearchQuery("")
              }}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {filteredBOs.length} resultado(s) encontrado(s)
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Numero
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tipo
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                  Local
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                  Policial
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBOs.map((bo) => {
                const statusInfo = getStatusInfo(bo.status)
                return (
                  <tr
                    key={bo.id}
                    className="cursor-pointer transition-colors hover:bg-secondary/20"
                    onClick={() => setSelectedBO(bo)}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-medium text-primary">
                        {bo.number}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{bo.type}</td>
                    <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                      {bo.location}
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-muted-foreground lg:table-cell">
                      {bo.officer}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                          statusInfo.className
                        )}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                      {new Date(bo.date).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create BO Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card text-foreground sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <FileText className="h-5 w-5 text-primary" />
              Registrar Novo BO
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Numero do BO</Label>
                <Input
                  value={`BO-2025-${String(bos.length + 1).padStart(4, "0")}`}
                  disabled
                  className="border-border bg-secondary/30 font-mono text-sm text-muted-foreground"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Data/Hora</Label>
                <Input
                  value={new Date().toLocaleString("pt-BR")}
                  disabled
                  className="border-border bg-secondary/30 text-sm text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">Policial Responsavel</Label>
              <Input
                value={`${user?.name} (ID: ${user?.id}) - ${user?.corporation}`}
                disabled
                className="border-border bg-secondary/30 text-sm text-muted-foreground"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Local da Ocorrencia</Label>
              <Input
                placeholder="Ex: Av. Central, Centro"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Tipo da Ocorrencia</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v })}
              >
                <SelectTrigger className="border-border bg-secondary/50 text-foreground">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  {occurrenceTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Envolvidos</Label>
              <Input
                placeholder="Ex: Joao Silva (suspeito), Maria Clara (vitima)"
                value={formData.involved}
                onChange={(e) => setFormData({ ...formData, involved: e.target.value })}
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Descricao Detalhada</Label>
              <Textarea
                placeholder="Descreva a ocorrencia com o maximo de detalhes..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[120px] border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForm(false)}
                className="flex-1 text-muted-foreground hover:text-foreground"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Registrar BO
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View BO Detail Dialog */}
      <Dialog open={!!selectedBO} onOpenChange={() => setSelectedBO(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card text-foreground sm:max-w-lg">
          {selectedBO && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-foreground">
                  <FileText className="h-5 w-5 text-primary" />
                  {selectedBO.number}
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      getStatusInfo(selectedBO.status).className
                    )}
                  >
                    {getStatusInfo(selectedBO.status).label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {selectedBO.corporation}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Data/Hora</p>
                      <p className="text-sm text-foreground">
                        {new Date(selectedBO.date).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Tipo</p>
                      <p className="text-sm text-foreground">{selectedBO.type}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Local</p>
                      <p className="text-sm text-foreground">{selectedBO.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Policial</p>
                      <p className="text-sm text-foreground">
                        {selectedBO.officer} (ID: {selectedBO.officerId})
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Envolvidos</p>
                  <p className="text-sm text-foreground">{selectedBO.involved}</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Descricao</p>
                  <p className="text-sm leading-relaxed text-foreground">
                    {selectedBO.description}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
