"use client"

import { useState } from "react"
import {
  Shield,
  UserCheck,
  UserX,
  Users,
  Settings,
  Clock,
  ChevronRight,
  ChevronDown,
  Building,
  Star,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Lock,
  Unlock,
  Save,
  Swords,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import {
  mockOfficers,
  mockActivityLog,
  mockCorporationConfigs,
  allPermissions,
  type Officer,
  type CorporationConfig,
  type RankConfig,
  type Permission,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  sendApprovalWebhook,
  sendRejectionWebhook,
  sendRemovalWebhook,
  sendCorpWebhook,
} from "@/lib/discord-webhook"

type AdminTab = "officers" | "corporations" | "permissions" | "logs"

function getRoleBadge(role: string) {
  switch (role) {
    case "admin":
      return { label: "Admin", className: "bg-accent/10 text-accent" }
    case "officer":
      return { label: "Policial", className: "bg-primary/10 text-primary" }
    case "pending":
      return { label: "Pendente", className: "bg-chart-4/10 text-chart-4" }
    default:
      return { label: role, className: "bg-muted text-muted-foreground" }
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "online":
      return { label: "Online", className: "bg-chart-3/10 text-chart-3" }
    case "patrol":
      return { label: "Patrulha", className: "bg-chart-4/10 text-chart-4" }
    case "offline":
      return { label: "Offline", className: "bg-muted text-muted-foreground" }
    default:
      return { label: status, className: "bg-muted text-muted-foreground" }
  }
}

export function AdminContent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<AdminTab>("officers")
  const [officers, setOfficers] = useState<Officer[]>(mockOfficers)
  const [corpConfigs, setCorpConfigs] = useState<CorporationConfig[]>(mockCorporationConfigs)
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null)
  const [editRank, setEditRank] = useState("")
  const [editCorporation, setEditCorporation] = useState("")

  // New corp dialog
  const [showNewCorp, setShowNewCorp] = useState(false)
  const [newCorpName, setNewCorpName] = useState("")
  const [newCorpColor, setNewCorpColor] = useState("#1e40af")

  // New rank dialog
  const [showNewRank, setShowNewRank] = useState(false)
  const [newRankCorp, setNewRankCorp] = useState("")
  const [newRankName, setNewRankName] = useState("")
  const [newRankLevel, setNewRankLevel] = useState("")

  // Permissions editing
  const [expandedCorp, setExpandedCorp] = useState<string | null>(null)
  const [expandedRank, setExpandedRank] = useState<string | null>(null)

  // Edit corp dialog
  const [editingCorp, setEditingCorp] = useState<CorporationConfig | null>(null)
  const [editCorpName, setEditCorpName] = useState("")
  const [editCorpColor, setEditCorpColor] = useState("")

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <AlertTriangle className="h-16 w-16 text-accent/40" />
        <h2 className="text-xl font-bold text-foreground">Acesso Restrito</h2>
        <p className="text-sm text-muted-foreground">
          Apenas administradores podem acessar esta secao.
        </p>
      </div>
    )
  }

  const pendingOfficers = officers.filter((o) => o.role === "pending")
  const activeOfficers = officers.filter((o) => o.role !== "pending")

  const handleApprove = (officerId: string) => {
    const officer = officers.find((o) => o.id === officerId)
    setOfficers(
      officers.map((o) =>
        o.id === officerId ? { ...o, role: "officer" as const } : o
      )
    )
    if (officer) {
      sendApprovalWebhook(officer.name, officer.id, officer.corporation, officer.rank, user?.name || "")
    }
    toast.success("Policial aprovado com sucesso!")
  }

  const handleReject = (officerId: string) => {
    const officer = officers.find((o) => o.id === officerId)
    if (officer) {
      sendRejectionWebhook(officer.name, officer.id, user?.name || "")
    }
    setOfficers(officers.filter((o) => o.id !== officerId))
    toast.success("Cadastro rejeitado.")
  }

  const handleRemove = (officerId: string) => {
    const officer = officers.find((o) => o.id === officerId)
    if (officer) {
      sendRemovalWebhook(officer.name, officer.id, officer.corporation, user?.name || "")
    }
    setOfficers(officers.filter((o) => o.id !== officerId))
    toast.success("Policial removido do sistema.")
  }

  const handleEditSave = () => {
    if (!editingOfficer) return
    setOfficers(
      officers.map((o) =>
        o.id === editingOfficer.id
          ? { ...o, rank: editRank || o.rank, corporation: editCorporation || o.corporation }
          : o
      )
    )
    setEditingOfficer(null)
    toast.success("Dados atualizados com sucesso!")
  }

  const handleCreateCorp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCorpName.trim()) return
    if (corpConfigs.find((c) => c.name === newCorpName.trim())) {
      toast.error("Ja existe uma forca armada com esse nome.")
      return
    }
    const newCorp: CorporationConfig = {
      name: newCorpName.trim(),
      color: newCorpColor,
      ranks: [
        { name: "Soldado", level: 1, permissions: ["criar_bo", "criar_apreensao", "consultar_criminal"] },
        { name: "Comandante", level: 2, permissions: allPermissions.map((p) => p.key) },
      ],
    }
    sendCorpWebhook(newCorpName.trim(), user?.name || "")
    setCorpConfigs([...corpConfigs, newCorp])
    setNewCorpName("")
    setNewCorpColor("#1e40af")
    setShowNewCorp(false)
    toast.success("Forca armada criada com sucesso!")
  }

  const handleCreateRank = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRankCorp || !newRankName.trim() || !newRankLevel) return
    const corp = corpConfigs.find((c) => c.name === newRankCorp)
    if (!corp) return
    if (corp.ranks.find((r) => r.name === newRankName.trim())) {
      toast.error("Ja existe uma patente com esse nome nesta forca.")
      return
    }
    const newRank: RankConfig = {
      name: newRankName.trim(),
      level: parseInt(newRankLevel),
      permissions: ["criar_bo", "criar_apreensao", "consultar_criminal"],
    }
    setCorpConfigs(
      corpConfigs.map((c) =>
        c.name === newRankCorp
          ? { ...c, ranks: [...c.ranks, newRank].sort((a, b) => a.level - b.level) }
          : c
      )
    )
    setNewRankName("")
    setNewRankLevel("")
    setShowNewRank(false)
    toast.success(`Patente "${newRank.name}" criada para ${newRankCorp}!`)
  }

  const togglePermission = (corpName: string, rankName: string, perm: Permission) => {
    setCorpConfigs(
      corpConfigs.map((c) => {
        if (c.name !== corpName) return c
        return {
          ...c,
          ranks: c.ranks.map((r) => {
            if (r.name !== rankName) return r
            const has = r.permissions.includes(perm)
            return {
              ...r,
              permissions: has
                ? r.permissions.filter((p) => p !== perm)
                : [...r.permissions, perm],
            }
          }),
        }
      })
    )
  }

  const handleDeleteRank = (corpName: string, rankName: string) => {
    setCorpConfigs(
      corpConfigs.map((c) => {
        if (c.name !== corpName) return c
        return { ...c, ranks: c.ranks.filter((r) => r.name !== rankName) }
      })
    )
    toast.success(`Patente "${rankName}" removida.`)
  }

  const handleDeleteCorp = (corpName: string) => {
    setCorpConfigs(corpConfigs.filter((c) => c.name !== corpName))
    toast.success(`Forca "${corpName}" removida.`)
  }

  const handleEditCorp = () => {
    if (!editingCorp) return
    setCorpConfigs(
      corpConfigs.map((c) =>
        c.name === editingCorp.name
          ? { ...c, name: editCorpName.trim() || c.name, color: editCorpColor || c.color }
          : c
      )
    )
    setEditingCorp(null)
    toast.success("Forca armada atualizada!")
  }

  const getRanksForCorp = (corpName: string) => {
    const corp = corpConfigs.find((c) => c.name === corpName)
    return corp?.ranks.map((r) => r.name) || []
  }

  const tabs: { key: AdminTab; label: string; icon: typeof Users }[] = [
    { key: "officers", label: "Policiais", icon: Users },
    { key: "corporations", label: "Forcas / Patentes", icon: Building },
    { key: "permissions", label: "Permissoes", icon: Lock },
    { key: "logs", label: "Logs", icon: Clock },
  ]

  const permissionCategories = [...new Set(allPermissions.map((p) => p.category))]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Administracao</h1>
        <p className="text-sm text-muted-foreground">
          Gerenciamento completo de policiais, forcas armadas, patentes e permissoes
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{activeOfficers.length}</p>
            <p className="text-xs text-muted-foreground">Policiais Ativos</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
            <UserCheck className="h-5 w-5 text-chart-4" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{pendingOfficers.length}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
            <Swords className="h-5 w-5 text-chart-3" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{corpConfigs.length}</p>
            <p className="text-xs text-muted-foreground">Forcas Armadas</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <Star className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {corpConfigs.reduce((acc, c) => acc + c.ranks.length, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Patentes Total</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
              activeTab === tab.key
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ========== OFFICERS TAB ========== */}
      {activeTab === "officers" && (
        <div className="flex flex-col gap-6">
          {pendingOfficers.length > 0 && (
            <div className="rounded-xl border border-chart-4/30 bg-card">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                <UserCheck className="h-4 w-4 text-chart-4" />
                <h2 className="text-sm font-semibold text-foreground">
                  Aprovacoes Pendentes ({pendingOfficers.length})
                </h2>
              </div>
              <div className="divide-y divide-border">
                {pendingOfficers.map((officer) => (
                  <div key={officer.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-foreground">
                      {officer.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{officer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ID: {officer.id} | {officer.rank} - {officer.corporation}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(officer.id)}
                        className="gap-1.5 bg-chart-3/10 text-chart-3 hover:bg-chart-3/20"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Aprovar</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReject(officer.id)}
                        className="gap-1.5 bg-accent/10 text-accent hover:bg-accent/20"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Rejeitar</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">
                Todos os Policiais ({activeOfficers.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Forca</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">Patente</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cargo</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activeOfficers.map((officer) => {
                    const roleBadge = getRoleBadge(officer.role)
                    const statusBadge = getStatusBadge(officer.status)
                    return (
                      <tr key={officer.id} className="transition-colors hover:bg-secondary/20">
                        <td className="px-4 py-3 font-mono text-sm text-primary">{officer.id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{officer.name}</td>
                        <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">{officer.corporation}</td>
                        <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">{officer.rank}</td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium", roleBadge.className)}>
                            {roleBadge.label}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 sm:table-cell">
                          <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium", statusBadge.className)}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditingOfficer(officer)
                                setEditRank(officer.rank)
                                setEditCorporation(officer.corporation)
                              }}
                              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                              title="Editar"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemove(officer.id)}
                              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent"
                              title="Remover"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========== CORPORATIONS & RANKS TAB ========== */}
      {activeTab === "corporations" && (
        <div className="flex flex-col gap-6">
          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setShowNewCorp(true)}
              size="sm"
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Swords className="h-3.5 w-3.5" />
              Nova Forca Armada
            </Button>
            <Button
              onClick={() => setShowNewRank(true)}
              size="sm"
              className="gap-1.5 bg-chart-4/10 text-chart-4 hover:bg-chart-4/20"
            >
              <Star className="h-3.5 w-3.5" />
              Nova Patente
            </Button>
          </div>

          {/* Corporation Cards */}
          <div className="flex flex-col gap-4">
            {corpConfigs.map((corp) => {
              const officerCount = officers.filter(
                (o) => o.corporation === corp.name && o.role !== "pending"
              ).length
              const isExpanded = expandedCorp === corp.name

              return (
                <div
                  key={corp.name}
                  className="overflow-hidden rounded-xl border border-border bg-card"
                >
                  {/* Corp Header */}
                  <button
                    onClick={() => setExpandedCorp(isExpanded ? null : corp.name)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/20"
                  >
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-lg"
                      style={{ backgroundColor: corp.color + "20" }}
                    >
                      <Swords className="h-5 w-5" style={{ color: corp.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{corp.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {corp.ranks.length} patente(s) | {officerCount} policial(is)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingCorp(corp)
                          setEditCorpName(corp.name)
                          setEditCorpColor(corp.color)
                        }}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        title="Editar forca"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCorp(corp.name)
                        }}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent/10 hover:text-accent"
                        title="Remover forca"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Ranks List (expanded) */}
                  {isExpanded && (
                    <div className="border-t border-border">
                      <div className="bg-secondary/20 px-5 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Patentes de {corp.name}
                        </p>
                      </div>
                      <div className="divide-y divide-border">
                        {corp.ranks.map((rank) => (
                          <div
                            key={rank.name}
                            className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-secondary/10"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
                              <Star className="h-3.5 w-3.5 text-chart-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground">{rank.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Nivel {rank.level} | {rank.permissions.length} permissao(oes)
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteRank(corp.name, rank.name)}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent/10 hover:text-accent"
                              title="Remover patente"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-border bg-secondary/10 px-5 py-3">
                        <button
                          onClick={() => {
                            setNewRankCorp(corp.name)
                            setShowNewRank(true)
                          }}
                          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Adicionar patente a {corp.name}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ========== PERMISSIONS TAB ========== */}
      {activeTab === "permissions" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-chart-4/30 bg-chart-4/5 p-3">
            <p className="flex items-center gap-2 text-xs font-medium text-chart-4">
              <Lock className="h-3.5 w-3.5" />
              Edite as permissoes de cada patente por forca armada. Clique para expandir.
            </p>
          </div>

          {corpConfigs.map((corp) => (
            <div key={corp.name} className="overflow-hidden rounded-xl border border-border bg-card">
              <button
                onClick={() => setExpandedCorp(expandedCorp === corp.name ? null : corp.name)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-secondary/20"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: corp.color + "20" }}
                >
                  <Shield className="h-4 w-4" style={{ color: corp.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{corp.name}</p>
                  <p className="text-xs text-muted-foreground">{corp.ranks.length} patentes</p>
                </div>
                {expandedCorp === corp.name ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {expandedCorp === corp.name && (
                <div className="border-t border-border">
                  {corp.ranks.map((rank) => {
                    const isRankExpanded = expandedRank === `${corp.name}-${rank.name}`
                    return (
                      <div key={rank.name} className="border-b border-border last:border-b-0">
                        <button
                          onClick={() =>
                            setExpandedRank(
                              isRankExpanded ? null : `${corp.name}-${rank.name}`
                            )
                          }
                          className="flex w-full items-center gap-3 bg-secondary/10 px-5 py-3 text-left transition-colors hover:bg-secondary/20"
                        >
                          <Star className="h-3.5 w-3.5 text-chart-4" />
                          <span className="flex-1 text-sm font-medium text-foreground">
                            {rank.name}
                            <span className="ml-2 text-xs text-muted-foreground">
                              (Nivel {rank.level} | {rank.permissions.length}/{allPermissions.length} perms)
                            </span>
                          </span>
                          {isRankExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </button>

                        {isRankExpanded && (
                          <div className="px-5 py-4">
                            {permissionCategories.map((cat) => (
                              <div key={cat} className="mb-4 last:mb-0">
                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                  {cat}
                                </p>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                  {allPermissions
                                    .filter((p) => p.category === cat)
                                    .map((perm) => {
                                      const hasPerm = rank.permissions.includes(perm.key)
                                      return (
                                        <button
                                          key={perm.key}
                                          onClick={() =>
                                            togglePermission(corp.name, rank.name, perm.key)
                                          }
                                          className={cn(
                                            "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-medium transition-all",
                                            hasPerm
                                              ? "border-chart-3/30 bg-chart-3/10 text-chart-3"
                                              : "border-border bg-secondary/20 text-muted-foreground hover:border-border/80"
                                          )}
                                        >
                                          {hasPerm ? (
                                            <Unlock className="h-3.5 w-3.5" />
                                          ) : (
                                            <Lock className="h-3.5 w-3.5" />
                                          )}
                                          {perm.label}
                                        </button>
                                      )
                                    })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ========== LOGS TAB ========== */}
      {activeTab === "logs" && (
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-chart-4" />
              <h2 className="text-sm font-semibold text-foreground">Log de Acoes do Sistema</h2>
            </div>
          </div>
          <div className="divide-y divide-border">
            {mockActivityLog.map((log) => (
              <div key={log.id} className="flex items-start gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/20">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-secondary">
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{log.action}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">{log.user}</span>
                    <span className="text-xs text-muted-foreground/40">|</span>
                    <span className="text-xs text-muted-foreground/60">
                      {new Date(log.timestamp).toLocaleString("pt-BR")}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase",
                        log.type === "bo"
                          ? "bg-primary/10 text-primary"
                          : log.type === "seizure"
                            ? "bg-chart-4/10 text-chart-4"
                            : log.type === "criminal"
                              ? "bg-accent/10 text-accent"
                              : log.type === "admin"
                                ? "bg-chart-3/10 text-chart-3"
                                : "bg-muted text-muted-foreground"
                      )}
                    >
                      {log.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== DIALOGS ========== */}

      {/* Edit Officer Dialog */}
      <Dialog open={!!editingOfficer} onOpenChange={() => setEditingOfficer(null)}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Edit3 className="h-5 w-5 text-primary" />
              Editar Policial
            </DialogTitle>
          </DialogHeader>
          {editingOfficer && (
            <div className="flex flex-col gap-4 pt-2">
              <div className="rounded-lg border border-border bg-secondary/30 p-3">
                <p className="text-sm font-medium text-foreground">{editingOfficer.name}</p>
                <p className="text-xs text-muted-foreground">
                  ID: {editingOfficer.id} | {editingOfficer.email}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Forca Armada</Label>
                <Select value={editCorporation} onValueChange={(val) => { setEditCorporation(val); setEditRank("") }}>
                  <SelectTrigger className="border-border bg-secondary/50 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card text-foreground">
                    {corpConfigs.map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Patente</Label>
                <Select value={editRank} onValueChange={setEditRank}>
                  <SelectTrigger className="border-border bg-secondary/50 text-foreground">
                    <SelectValue placeholder="Selecione a patente" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card text-foreground">
                    {getRanksForCorp(editCorporation).map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingOfficer(null)}
                  className="flex-1 text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleEditSave}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Corporation Dialog */}
      <Dialog open={showNewCorp} onOpenChange={setShowNewCorp}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Swords className="h-5 w-5 text-primary" />
              Nova Forca Armada
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCorp} className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Nome da Forca</Label>
              <Input
                placeholder="Ex: Policia Ambiental"
                value={newCorpName}
                onChange={(e) => setNewCorpName(e.target.value)}
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Cor Identificadora</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={newCorpColor}
                  onChange={(e) => setNewCorpColor(e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded-md border border-border bg-transparent"
                />
                <Input
                  value={newCorpColor}
                  onChange={(e) => setNewCorpColor(e.target.value)}
                  className="border-border bg-secondary/50 font-mono text-sm text-foreground"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Sera criada com as patentes padrao: Soldado e Comandante. Adicione mais na aba Forcas/Patentes.
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowNewCorp(false)}
                className="flex-1 text-muted-foreground hover:text-foreground"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Criar Forca
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Rank Dialog */}
      <Dialog open={showNewRank} onOpenChange={setShowNewRank}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Star className="h-5 w-5 text-chart-4" />
              Nova Patente
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateRank} className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Forca Armada</Label>
              <Select value={newRankCorp} onValueChange={setNewRankCorp}>
                <SelectTrigger className="border-border bg-secondary/50 text-foreground">
                  <SelectValue placeholder="Selecione a forca" />
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  {corpConfigs.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Nome da Patente</Label>
              <Input
                placeholder="Ex: Tenente-Coronel"
                value={newRankName}
                onChange={(e) => setNewRankName(e.target.value)}
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Nivel (hierarquia)</Label>
              <Input
                type="number"
                min="1"
                max="20"
                placeholder="Ex: 5"
                value={newRankLevel}
                onChange={(e) => setNewRankLevel(e.target.value)}
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                required
              />
              <p className="text-xs text-muted-foreground">
                Quanto maior o nivel, maior a hierarquia. As patentes sao ordenadas por nivel.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowNewRank(false)}
                className="flex-1 text-muted-foreground hover:text-foreground"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Criar Patente
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Corporation Dialog */}
      <Dialog open={!!editingCorp} onOpenChange={() => setEditingCorp(null)}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Edit3 className="h-5 w-5 text-primary" />
              Editar Forca Armada
            </DialogTitle>
          </DialogHeader>
          {editingCorp && (
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Nome</Label>
                <Input
                  value={editCorpName}
                  onChange={(e) => setEditCorpName(e.target.value)}
                  className="border-border bg-secondary/50 text-foreground"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Cor</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={editCorpColor}
                    onChange={(e) => setEditCorpColor(e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-md border border-border bg-transparent"
                  />
                  <Input
                    value={editCorpColor}
                    onChange={(e) => setEditCorpColor(e.target.value)}
                    className="border-border bg-secondary/50 font-mono text-sm text-foreground"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setEditingCorp(null)}
                  className="flex-1 text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleEditCorp}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
