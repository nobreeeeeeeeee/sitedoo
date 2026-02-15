"use client"

import { useState } from "react"
import {
  BookOpen,
  Shield,
  Zap,
  Users,
  Lock,
  Radio,
  ChevronRight,
  ListOrdered,
  AlertOctagon,
} from "lucide-react"
import { conductManual } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const sectionIcons: Record<string, typeof BookOpen> = {
  "regras-gerais": Shield,
  "uso-da-forca": Zap,
  abordagens: Users,
  prisoes: Lock,
  "codigos-q": Radio,
  hierarquia: ListOrdered,
  penalidades: AlertOctagon,
}

const sectionColors: Record<string, string> = {
  "regras-gerais": "text-primary bg-primary/10",
  "uso-da-forca": "text-accent bg-accent/10",
  abordagens: "text-chart-3 bg-chart-3/10",
  prisoes: "text-chart-4 bg-chart-4/10",
  "codigos-q": "text-chart-5 bg-chart-5/10",
  hierarquia: "text-primary bg-primary/10",
  penalidades: "text-accent bg-accent/10",
}

export function ManualContent() {
  const [activeSection, setActiveSection] = useState(
    conductManual.sections[0].id
  )

  const currentSection = conductManual.sections.find(
    (s) => s.id === activeSection
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Manual de Conduta Policial
        </h1>
        <p className="text-sm text-muted-foreground">
          Regulamento interno e procedimentos operacionais
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Sumario
                </span>
              </div>
            </div>
            <nav className="flex flex-col gap-0.5 p-2">
              {conductManual.sections.map((section) => {
                const Icon = sectionIcons[section.id] || BookOpen
                const isActive = activeSection === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{section.title}</span>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {currentSection && (
            <div className="rounded-xl border border-border bg-card">
              {/* Section Header */}
              <div className="border-b border-border px-6 py-5">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = sectionIcons[currentSection.id] || BookOpen
                    const colorClass =
                      sectionColors[currentSection.id] || "text-primary bg-primary/10"
                    const [textColor, bgColor] = colorClass.split(" ")
                    return (
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          bgColor
                        )}
                      >
                        <Icon className={cn("h-5 w-5", textColor)} />
                      </div>
                    )
                  })()}
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      {currentSection.title}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {currentSection.content.length} itens nesta secao
                    </p>
                  </div>
                </div>
              </div>

              {/* Content Items */}
              <div className="divide-y divide-border">
                {currentSection.content.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-secondary/10"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary/50 font-mono text-xs font-bold text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground pt-0.5">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-border bg-secondary/10 px-6 py-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Central da Policia RP - Regulamento Interno - Atualizado em
                  14/02/2025
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
