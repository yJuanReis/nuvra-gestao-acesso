-- ============================================
-- NUVRA - Setup Supabase DEMO (do zero)
-- Cola tudo no SQL Editor e clica Run.
-- ============================================

-- ---------- TABELAS ----------
CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pessoas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  documento VARCHAR(20) NOT NULL,
  tipo VARCHAR(50),
  contato VARCHAR(20),
  placa VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  pessoa_id UUID REFERENCES pessoas(id) ON DELETE CASCADE,
  entrada_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  saida_em TIMESTAMPTZ,
  status VARCHAR(10) NOT NULL DEFAULT 'DENTRO' CHECK (status IN ('DENTRO', 'FORA')),
  observacao TEXT,
  excluido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'owner')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tipos_pessoa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  icone VARCHAR(50) DEFAULT 'User',
  cor_texto VARCHAR(50) DEFAULT 'text-blue-600',
  cor_fundo VARCHAR(50) DEFAULT 'bg-blue-100',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, nome)
);

-- ---------- INDICES ----------
CREATE INDEX IF NOT EXISTS idx_movimentacoes_empresa ON movimentacoes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_tipos_pessoa_empresa ON tipos_pessoa(empresa_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_pessoa ON movimentacoes(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_status ON movimentacoes(status);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON movimentacoes(entrada_em);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_excluido_em ON movimentacoes(excluido_em);
CREATE INDEX IF NOT EXISTS idx_pessoas_empresa ON pessoas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pessoas_documento ON pessoas(documento);

-- ---------- RPCs ----------
CREATE OR REPLACE FUNCTION get_movimentacoes_por_empresa(
  p_empresa_id UUID, p_limit INTEGER DEFAULT 1000, p_offset INTEGER DEFAULT 0
) RETURNS SETOF movimentacoes LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY SELECT * FROM movimentacoes
  WHERE empresa_id = p_empresa_id
  ORDER BY entrada_em DESC LIMIT p_limit OFFSET p_offset;
END; $$;

CREATE OR REPLACE FUNCTION get_movimentacoes_por_periodo(
  p_empresa_id UUID, p_data_inicio TIMESTAMPTZ, p_data_fim TIMESTAMPTZ,
  p_limit INTEGER DEFAULT 1000, p_offset INTEGER DEFAULT 0,
  p_incluir_excluidas BOOLEAN DEFAULT FALSE
) RETURNS SETOF movimentacoes LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF p_incluir_excluidas THEN
    RETURN QUERY SELECT * FROM movimentacoes
    WHERE empresa_id = p_empresa_id
      AND entrada_em >= p_data_inicio AND entrada_em <= p_data_fim
    ORDER BY entrada_em DESC LIMIT p_limit OFFSET p_offset;
  ELSE
    RETURN QUERY SELECT * FROM movimentacoes
    WHERE empresa_id = p_empresa_id
      AND entrada_em >= p_data_inicio AND entrada_em <= p_data_fim
      AND excluido_em IS NULL
    ORDER BY entrada_em DESC LIMIT p_limit OFFSET p_offset;
  END IF;
END; $$;

CREATE OR REPLACE FUNCTION get_pessoas_por_empresa(
  p_empresa_id UUID, p_limit INTEGER DEFAULT 1000, p_offset INTEGER DEFAULT 0
) RETURNS SETOF pessoas LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY SELECT * FROM pessoas
  WHERE empresa_id = p_empresa_id
  ORDER BY nome ASC LIMIT p_limit OFFSET p_offset;
END; $$;

-- ---------- TRIGGER: cria perfil ao registrar usuario ----------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_profiles (id, nome, empresa_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    COALESCE((NEW.raw_user_meta_data->>'empresa_id')::UUID, (SELECT id FROM empresas LIMIT 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ---------- EMPRESA DEMO (UUID fixo) ----------
INSERT INTO empresas (id, nome)
VALUES ('00000000-0000-0000-0000-000000000001', 'Nuvra Demo')
ON CONFLICT (id) DO NOTHING;

-- ---------- TIPOS DE PESSOA (seed opcional) ----------
INSERT INTO tipos_pessoa (empresa_id, nome, icone, cor_texto, cor_fundo) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Cliente',      'User',      'text-blue-600',  'bg-blue-100'),
  ('00000000-0000-0000-0000-000000000001', 'Funcionário',  'UserCheck', 'text-green-600', 'bg-green-100'),
  ('00000000-0000-0000-0000-000000000001', 'Prestador',    'Wrench',    'text-amber-600', 'bg-amber-100'),
  ('00000000-0000-0000-0000-000000000001', 'Visitante',    'UserPlus',  'text-purple-600','bg-purple-100')
ON CONFLICT (empresa_id, nome) DO NOTHING;

-- ---------- PESSOAS (seed demo) ----------
-- 'tipo' usa o NOME do tipo (bate com tipos_pessoa.nome => ícone/cor certos).
INSERT INTO pessoas (id, empresa_id, nome, documento, tipo, contato, placa) VALUES
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Ana Souza',       '123.456.789-01', 'Cliente',     '21988880001', 'ABC-1234'),
  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Bruno Lima',      '234.567.890-12', 'Funcionário', '21988880002', NULL),
  ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Carlos Pereira',  '345.678.901-23', 'Prestador',   '21988880003', 'XYZ-5678'),
  ('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Daniela Costa',   '456.789.012-34', 'Visitante',   '21988880004', NULL),
  ('a0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Eduardo Martins', '567.890.123-45', 'Cliente',     '21988880005', 'JKL-9012')
ON CONFLICT (id) DO NOTHING;

-- ---------- MOVIMENTAÇÕES (seed demo) ----------
-- 3 pessoas DENTRO agora + 2 saídas já finalizadas (histórico).
INSERT INTO movimentacoes (id, empresa_id, pessoa_id, entrada_em, saida_em, status, observacao) VALUES
  ('b0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 hours',  NULL,                        'DENTRO', NULL),
  ('b0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '4 hours',  NULL,                        'DENTRO', NULL),
  ('b0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '1 hour',   NULL,                        'DENTRO', 'Manutenção do portão'),
  ('b0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '1 day',    NOW() - INTERVAL '23 hours', 'FORA',   'Saída finalizada'),
  ('b0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', NOW() - INTERVAL '2 days',   NOW() - INTERVAL '1 day',    'FORA',   'Saída finalizada')
ON CONFLICT (id) DO NOTHING;

-- ---------- RLS (DEMO) ----------
-- Em alguns projetos o RLS vem ligado por padrao e bloqueia a leitura
-- via anon key, deixando o app preso na tela de login (perfil = null).
-- Para o DEMO, desligamos o RLS. NAO usar assim em producao: la, habilite
-- RLS e crie policies por empresa_id.
ALTER TABLE empresas      DISABLE ROW LEVEL SECURITY;
ALTER TABLE pessoas       DISABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_pessoa  DISABLE ROW LEVEL SECURITY;

-- ---------- USUÁRIO ADMIN (opcional) ----------
-- Cria admin@nuvra.com / admin123 direto no Auth (já confirmado) e
-- promove a owner da empresa demo. Idempotente (não recria se já existe).
--
-- OBS: o schema do 'auth' pode variar entre versões do Supabase. Se este
-- bloco falhar, ignore-o e crie o usuário pela tela Authentication > Add user
-- (ver TUTORIAL_INSTALACAO.md, passo 2.6).
DO $$
DECLARE
  v_user_id uuid := gen_random_uuid();
  v_email   text := 'admin@nuvra.com';
  v_empresa uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change, email_change_token_new
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated',
      v_email, crypt('admin123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}', '{}',
      '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_user_id, v_user_id::text,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email),
      'email', NOW(), NOW(), NOW()
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  END IF;

  -- Perfil owner (o trigger pode já ter criado como 'user'; garante owner).
  INSERT INTO public.user_profiles (id, nome, empresa_id, role)
  VALUES (v_user_id, 'Administrador', v_empresa, 'owner')
  ON CONFLICT (id) DO UPDATE
    SET role = 'owner', empresa_id = EXCLUDED.empresa_id;
END $$;
