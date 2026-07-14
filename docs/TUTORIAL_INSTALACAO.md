# 📦 Tutorial de Instalação - Nuvra

Guia completo para instalar, configurar e fazer deploy do **Nuvra - Gestão de Acesso** do zero.

---

## 📋 Pré-requisitos

Antes de começar, você precisa ter:

- **Node.js** (v18 ou superior) → [Baixar aqui](https://nodejs.org/)
- **Git** → [Baixar aqui](https://git-scm.com/)
- **Conta no GitHub** → [Criar conta](https://github.com/signup)
- **Conta no Supabase** (grátis) → [Criar conta](https://supabase.com/)
- **Conta na Vercel** (grátis, pode usar o GitHub) → [Criar conta](https://vercel.com/)

---

## 🚀 Passo 1: Clonar o Repositório

```bash
# Clone o projeto
git clone https://github.com/yJuanReis/controle-brmarinas.git
cd controle-brmarinas

# Instalar as dependências
npm install
```

---

## 🗄️ Passo 2: Configurar o Supabase

### 2.1. Criar um Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com/) e faça login
2. Clique em **"New project"**
3. Preencha:
   - **Name**: `nuvra` (ou o nome que preferir)
   - **Database Password**: Crie uma senha forte e **guarde-a**
   - **Region**: Selecione `South America (São Paulo)` - mais rápido para o Brasil
4. Clique em **"Create new project"**
5. Aguarde alguns minutos enquanto o banco é criado

### 2.2. Pegar as Credenciais

1. No menu lateral, clique em **⚙️ Project Settings** (engrenagem)
2. Vá em **"API"** no menu esquerdo
3. Anote estas informações:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public key** (uma string longa começando com `eyJ...`)

### 2.3. Configurar o Banco de Dados

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**
3. Copie e cole o SQL abaixo e execute:

```sql
-- ============================================
-- NUVRA - Estrutura do Banco de Dados
-- ============================================

-- Tabela de empresas
CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de pessoas
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

-- Tabela de movimentações (entrada/saída)
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

-- Tabela de perfis de usuário (vinculada ao Auth do Supabase)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'owner')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de tipos de pessoa (configurável)
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_movimentacoes_empresa ON movimentacoes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_tipos_pessoa_empresa ON tipos_pessoa(empresa_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_pessoa ON movimentacoes(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_status ON movimentacoes(status);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON movimentacoes(entrada_em);
CREATE INDEX IF NOT EXISTS idx_pessoas_empresa ON pessoas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pessoas_documento ON pessoas(documento);

-- ============================================
-- RPCs (Funções SQL para paginação)
-- ============================================

-- Buscar movimentações por empresa com paginação
CREATE OR REPLACE FUNCTION get_movimentacoes_por_empresa(
  p_empresa_id UUID,
  p_limit INTEGER DEFAULT 1000,
  p_offset INTEGER DEFAULT 0
)
RETURNS SETOF movimentacoes
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM movimentacoes
  WHERE empresa_id = p_empresa_id
  ORDER BY entrada_em DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Buscar movimentações por período com paginação
CREATE OR REPLACE FUNCTION get_movimentacoes_por_periodo(
  p_empresa_id UUID,
  p_data_inicio TIMESTAMPTZ,
  p_data_fim TIMESTAMPTZ,
  p_limit INTEGER DEFAULT 1000,
  p_offset INTEGER DEFAULT 0,
  p_incluir_excluidas BOOLEAN DEFAULT FALSE
)
RETURNS SETOF movimentacoes
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_incluir_excluidas THEN
    RETURN QUERY
    SELECT *
    FROM movimentacoes
    WHERE empresa_id = p_empresa_id
      AND entrada_em >= p_data_inicio
      AND entrada_em <= p_data_fim
    ORDER BY entrada_em DESC
    LIMIT p_limit
    OFFSET p_offset;
  ELSE
    RETURN QUERY
    SELECT *
    FROM movimentacoes
    WHERE empresa_id = p_empresa_id
      AND entrada_em >= p_data_inicio
      AND entrada_em <= p_data_fim
      AND excluido_em IS NULL
    ORDER BY entrada_em DESC
    LIMIT p_limit
    OFFSET p_offset;
  END IF;
END;
$$;

-- Buscar pessoas por empresa com paginação
CREATE OR REPLACE FUNCTION get_pessoas_por_empresa(
  p_empresa_id UUID,
  p_limit INTEGER DEFAULT 1000,
  p_offset INTEGER DEFAULT 0
)
RETURNS SETOF pessoas
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM pessoas
  WHERE empresa_id = p_empresa_id
  ORDER BY nome ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- ============================================
-- Trigger: Criar perfil automaticamente ao cadastrar usuário
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, nome, empresa_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    COALESCE((NEW.raw_user_meta_data->>'empresa_id')::UUID, (SELECT id FROM empresas LIMIT 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$;

-- Remover trigger se existir e recriar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### 2.4. Criar Empresa Padrão

No SQL Editor, execute:

```sql
INSERT INTO empresas (id, nome)
VALUES ('nuvra', 'Nuvra');
```

### 2.5. Criar Primeiro Usuário Admin

1. No menu lateral, vá em **"Authentication" → "Users"**
2. Clique em **"Add user"**
3. Preencha:
   - **Email**: `admin@nuvra.com`
   - **Password**: `admin123`
4. Clique em **"Create user"**

Agora precisamos vincular este usuário à empresa. No SQL Editor:

```sql
-- Descubra o ID do usuário que você acabou de criar
SELECT id, email FROM auth.users;

-- Substitua 'ID_DO_USUARIO' pelo ID encontrado acima
INSERT INTO user_profiles (id, nome, empresa_id, role)
VALUES ('ID_DO_USUARIO', 'Administrador', 'nuvra', 'owner');
```

---

## 🔧 Passo 3: Configurar o Projeto Local

### 3.1. Criar Arquivo de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

Substitua pelos valores que você anotou no **Passo 2.2**.

### 3.2. Testar Localmente

```bash
npm run dev
```

Acesse: **http://localhost:5173**

Faça login com:
- **Email**: `admin@nuvra.com`
- **Senha**: `admin123`

---

## 🌐 Passo 4: Deploy na Vercel

### 4.1. Criar Repositório no GitHub

```bash
# No diretório do projeto:
git init
git add .
git commit -m "feat: Nuvra - Gestão de Acesso"

# Criar repositório no GitHub (pelo site) e depois:
git remote add origin https://github.com/seu-usuario/nuvra.git
git push -u origin main
```

### 4.2. Conectar com Vercel

1. Acesse [vercel.com](https://vercel.com/) e faça login (use o GitHub)
2. Clique em **"Add New..." → "Project"**
3. Selecione o repositório `nuvra`
4. Em **"Environment Variables"**, adicione:
   - `VITE_SUPABASE_URL` → cole a URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` → cole a chave anônima
5. Clique em **"Deploy"**

### 4.3. Pronto! 🎉

Após alguns minutos, seu Nuvra estará online em:
`https://nuvra.vercel.app`

---

## 🔄 Passo 5: Atualizar o Projeto

Sempre que fizer alterações no código:

```bash
git add .
git commit -m "descrição das alterações"
git push
```

A Vercel faz o deploy automático a cada push no GitHub!

---

## 🐛 Solução de Problemas

### Erro: "Supabase não configurado"
- Verifique se o arquivo `.env.local` existe e está correto
- Confirme se as variáveis de ambiente estão configuradas na Vercel

### Erro: "Tabela não encontrada"
- Execute novamente os scripts SQL no Supabase
- Verifique se está no banco correto

### Erro: "Usuário não autorizado"
- Verifique se o usuário foi criado no Authentication do Supabase
- Confirme se o perfil foi criado na tabela `user_profiles`

### Login não funciona no deploy
- Verifique se as variáveis de ambiente foram configuradas na Vercel
- Faça um novo deploy após corrigir

---

## 📞 Suporte

Se precisar de ajuda:
- Abra uma issue no GitHub
- Consulte a documentação em [`./docs`](./docs/)

---

**Versão**: 1.0.0  
**Status**: ✅ Production Ready  
**Última atualização**: Julho 2026