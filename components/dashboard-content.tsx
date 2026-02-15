"use client"

import {
  FileText,
  Package,
  Users,
  AlertTriangle,
  Radio,
  Clock,
  Shield,
  TrendingUp,
  Inbox,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { mockBOs, mockSeizures, mockOfficers, mockActivityLog } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function getActivityIcon(type: string) {
  switch (type) {
    case "bo": return FileText
    case "seizure": return Package
    case "criminal": return Shield
    case "admin": return Users
    case "login": return Radio
    default: return Clock
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case "bo": return "text-primary"
    case "seizure": return "text-chart-4"
    case "criminal": return "text-accent"
    case "admin": return "text-chart-3"
    case "login": return "text-muted-foreground"
    default: return "text-muted-foreground"
  }
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getStatusLabel(status: string) {
  switch (status) {
    case "aberto": return { label: "Aberto", className: "bg-accent/10 text-accent" }
    case "em_andamento": return { label: "Em andamento", className: "bg-chart-4/10 text-chart-4" }
    case "fechado": return { label: "Fechado", className: "bg-chart-3/10 text-chart-3" }
    default: return { label: status, className: "bg-muted text-muted-foreground" }
  }
}

export function DashboardContent() {
  const { user } = useAuth()

  const today = new Date().toDateString()
  const bosToday = mockBOs.filter((b) => new Date(b.date).toDateString() === today).length
  const activeSeizures = mockSeizures.filter((s) => s.status === "ativa").length
  const activeOfficers = mockOfficers.filter((o) => (o.status === "online" || o.status === "patrol") && o.role !== "pending")
  const openBOs = mockBOs.filter((b) => b.status === "aberto").length
  const recentBOs = mockBOs.slice(0, 5)

  const stats = [
    {
      label: "BOs Registrados Hoje",
      value: bosToday.toString(),
      icon: FileText,
      trend: mockBOs.length > 0 ? `${mockBOs.length} total` : "Nenhum registro",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Apreensoes Ativas",
      value: activeSeizures.toString(),
      icon: Package,
      trend: mockSeizures.length > 0 ? `${mockSeizures.length} total` : "Nenhuma apreensao",
      color: "text-chart-4",
      bg: "bg-chart-4/10",
    },
    {
      label: "Policiais Ativos",
      value: activeOfficers.length.toString(),
      icon: Users,
      trend: `${mockOfficers.filter((o) => o.role !== "pending").length} registrados`,
      color: "text-chart-3",
      bg: "bg-chart-3/10",
    },
    {
      label: "Ocorrencias em Aberto",
      value: openBOs.toString(),
      icon: AlertTriangle,
      trend: openBOs > 0 ? "Requer atencao" : "Tudo em ordem",
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Radio className="h-3 w-3 text-chart-3 animate-pulse-dot" />
          <span className="text-xs font-medium uppercase tracking-widest text-chart-3">
            Sistema Operacional
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Bem-vindo, {user?.rank} {user?.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {user?.corporation} | {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-border/80 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                <span className="text-3xl font-bold text-foreground">{stat.value}</span>
              </div>
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <TrendingUp className={cn("h-3 w-3", stat.color)} />
              <span className="text-xs text-muted-foreground">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Recent BOs */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Ultimos Boletins de Ocorrencia</h2>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {mockBOs.length} total
            </span>
          </div>
          {recentBOs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/50">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Nenhum BO registrado ainda</p>
              <p className="text-xs text-muted-foreground/60">Os boletins aparecerrao aqui conforme forem criados</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentBOs.map((bo) => {
                const statusInfo = getStatusLabel(bo.status)
                return (
                  <div key={bo.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/30">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground font-mono">{bo.number}</span>
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", statusInfo.className)}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {bo.type} - {bo.location}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-muted-foreground">{bo.officer}</p>
                      <p className="text-[10px] text-muted-foreground/60">{formatTime(bo.date)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-chart-4" />
              <h2 className="text-sm font-semibold text-foreground">Atividade Recente</h2>
            </div>
          </div>
          {mockActivityLog.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/50">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
              <p className="text-xs text-muted-foreground/60">As acoes do sistema aparecerrao aqui</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {mockActivityLog.slice(0, 8).map((activity) => {
                const Icon = getActivityIcon(activity.type)
                const color = getActivityColor(activity.type)
                return (
                  <div key={activity.id} className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-secondary/30">
                    <div className="mt-0.5">
                      <Icon className={cn("h-4 w-4", color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-relaxed">{activity.action}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{activity.user}</span>
                        <span className="text-[10px] text-muted-foreground/50">|</span>
                        <span className="text-[10px] text-muted-foreground/60">{formatTime(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Online Officers */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-chart-3" />
            <h2 className="text-sm font-semibold text-foreground">Policiais em Servico</h2>
          </div>
          <span className="rounded-full bg-chart-3/10 px-2.5 py-0.5 text-xs font-medium text-chart-3">
            {activeOfficers.length} ativos
          </span>
        </div>
        {activeOfficers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/50">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Nenhum policial em servico</p>
            <p className="text-xs text-muted-foreground/60">Policiais aprovados aparecerrao aqui ao ficarem online</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-0 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
            {activeOfficers.map((officer) => (
              <div
                key={officer.id}
                className="flex items-center gap-3 border-b border-border px-5 py-3.5 transition-colors hover:bg-secondary/30 sm:border-r last:border-r-0"
              >
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold text-foreground">
                    {officer.name.charAt(0)}
                  </div>
                  <div
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                      officer.status === "online" ? "bg-chart-3" : "bg-chart-4"
                    )}
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{officer.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {officer.rank} - {officer.corporation}
                  </p>
                </div>
                <span
                  className={cn(
                    "ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    officer.status === "online"
                      ? "bg-chart-3/10 text-chart-3"
                      : "bg-chart-4/10 text-chart-4"
                  )}
                >
                  {officer.status === "online" ? "Online" : "Patrulha"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
