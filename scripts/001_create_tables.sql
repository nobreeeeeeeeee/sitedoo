-- Officers table
CREATE TABLE IF NOT EXISTS officers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  corporation TEXT NOT NULL,
  rank TEXT NOT NULL,
  email TEXT,
  password TEXT NOT NULL DEFAULT '123456',
  status TEXT NOT NULL DEFAULT 'offline',
  role TEXT NOT NULL DEFAULT 'pending',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Corporations table
CREATE TABLE IF NOT EXISTS corporations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#1e40af',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ranks table (per corporation)
CREATE TABLE IF NOT EXISTS ranks (
  id SERIAL PRIMARY KEY,
  corporation_id INTEGER NOT NULL REFERENCES corporations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Boletins de Ocorrencia
CREATE TABLE IF NOT EXISTS boletins (
  id SERIAL PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  officer_name TEXT NOT NULL,
  officer_id TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  involved TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'aberto',
  corporation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seizures (Apreensoes)
CREATE TABLE IF NOT EXISTS seizures (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  quantity TEXT NOT NULL,
  suspect TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  officer_name TEXT NOT NULL,
  officer_id TEXT NOT NULL,
  observations TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'ativa',
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  corporation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criminals (Banco Criminal)
CREATE TABLE IF NOT EXISTS criminals (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  alias TEXT NOT NULL DEFAULT '',
  rg TEXT NOT NULL DEFAULT '',
  notes TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criminal Records (Historico Criminal)
CREATE TABLE IF NOT EXISTS criminal_records (
  id SERIAL PRIMARY KEY,
  criminal_id INTEGER NOT NULL REFERENCES criminals(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  officer TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Warrants (Mandados)
CREATE TABLE IF NOT EXISTS warrants (
  id SERIAL PRIMARY KEY,
  criminal_id INTEGER NOT NULL REFERENCES criminals(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  issued_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'ativo',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  user_name TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
