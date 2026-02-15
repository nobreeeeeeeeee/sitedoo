"use client"

import { useState } from "react"
import {
  User,
  KeyRound,
  IdCard,
  Mail,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export function ProfileSettings({ collapsed }: { collapsed: boolean }) {
  const { user, updateUser } = useAuth()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [id, setId] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [activeSection, setActiveSection] = useState<"profile" | "password">("profile")

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && user) {
      setName(user.name)
      setId(user.id)
      setEmail(user.email)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }
  }

  const handleSaveProfile = () => {
    if (!name.trim()) {
      toast.error("O nome nao pode estar vazio.")
      return
    }
    if (!id.trim()) {
      toast.error("O ID nao pode estar vazio.")
      return
    }
    const result = updateUser({ name: name.trim(), id: id.trim(), email: email.trim() })
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  const handleChangePassword = () => {
    if (!currentPassword) {
      toast.error("Informe a senha atual.")
      return
    }
    if (user && currentPassword !== user.password) {
      toast.error("Senha atual incorreta.")
      return
    }
    if (newPassword.length < 4) {
      toast.error("A nova senha deve ter no minimo 4 caracteres.")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas nao coincidem.")
      return
    }
    const result = updateUser({ password: newPassword })
    if (result.success) {
      toast.success("Senha alterada com sucesso!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } else {
      toast.error(result.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <button
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title="Meu Perfil"
        >
          <User className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Meu Perfil</span>}
        </button>
      </DialogTrigger>
      <DialogContent className="border-border bg-card text-foreground sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <User className="h-5 w-5 text-primary" />
            Configuracoes do Perfil
          </DialogTitle>
        </DialogHeader>

        {/* Section Tabs */}
        <div className="flex gap-1 rounded-lg border border-border bg-secondary/30 p-1">
          <button
            onClick={() => setActiveSection("profile")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all ${
              activeSection === "profile"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <IdCard className="h-3.5 w-3.5" />
            Dados Pessoais
          </button>
          <button
            onClick={() => setActiveSection("password")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all ${
              activeSection === "password"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            Alterar Senha
          </button>
        </div>

        {activeSection === "profile" && (
          <div className="flex flex-col gap-4 pt-2">
            {/* Current Info */}
            <div className="rounded-lg border border-border bg-secondary/20 p-3">
              <p className="text-xs text-muted-foreground">Informacoes atuais</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {user?.rank} - {user?.corporation}
              </p>
              <p className="text-xs text-muted-foreground">
                Cargo: {user?.role === "admin" ? "Administrador" : "Policial"}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-1.5 text-foreground">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Nome RP
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome RP"
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-1.5 text-foreground">
                <IdCard className="h-3.5 w-3.5 text-muted-foreground" />
                ID Policial
              </Label>
              <Input
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Seu ID"
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-1.5 text-foreground">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                E-mail
              </Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu e-mail"
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <Button
              onClick={handleSaveProfile}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="h-4 w-4" />
              Salvar Alteracoes
            </Button>
          </div>
        )}

        {activeSection === "password" && (
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Senha Atual</Label>
              <div className="relative">
                <Input
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="border-border bg-secondary/50 pr-10 text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Nova Senha</Label>
              <div className="relative">
                <Input
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                  className="border-border bg-secondary/50 pr-10 text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Confirmar Nova Senha</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
              />
              {newPassword && confirmPassword && newPassword === confirmPassword && (
                <p className="flex items-center gap-1 text-xs text-chart-3">
                  <CheckCircle className="h-3 w-3" />
                  Senhas coincidem
                </p>
              )}
            </div>

            <Button
              onClick={handleChangePassword}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <KeyRound className="h-4 w-4" />
              Alterar Senha
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
