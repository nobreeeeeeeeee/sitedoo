// ==================== DISCORD WEBHOOK UTILITY ====================

const WEBHOOK_STORAGE_KEY = "discord_webhook_url"
const DEFAULT_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1472354810341888072/XE61y3f08jJBibmAKQHVnt4c9EySFNmuCehv5ndrKtB4lfbvf-lsJBxN9uqivywYKXog"

export function getWebhookUrl(): string | null {
  if (typeof window === "undefined") return DEFAULT_WEBHOOK_URL
  return localStorage.getItem(WEBHOOK_STORAGE_KEY) || DEFAULT_WEBHOOK_URL
}

export function setWebhookUrl(url: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(WEBHOOK_STORAGE_KEY, url)
}

export function clearWebhookUrl() {
  if (typeof window === "undefined") return
  localStorage.removeItem(WEBHOOK_STORAGE_KEY)
}

interface EmbedField {
  name: string
  value: string
  inline?: boolean
}

interface DiscordEmbed {
  title: string
  description?: string
  color: number
  fields?: EmbedField[]
  footer?: { text: string }
  timestamp?: string
  thumbnail?: { url: string }
}

async function sendEmbed(embed: DiscordEmbed): Promise<boolean> {
  const webhookUrl = getWebhookUrl()
  if (!webhookUrl) return false

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Central da Policia RP",
        avatar_url: "https://cdn-icons-png.flaticon.com/512/1642/1642097.png",
        embeds: [
          {
            ...embed,
            footer: { text: "Central da Policia RP - Sistema MDT" },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

// ==================== WEBHOOK SENDERS ====================

export async function sendTestWebhook(): Promise<boolean> {
  return sendEmbed({
    title: "Teste de Webhook",
    description: "Conexao com o Discord estabelecida com sucesso! O sistema esta configurado para enviar notificacoes.",
    color: 0x1e40af,
    fields: [
      { name: "Sistema", value: "Central da Policia RP", inline: true },
      { name: "Status", value: "Operacional", inline: true },
    ],
  })
}

export function sendLoginWebhook(officerName: string, officerId: string, corporation: string, rank: string) {
  sendEmbed({
    title: "Login no Sistema",
    description: `O policial **${officerName}** acessou o sistema MDT.`,
    color: 0x16a34a,
    fields: [
      { name: "Policial", value: officerName, inline: true },
      { name: "ID", value: officerId, inline: true },
      { name: "Corporacao", value: corporation, inline: true },
      { name: "Patente", value: rank, inline: true },
    ],
  })
}

export function sendRegistrationWebhook(name: string, id: string, corporation: string, rank: string) {
  sendEmbed({
    title: "Novo Cadastro Solicitado",
    description: `Um novo policial solicitou acesso ao sistema. Aguardando aprovacao do administrador.`,
    color: 0xeab308,
    fields: [
      { name: "Nome", value: name, inline: true },
      { name: "ID Solicitado", value: id, inline: true },
      { name: "Corporacao", value: corporation, inline: true },
      { name: "Patente", value: rank, inline: true },
    ],
  })
}

export function sendBOWebhook(
  boNumber: string,
  type: string,
  location: string,
  involved: string,
  description: string,
  officerName: string,
  officerId: string,
  corporation: string
) {
  sendEmbed({
    title: "Novo Boletim de Ocorrencia",
    description: `Um novo BO foi registrado no sistema por **${officerName}**.`,
    color: 0x1e40af,
    fields: [
      { name: "Numero do BO", value: boNumber, inline: true },
      { name: "Tipo", value: type, inline: true },
      { name: "Local", value: location, inline: true },
      { name: "Policial", value: `${officerName} (ID: ${officerId})`, inline: true },
      { name: "Corporacao", value: corporation, inline: true },
      { name: "Envolvidos", value: involved, inline: false },
      { name: "Descricao", value: description.length > 200 ? description.substring(0, 200) + "..." : description, inline: false },
    ],
  })
}

export function sendSeizureWebhook(
  type: string,
  quantity: string,
  suspect: string,
  location: string,
  observations: string,
  officerName: string,
  officerId: string,
  corporation: string
) {
  const typeLabels: Record<string, string> = {
    arma: "Arma",
    droga: "Droga",
    veiculo: "Veiculo",
    dinheiro: "Dinheiro",
  }
  sendEmbed({
    title: "Nova Apreensao Registrada",
    description: `Uma nova apreensao de **${typeLabels[type] || type}** foi registrada por **${officerName}**.`,
    color: 0xf59e0b,
    fields: [
      { name: "Tipo", value: typeLabels[type] || type, inline: true },
      { name: "Quantidade", value: quantity, inline: true },
      { name: "Suspeito", value: suspect, inline: true },
      { name: "Local", value: location, inline: true },
      { name: "Policial", value: `${officerName} (ID: ${officerId})`, inline: true },
      { name: "Corporacao", value: corporation, inline: true },
      ...(observations ? [{ name: "Observacoes", value: observations.length > 200 ? observations.substring(0, 200) + "..." : observations, inline: false }] : []),
    ],
  })
}

export function sendCriminalWebhook(
  name: string,
  alias: string,
  rg: string,
  officerName: string
) {
  sendEmbed({
    title: "Novo Registro Criminal",
    description: `O cidadao **${name}** foi cadastrado no banco de dados criminal.`,
    color: 0xdc2626,
    fields: [
      { name: "Nome", value: name, inline: true },
      { name: "Vulgo", value: alias || "N/A", inline: true },
      { name: "RG", value: rg, inline: true },
      { name: "Registrado por", value: officerName, inline: true },
    ],
  })
}

export function sendApprovalWebhook(
  officerName: string,
  officerId: string,
  corporation: string,
  rank: string,
  approvedBy: string
) {
  sendEmbed({
    title: "Policial Aprovado",
    description: `O policial **${officerName}** teve seu cadastro aprovado por **${approvedBy}**.`,
    color: 0x16a34a,
    fields: [
      { name: "Policial", value: officerName, inline: true },
      { name: "ID", value: officerId, inline: true },
      { name: "Corporacao", value: corporation, inline: true },
      { name: "Patente", value: rank, inline: true },
      { name: "Aprovado por", value: approvedBy, inline: true },
    ],
  })
}

export function sendRejectionWebhook(
  officerName: string,
  officerId: string,
  rejectedBy: string
) {
  sendEmbed({
    title: "Cadastro Rejeitado",
    description: `O cadastro do policial **${officerName}** foi rejeitado por **${rejectedBy}**.`,
    color: 0xdc2626,
    fields: [
      { name: "Policial", value: officerName, inline: true },
      { name: "ID", value: officerId, inline: true },
      { name: "Rejeitado por", value: rejectedBy, inline: true },
    ],
  })
}

export function sendRemovalWebhook(
  officerName: string,
  officerId: string,
  corporation: string,
  removedBy: string
) {
  sendEmbed({
    title: "Policial Removido",
    description: `O policial **${officerName}** foi removido do sistema por **${removedBy}**.`,
    color: 0xdc2626,
    fields: [
      { name: "Policial", value: officerName, inline: true },
      { name: "ID", value: officerId, inline: true },
      { name: "Corporacao", value: corporation, inline: true },
      { name: "Removido por", value: removedBy, inline: true },
    ],
  })
}

export function sendCorpWebhook(corpName: string, createdBy: string) {
  sendEmbed({
    title: "Nova Corporacao Criada",
    description: `A corporacao **${corpName}** foi criada no sistema.`,
    color: 0x1e40af,
    fields: [
      { name: "Corporacao", value: corpName, inline: true },
      { name: "Criada por", value: createdBy, inline: true },
    ],
  })
}
