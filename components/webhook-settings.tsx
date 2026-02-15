"use client"

import { useState, useEffect } from "react"
import { Settings, Webhook, CheckCircle, XCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getWebhookUrl, setWebhookUrl, clearWebhookUrl, sendTestWebhook } from "@/lib/discord-webhook"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function WebhookSettings({ collapsed }: { collapsed: boolean }) {
  const { user } = useAuth()

  // Only owner/admin can access webhook settings
  if (user?.role !== "admin") {
    return null
  }

  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [isConfigured, setIsConfigured] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    const saved = getWebhookUrl()
    if (saved) {
      setUrl(saved)
      setIsConfigured(true)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) {
      const saved = getWebhookUrl()
      if (saved) {
        setUrl(saved)
        setIsConfigured(true)
      }
    }
  }, [open])

  const handleSave = () => {
    if (url.trim()) {
      setWebhookUrl(url.trim())
      setIsConfigured(true)
      toast.success("Webhook do Discord salvo com sucesso!")
    } else {
      clearWebhookUrl()
      setIsConfigured(false)
      toast.success("Webhook do Discord removido.")
    }
  }

  const handleTest = async () => {
    if (!url.trim()) {
      toast.error("Insira a URL do webhook primeiro.")
      return
    }
    setIsTesting(true)
    setWebhookUrl(url.trim())
    const success = await sendTestWebhook()
    setIsTesting(false)
    if (success) {
      setIsConfigured(true)
      toast.success("Mensagem de teste enviada com sucesso! Verifique o canal do Discord.")
    } else {
      toast.error("Falha ao enviar mensagem de teste. Verifique a URL do webhook.")
    }
  }

  const handleClear = () => {
    setUrl("")
    clearWebhookUrl()
    setIsConfigured(false)
    toast.success("Webhook removido.")
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "relative flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
          collapsed && "justify-center px-0"
        )}
        title="Configurar Discord Webhook"
      >
        <div className="relative">
          <Webhook className="h-4 w-4 shrink-0" />
          {isConfigured && (
            <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-chart-3" />
          )}
        </div>
        {!collapsed && <span>Discord Webhook</span>}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Webhook className="h-5 w-5 text-primary" />
              Configurar Discord Webhook
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            {/* Status indicator */}
            <div className={cn(
              "flex items-center gap-2 rounded-lg border p-3",
              isConfigured
                ? "border-chart-3/30 bg-chart-3/5"
                : "border-chart-4/30 bg-chart-4/5"
            )}>
              {isConfigured ? (
                <CheckCircle className="h-4 w-4 text-chart-3" />
              ) : (
                <XCircle className="h-4 w-4 text-chart-4" />
              )}
              <span className={cn("text-sm", isConfigured ? "text-chart-3" : "text-chart-4")}>
                {isConfigured ? "Webhook configurado e ativo" : "Webhook nao configurado"}
              </span>
            </div>

            {/* URL Input */}
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">URL do Webhook</Label>
              <Input
                placeholder="https://discord.com/api/webhooks/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="border-border bg-secondary/50 font-mono text-sm text-foreground placeholder:text-muted-foreground"
              />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Crie um webhook no Discord em: Configuracoes do Canal {'>'} Integracoes {'>'} Webhooks {'>'} Novo Webhook. Copie a URL e cole aqui.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleTest}
                disabled={!url.trim() || isTesting}
                className="flex-1 gap-2 bg-primary/10 text-primary hover:bg-primary/20"
              >
                <Send className="h-3.5 w-3.5" />
                {isTesting ? "Enviando..." : "Testar Webhook"}
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Salvar
              </Button>
            </div>

            {isConfigured && (
              <button
                onClick={handleClear}
                className="text-xs text-accent hover:text-accent/80 transition-colors"
              >
                Remover webhook configurado
              </button>
            )}

            {/* Info about what gets sent */}
            <div className="rounded-lg border border-border bg-secondary/20 p-3">
              <p className="mb-2 text-xs font-medium text-foreground">Notificacoes enviadas:</p>
              <ul className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Novos Boletins de Ocorrencia
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-chart-4" />
                  Novas Apreensoes
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Registros Criminais
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-chart-3" />
                  Logins e Aprovacoes
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-chart-5" />
                  Cadastros e Acoes Admin
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
