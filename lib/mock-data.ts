// ==================== TYPES ====================

export type UserRole = "admin" | "officer" | "pending"

export type Permission =
  | "criar_bo"
  | "editar_bo"
  | "deletar_bo"
  | "criar_apreensao"
  | "editar_apreensao"
  | "deletar_apreensao"
  | "consultar_criminal"
  | "registrar_criminal"
  | "aprovar_policiais"
  | "gerenciar_corporacoes"
  | "gerenciar_patentes"
  | "editar_permissoes"
  | "ver_logs"
  | "remover_policiais"

export const allPermissions: { key: Permission; label: string; category: string }[] = [
  { key: "criar_bo", label: "Criar BO", category: "Boletins" },
  { key: "editar_bo", label: "Editar BO", category: "Boletins" },
  { key: "deletar_bo", label: "Deletar BO", category: "Boletins" },
  { key: "criar_apreensao", label: "Criar Apreensao", category: "Apreensoes" },
  { key: "editar_apreensao", label: "Editar Apreensao", category: "Apreensoes" },
  { key: "deletar_apreensao", label: "Deletar Apreensao", category: "Apreensoes" },
  { key: "consultar_criminal", label: "Consultar Criminal", category: "Banco Criminal" },
  { key: "registrar_criminal", label: "Registrar Criminal", category: "Banco Criminal" },
  { key: "aprovar_policiais", label: "Aprovar Policiais", category: "Administracao" },
  { key: "gerenciar_corporacoes", label: "Gerenciar Corporacoes", category: "Administracao" },
  { key: "gerenciar_patentes", label: "Gerenciar Patentes", category: "Administracao" },
  { key: "editar_permissoes", label: "Editar Permissoes", category: "Administracao" },
  { key: "ver_logs", label: "Ver Logs", category: "Administracao" },
  { key: "remover_policiais", label: "Remover Policiais", category: "Administracao" },
]

export interface RankConfig {
  name: string
  level: number
  permissions: Permission[]
}

export interface CorporationConfig {
  name: string
  ranks: RankConfig[]
  color: string
}

export interface Officer {
  id: string
  name: string
  corporation: string
  rank: string
  email: string
  password: string
  status: "online" | "offline" | "patrol"
  role: UserRole
  joinedAt: string
  avatar?: string
}

export interface BoletimOcorrencia {
  id: string
  number: string
  date: string
  officer: string
  officerId: string
  location: string
  type: string
  involved: string
  description: string
  status: "aberto" | "em_andamento" | "fechado"
  corporation: string
}

export interface Seizure {
  id: string
  type: "arma" | "droga" | "veiculo" | "dinheiro"
  quantity: string
  suspect: string
  location: string
  officer: string
  officerId: string
  observations: string
  status: "ativa" | "finalizada"
  date: string
  corporation: string
}

export interface Criminal {
  id: string
  name: string
  alias: string
  rg: string
  history: CriminalRecord[]
  warrants: Warrant[]
  notes: string[]
  photo?: string
}

export interface CriminalRecord {
  id: string
  date: string
  type: string
  description: string
  officer: string
}

export interface Warrant {
  id: string
  type: string
  issuedDate: string
  status: "ativo" | "cumprido" | "expirado"
  description: string
}

export interface ActivityLog {
  id: string
  action: string
  user: string
  timestamp: string
  type: "bo" | "seizure" | "criminal" | "admin" | "login"
}

// ==================== MOCK DATA ====================

export const corporations = [
  "Administracao Central",
  "Policia Militar",
  "Policia Civil",
  "Policia Federal",
  "Policia Rodoviaria",
  "BOPE",
  "GOE",
]

export const ranks = [
  "Owner",
  "Soldado",
  "Cabo",
  "Sargento",
  "Subtenente",
  "Tenente",
  "Capitao",
  "Major",
  "Tenente-Coronel",
  "Coronel",
  "Delegado",
  "Comissario",
]

const allPerms: Permission[] = [
  "criar_bo", "editar_bo", "deletar_bo", "criar_apreensao", "editar_apreensao",
  "deletar_apreensao", "consultar_criminal", "registrar_criminal", "aprovar_policiais",
  "gerenciar_corporacoes", "gerenciar_patentes", "editar_permissoes", "ver_logs", "remover_policiais",
]
const officerPerms: Permission[] = ["criar_bo", "criar_apreensao", "consultar_criminal"]
const sgPerms: Permission[] = [...officerPerms, "editar_bo", "editar_apreensao", "registrar_criminal"]
const ltPerms: Permission[] = [...sgPerms, "deletar_bo", "deletar_apreensao", "aprovar_policiais", "ver_logs"]
const cpPerms: Permission[] = [...ltPerms, "gerenciar_patentes", "remover_policiais"]

export const mockCorporationConfigs: CorporationConfig[] = [
  {
    name: "Policia Militar",
    color: "#1e40af",
    ranks: [
      { name: "Soldado", level: 1, permissions: officerPerms },
      { name: "Cabo", level: 2, permissions: officerPerms },
      { name: "Sargento", level: 3, permissions: sgPerms },
      { name: "Subtenente", level: 4, permissions: sgPerms },
      { name: "Tenente", level: 5, permissions: ltPerms },
      { name: "Capitao", level: 6, permissions: cpPerms },
      { name: "Major", level: 7, permissions: allPerms },
      { name: "Tenente-Coronel", level: 8, permissions: allPerms },
      { name: "Coronel", level: 9, permissions: allPerms },
    ],
  },
  {
    name: "Policia Civil",
    color: "#7c3aed",
    ranks: [
      { name: "Escrivao", level: 1, permissions: officerPerms },
      { name: "Investigador", level: 2, permissions: sgPerms },
      { name: "Inspetor", level: 3, permissions: sgPerms },
      { name: "Comissario", level: 4, permissions: ltPerms },
      { name: "Delegado", level: 5, permissions: allPerms },
    ],
  },
  {
    name: "Policia Federal",
    color: "#047857",
    ranks: [
      { name: "Agente", level: 1, permissions: officerPerms },
      { name: "Escrivao", level: 2, permissions: sgPerms },
      { name: "Perito", level: 3, permissions: sgPerms },
      { name: "Tenente", level: 4, permissions: ltPerms },
      { name: "Delegado Federal", level: 5, permissions: allPerms },
    ],
  },
  {
    name: "Policia Rodoviaria",
    color: "#b45309",
    ranks: [
      { name: "Soldado", level: 1, permissions: officerPerms },
      { name: "Cabo", level: 2, permissions: officerPerms },
      { name: "Sargento", level: 3, permissions: sgPerms },
      { name: "Tenente", level: 4, permissions: ltPerms },
      { name: "Capitao", level: 5, permissions: cpPerms },
      { name: "Inspetor-Chefe", level: 6, permissions: allPerms },
    ],
  },
  {
    name: "BOPE",
    color: "#dc2626",
    ranks: [
      { name: "Operador", level: 1, permissions: officerPerms },
      { name: "Operador Senior", level: 2, permissions: sgPerms },
      { name: "Lider de Equipe", level: 3, permissions: ltPerms },
      { name: "Tenente", level: 4, permissions: ltPerms },
      { name: "Capitao", level: 5, permissions: cpPerms },
      { name: "Comandante", level: 6, permissions: allPerms },
    ],
  },
  {
    name: "GOE",
    color: "#0f766e",
    ranks: [
      { name: "Agente", level: 1, permissions: officerPerms },
      { name: "Agente Especial", level: 2, permissions: sgPerms },
      { name: "Sargento", level: 3, permissions: sgPerms },
      { name: "Lider Tatico", level: 4, permissions: ltPerms },
      { name: "Comandante", level: 5, permissions: allPerms },
    ],
  },
]

export const occurrenceTypes = [
  "Roubo",
  "Furto",
  "Homicidio",
  "Trafico de Drogas",
  "Porte Ilegal de Arma",
  "Sequestro",
  "Lesao Corporal",
  "Dano ao Patrimonio",
  "Desacato a Autoridade",
  "Embriaguez ao Volante",
  "Direcao Perigosa",
  "Invasao de Propriedade",
  "Estelionato",
  "Receptacao",
]

export const mockOfficers: Officer[] = [
  { id: "001", name: "Nobre", corporation: "Administracao Central", rank: "Owner", email: "nobre@central.rp", password: "admin", status: "online", role: "admin", joinedAt: "2024-01-01" },
]

export const mockBOs: BoletimOcorrencia[] = []

export const mockSeizures: Seizure[] = []

export const mockCriminals: Criminal[] = []

export const mockActivityLog: ActivityLog[] = []

export const conductManual = {
  sections: [
    {
      id: "regras-gerais",
      title: "Regras Gerais",
      content: [
        "Todo policial deve manter postura profissional durante o servico.",
        "E obrigatorio o uso correto do uniforme e identificacao funcional.",
        "A comunicacao via radio deve seguir o protocolo estabelecido.",
        "Respeitar a hierarquia e a cadeia de comando em todas as situacoes.",
        "Relatar todas as ocorrencias ao superior imediato.",
        "Manter sigilo sobre operacoes e informacoes confidenciais.",
        "Zelar pelo patrimonio publico e equipamentos fornecidos.",
      ],
    },
    {
      id: "uso-da-forca",
      title: "Uso da Forca",
      content: [
        "O uso da forca deve ser sempre proporcional a ameaca.",
        "Priorizar sempre a resolucao pacifica de conflitos.",
        "Arma de fogo: ultimo recurso, apenas em risco iminente de vida.",
        "Documentar todo uso de forca em relatorio especifico.",
        "Nivel 1: Presenca policial e verbalizacao.",
        "Nivel 2: Controle de contato (maos livres).",
        "Nivel 3: Tecnicas de submissao (imobilizacao).",
        "Nivel 4: Armas menos letais (taser, spray de pimenta).",
        "Nivel 5: Forca letal (arma de fogo) - apenas em ultimo caso.",
      ],
    },
    {
      id: "abordagens",
      title: "Abordagens",
      content: [
        "Sempre anunciar-se como policial antes da abordagem.",
        "Manter distancia segura do abordado.",
        "Solicitar documentos de forma educada e firme.",
        "Em abordagem veicular: posicionar a viatura de forma tatica.",
        "Nunca realizar abordagem sozinho em situacoes de risco.",
        "Informar ao abordado o motivo da abordagem.",
        "Respeitar os direitos fundamentais do cidadao.",
        "Documentar a abordagem no sistema.",
      ],
    },
    {
      id: "prisoes",
      title: "Prisoes",
      content: [
        "Informar ao preso seus direitos no momento da prisao.",
        "Utilizar algemas conforme a Sumula Vinculante 11 do STF.",
        "Conduzir o preso a delegacia mais proxima.",
        "Garantir a integridade fisica do preso sob sua custodia.",
        "Registrar o Boletim de Ocorrencia imediatamente.",
        "Apreender e catalogar todos os objetos encontrados.",
        "Solicitar exame de corpo de delito quando necessario.",
      ],
    },
    {
      id: "codigos-q",
      title: "Codigos Q (Radio)",
      content: [
        "QAP - Na escuta / Em posicao",
        "QRA - Nome da estacao ou operador",
        "QRG - Frequencia",
        "QRK - Qualidade do sinal",
        "QRM - Interferencia",
        "QRT - Cessar transmissao",
        "QRU - Tem algo para mim?",
        "QRV - Estou pronto / A disposicao",
        "QSL - Entendido / Confirmado",
        "QSO - Comunicacao direta",
        "QTA - Cancele a mensagem",
        "QTH - Localizacao atual",
        "QTR - Hora certa",
      ],
    },
    {
      id: "hierarquia",
      title: "Hierarquia Policial",
      content: [
        "Coronel - Comandante Geral",
        "Tenente-Coronel - Subcomandante",
        "Major - Comandante de Batalhao",
        "Capitao - Comandante de Companhia",
        "Tenente - Comandante de Pelotao",
        "Subtenente - Auxiliar de Comando",
        "Sargento - Lider de Equipe",
        "Cabo - Vice-lider de Equipe",
        "Soldado - Tropa de Base",
      ],
    },
    {
      id: "penalidades",
      title: "Penalidades Internas",
      content: [
        "Advertencia Verbal - Infraccoes leves de primeira vez.",
        "Advertencia Escrita - Reincidencia em infraccoes leves.",
        "Suspensao (3-7 dias) - Infraccoes moderadas.",
        "Suspensao (7-30 dias) - Infraccoes graves.",
        "Rebaixamento de Patente - Infraccoes muito graves.",
        "Expulsao da Corporacao - Infraccoes gravissimas ou criminais.",
        "Todas as penalidades devem ser registradas no prontuario do policial.",
        "O policial tem direito a defesa em todas as instancias.",
      ],
    },
  ],
}
