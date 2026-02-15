"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  FileText,
  Package,
  Database,
  BookOpen,
  Shield,
  LogOut,
  Radio,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { WebhookSettings } from "@/components/webhook-settings"
import { ProfileSettings } from "@/components/profile-settings"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/boletins", label: "Boletins de Ocorrencia", icon: FileText },
  { href: "/apreensoes", label: "Apreensoes", icon: Package },
  { href: "/banco-criminal", label: "Banco Criminal", icon: Database },
  { href: "/manual", label: "Manual de Conduta", icon: BookOpen },
  { href: "/admin", label: "Administracao", icon: Shield, adminOnly: true },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Header / Logo */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-6 w-6 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-bold text-foreground">Central da Policia</span>
            <span className="truncate text-xs text-muted-foreground">Sistema RP</span>
          </div>
        )}
      </div>

      {/* Status */}
      {!collapsed && (
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-chart-3 animate-pulse-dot" />
            <span className="text-xs text-chart-3">Sistema Operacional</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className={cn("mb-3 px-2", collapsed && "text-center")}>
          {!collapsed && (
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Navegacao
            </span>
          )}
        </div>
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            if (item.adminOnly && user?.role !== "admin") return null
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {isActive && !collapsed && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User / Footer */}
      <div className="border-t border-border p-3">
        {user && !collapsed && (
          <div className="mb-3 rounded-md bg-secondary/50 px-3 py-2.5">
            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.rank} - {user.corporation}
            </p>
            <p className="text-xs text-muted-foreground">ID: {user.id}</p>
          </div>
        )}
        <div className="mb-1">
          <ProfileSettings collapsed={collapsed} />
        </div>
        <div className="mb-2">
          <WebhookSettings collapsed={collapsed} />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={logout}
            className={cn(
              "flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent",
              collapsed && "justify-center"
            )}
            title="Sair"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            title={collapsed ? "Expandir" : "Recolher"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </aside>
  )
}
