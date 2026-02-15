"use client"

import { useState } from "react"
import {
  Package,
  Plus,
  Search,
  Filter,
  X,
  Crosshair,
  Pill,
  Car,
  DollarSign,
  Calendar,
  MapPin,
  User,
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
import { mockSeizures, corporations, type Seizure } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { sendSeizureWebhook } from "@/lib/discord-webhook"

function getTypeIcon(type: string) {
  switch (type) {
    case "arma":
      return Crosshair
    case "droga":
      return Pill
    case "veiculo":
      return Car
    case "dinheiro":
      return DollarSign
    default:
      return Package
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case "arma":
      return "Arma"
    case "droga":
      return "Droga"
    case "veiculo":
      return "Veiculo"
    case "dinheiro":
      return "Dinheiro"
    default:
      return type
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case "arma":
      return "bg-accent/10 text-accent"
    case "droga":
      return "bg-chart-5/10 text-chart-5"
    case "veiculo":
      return "bg-primary/10 text-primary"
    case "dinheiro":
      return "bg-chart-3/10 text-chart-3"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function ApreensoesContent() {
  const { user } = useAuth()
  const [seizures, setSeizures] = useState<Seizure[]>(mockSeizures)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [selectedSeizure, setSelectedSeizure] = useState<Seizure | null>(null)
  const [formData, setFormData] = useState({
    type: "" as Seizure["type"],
    quantity: "",
    suspect: "",
    location: "",
    observations: "",
  })

  const filtered = seizures.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.suspect.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.quantity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.officer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !filterType || s.type === filterType
    const matchesStatus = !filterStatus || s.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const newSeizure: Seizure = {
      id: String(seizures.length + 1),
      type: formData.type,
      quantity: formData.quantity,
      suspect: formData.suspect,
      location: formData.location,
      officer: user?.name || "",
      officerId: user?.id || "",
      observations: formData.observations,
      status: "ativa",
      date: new Date().toISOString(),
      corporation: user?.corporation || "",
    }
    setSeizures([newSeizure, ...seizures])
    setShowForm(false)
    setFormData({ type: "" as Seizure["type"], quantity: "", suspect: "", location: "", observations: "" })
    sendSeizureWebhook(
      newSeizure.type,
      newSeizure.quantity,
      newSeizure.suspect,
      newSeizure.location,
      newSeizure.observations,
      user?.name || "",
      user?.id || "",
      user?.corporation || ""
    )
    toast.success("Apreensao registrada com sucesso!")
  }

  // Summary stats
  const totalArmas = seizures.filter((s) => s.type === "arma").length
  const totalDrogas = seizures.filter((s) => s.type === "droga").length
  const totalVeiculos = seizures.filter((s) => s.type === "veiculo").length
  const totalDinheiro = seizures.filter((s) => s.type === "dinheiro").length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Apreensoes</h1>
          <p className="text-sm text-muted-foreground">
            Registro e controle de materiais apreendidos
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nova Apreensao
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Armas", value: totalArmas, icon: Crosshair, color: "text-accent", bg: "bg-accent/10" },
          { label: "Drogas", value: totalDrogas, icon: Pill, color: "text-chart-5", bg: "bg-chart-5/10" },
          { label: "Veiculos", value: totalVeiculos, icon: Car, color: "text-primary", bg: "bg-primary/10" },
          { label: "Dinheiro", value: totalDinheiro, icon: DollarSign, color: "text-chart-3", bg: "bg-chart-3/10" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", item.bg)}>
              <item.icon className={cn("h-5 w-5", item.color)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por suspeito, quantidade ou policial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-border bg-secondary/50 pl-9 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-36 border-border bg-secondary/50 text-foreground">
              <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent className="border-border bg-card text-foreground">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="arma">Arma</SelectItem>
              <SelectItem value="droga">Droga</SelectItem>
              <SelectItem value="veiculo">Veiculo</SelectItem>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 border-border bg-secondary/50 text-foreground">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-border bg-card text-foreground">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ativa">Ativa</SelectItem>
              <SelectItem value="finalizada">Finalizada</SelectItem>
            </SelectContent>
          </Select>
          {(filterType || filterStatus || searchQuery) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setFilterType(""); setFilterStatus(""); setSearchQuery("") }}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quantidade</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Suspeito</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">Local</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">Policial</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => {
                const Icon = getTypeIcon(s.type)
                return (
                  <tr key={s.id} className="cursor-pointer transition-colors hover:bg-secondary/20" onClick={() => setSelectedSeizure(s)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("flex h-7 w-7 items-center justify-center rounded-md", getTypeColor(s.type).split(" ")[0])}>
                          <Icon className={cn("h-3.5 w-3.5", getTypeColor(s.type).split(" ")[1])} />
                        </div>
                        <span className="text-sm font-medium text-foreground">{getTypeLabel(s.type)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{s.quantity}</td>
                    <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">{s.suspect}</td>
                    <td className="hidden px-4 py-3 text-sm text-muted-foreground lg:table-cell">{s.location}</td>
                    <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">{s.officer}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium", s.status === "ativa" ? "bg-chart-4/10 text-chart-4" : "bg-chart-3/10 text-chart-3")}>
                        {s.status === "ativa" ? "Ativa" : "Finalizada"}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">{new Date(s.date).toLocaleDateString("pt-BR")}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card text-foreground sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Package className="h-5 w-5 text-primary" />
              Registrar Nova Apreensao
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Tipo de Apreensao</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as Seizure["type"] })}>
                <SelectTrigger className="border-border bg-secondary/50 text-foreground">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  <SelectItem value="arma">Arma</SelectItem>
                  <SelectItem value="droga">Droga</SelectItem>
                  <SelectItem value="veiculo">Veiculo</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Quantidade / Descricao</Label>
              <Input
                placeholder="Ex: 1 Pistola .380 + 12 municoes"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Suspeito</Label>
              <Input
                placeholder="Nome do suspeito"
                value={formData.suspect}
                onChange={(e) => setFormData({ ...formData, suspect: e.target.value })}
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Local</Label>
              <Input
                placeholder="Local da apreensao"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Observacoes</Label>
              <Textarea
                placeholder="Observacoes adicionais..."
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                className="min-h-[80px] border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1 text-muted-foreground hover:text-foreground">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                Registrar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!selectedSeizure} onOpenChange={() => setSelectedSeizure(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card text-foreground sm:max-w-lg">
          {selectedSeizure && (() => {
            const Icon = getTypeIcon(selectedSeizure.type)
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-foreground">
                    <Icon className="h-5 w-5 text-primary" />
                    Apreensao - {getTypeLabel(selectedSeizure.type)}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", selectedSeizure.status === "ativa" ? "bg-chart-4/10 text-chart-4" : "bg-chart-3/10 text-chart-3")}>
                      {selectedSeizure.status === "ativa" ? "Ativa" : "Finalizada"}
                    </span>
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", getTypeColor(selectedSeizure.type))}>
                      {getTypeLabel(selectedSeizure.type)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <Package className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Quantidade</p>
                        <p className="text-sm text-foreground">{selectedSeizure.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Suspeito</p>
                        <p className="text-sm text-foreground">{selectedSeizure.suspect}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Local</p>
                        <p className="text-sm text-foreground">{selectedSeizure.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Data</p>
                        <p className="text-sm text-foreground">{new Date(selectedSeizure.date).toLocaleString("pt-BR")}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Policial Responsavel</p>
                    <p className="text-sm text-foreground">{selectedSeizure.officer} (ID: {selectedSeizure.officerId}) - {selectedSeizure.corporation}</p>
                  </div>
                  {selectedSeizure.observations && (
                    <div className="rounded-lg border border-border bg-secondary/30 p-4">
                      <p className="mb-1 text-xs font-medium text-muted-foreground">Observacoes</p>
                      <p className="text-sm leading-relaxed text-foreground">{selectedSeizure.observations}</p>
                    </div>
                  )}
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
