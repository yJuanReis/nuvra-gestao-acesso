# Sistema de Tipos de Pessoa Configuráveis

## Visão Geral

Atualmente, os tipos de pessoa no Nuvra são **fixos no código** (`cliente`, `visita`, `colaborador`, `prestador`, `proprietário`). Este documento descreve o plano para tornar esses tipos **configuráveis dinamicamente** através do painel administrativo.

## Status Atual

- ✅ Tipos fixos funcionando normalmente
- ❌ Não há interface de configuração no Admin
- ❌ Tipos salvos apenas como string no banco

## Estrutura Proposta

### 1. Tabela no Supabase

```sql
CREATE TABLE tipos_pessoa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  icone VARCHAR(50) DEFAULT 'User',
  cor VARCHAR(20) DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, nome)
);

-- Índice para busca por empresa
CREATE INDEX idx_tipos_pessoa_empresa ON tipos_pessoa(empresa_id);
```

### 2. Interface no Admin Panel

Nova aba "Tipos de Pessoa" com:

- **Lista de tipos cadastrados** (tabela com nome, ícone, cor)
- **Formulário para criar novo tipo** (nome, ícone, cor)
- **Ações**: Editar, Excluir
- **Ordem personalizada** (drag-and-drop opcional)

### 3. Impacto nos Componentes

| Componente | Mudança Necessária |
|------------|-------------------|
| `CadastrarPessoaModal.tsx` | Select dinâmico em vez de valores fixos |
| `EditarPessoaModal.tsx` | Select dinâmico em vez de valores fixos |
| `RegistrarEntradaModal.tsx` | Select dinâmico em vez de valores fixos |
| `Pessoas.tsx` | Filtro dinâmico em vez de hardcoded |
| `HistoricoPage.tsx` | Filtro dinâmico em vez de hardcoded |
| `userTypeIcons.tsx` | Mapeamento dinâmico ícone/cor baseado na configuração |

### 4. Fluxo de Dados

```
AdminPanel (configura) 
  → tipos_pessoa (Supabase) 
    → NuvraContext (carrega) 
      → Componentes UI (utilizam)
```

### 5. Implementação Futura

1. **Backend**: Criar tabela `tipos_pessoa` e RPCs para CRUD
2. **Contexto**: Adicionar `tiposPessoa` ao `NuvraContext` com funções `adicionarTipoPessoa`, `removerTipoPessoa`, `atualizarTipoPessoa`
3. **Admin**: Nova aba "Tipos de Pessoa" com formulário CRUD
4. **UI**: Substituir selects fixos por dinâmicos baseados no estado do contexto
5. **Ícones**: Usar biblioteca lucide-react para seleção de ícones

### Prioridade

🔵 **Média** - Funcionalidade desejada para melhoria da experiência, mas não crítica para o MVP.