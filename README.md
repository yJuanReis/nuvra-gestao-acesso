# Nuvra - Gestão de Acesso 🏢

Um sistema profissional web para controle de entrada e saída de pessoas em estabelecimentos.

## 🚀 Quick Start

### **Opção 1: Demo Rápido (Modo Desenvolvimento)**
```bash
npm install
npm run dev
```

Acesse: `http://localhost:5173`

**Demo Login**: Qualquer email/senha funciona

### **Opção 2: Produção Completa (Supabase)**

#### **1. Configurar Supabase**
```bash
# Execute estes scripts no SQL Editor do Supabase:
1. database_setup.sql
2. database_fix.sql
3. database_final_fix.sql
4. add_owner_user.sql
```

#### **2. Configurar Ambiente**
```bash
# Crie arquivo .env.local:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### **3. Executar**
```bash
npm install
npm run dev
```

**Login Produção:**
- Email: `admin@empresa.com`
- Senha: `admin123`

---

## 📚 Documentação

Toda a documentação está em [`./docs`](./docs/):

| Documento | Descrição | Tempo |
|-----------|-----------|-------|
| **[ COMECE_AQUI.md](./docs/COMECE_AQUI.md)** | Ponto de entrada - 5 passos | 5 min |
| **[📖 INDEX.md](./docs/INDEX.md)** | Índice - Navegação | 5 min |
| **[🎯 DOCUMENTACAO.md](./docs/DOCUMENTACAO.md)** | Guia completo do sistema | 15 min |
| **[🛠️ DESENVOLVIMENTO.md](./docs/DESENVOLVIMENTO.md)** | Como desenvolver/estender | 20 min |
| **[🔌 API.md](./docs/API.md)** | Referência de métodos | 25 min |
| **[✅ CHECKLIST.md](./docs/CHECKLIST.md)** | QA, testes e boas práticas | 15 min |
| **[📋 SUMARIO_EXECUTIVO.md](./docs/SUMARIO_EXECUTIVO.md)** | Visão executiva | 10 min |

---

## ✨ Funcionalidades

- ✅ **Login & Autenticação** - Demo funcional
- ✅ **Cadastro de Pessoas** - Compartilhadas entre empresas
- ✅ **Registrar Entrada/Saída** - Com validações
- ✅ **Histórico** - Com 5 filtros avançados
- ✅ **Multi-empresa** - Isolamento completo
- ✅ **Responsivo** - Mobile, tablet, desktop
- ✅ **Design System** - Interface profissional

---

## 🏗️ Stack

- **React 18** + TypeScript
- **Tailwind CSS** + Shadcn/ui
- **React Router** + Context API
- **Vite** + Bun

---

## 📁 Estrutura

```
.
├── docs/                    # 📚 Documentação completa
├── src/
│   ├── components/          # React components
│   ├── contexts/            # Estado global (NuvraContext)
│   ├── types/              # TypeScript types
│   ├── data/               # Mock data
│   └── pages/              # Rotas
├── package.json
└── tsconfig.json
```

---

## 🔐 Regras de Negócio

1. **Nome e documento** sempre obrigatórios
2. **Uma entrada aberta por vez** (mesma empresa)
3. **Saída apenas se DENTRO** (validado)
4. **Isolamento por empresa** (usuário só vê sua empresa)
5. **Pessoa compartilhada** (entre múltiplas empresas)

---

## 🚀 Primeiros Passos

### 1. Documentação
👉 Leia [docs/INDEX.md](./docs/INDEX.md)

### 2. Rode o Projeto
```bash
npm install
npm run dev
```

### 3. Explore o Sistema
- Login: qualquer email/senha
- Cadastre uma pessoa
- Registre entrada
- Registre saída
- Veja histórico

---

## 📖 Documentação Específica

- **Para Usar**: [docs/DOCUMENTACAO.md](./docs/DOCUMENTACAO.md)
- **Para Desenvolver**: [docs/DESENVOLVIMENTO.md](./docs/DESENVOLVIMENTO.md)
- **Para Entender API**: [docs/API.md](./docs/API.md)
- **Para QA/Testes**: [docs/CHECKLIST.md](./docs/CHECKLIST.md)
- **Para Gestores**: [docs/SUMARIO_EXECUTIVO.md](./docs/SUMARIO_EXECUTIVO.md)

---

## ✅ Status

- ✅ Código completo e funcional
- ✅ TypeScript 100% typed
- ✅ Documentação extensiva
- ✅ Production ready
- ✅ Preparado para Supabase

---

## 🎯 Principais Telas

### Dashboard
- Visão geral do sistema
- Estatísticas de acesso
- Alertas e notificações

### Cadastro de Pessoas
- Registro de novos usuários
- Edição de informações
- Histórico de acessos

### Registro de Acesso
- Entrada de pessoas
- Saída de pessoas
- Validação em tempo real

### Histórico de Acessos
- Filtros avançados
- Exportação de relatórios
- Busca inteligente

### Administração
- Gestão de usuários
- Configurações do sistema
- Controle de permissões

---

## 🔧 Configuração Avançada

### Variáveis de Ambiente
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME="Nuvra - Gestão de Acesso"
VITE_APP_VERSION="1.0.0"
```

### Build para Produção
```bash
npm run build
npm run preview
```

### Deploy
- **Vercel**: `vercel`
- **Netlify**: `netlify deploy`
- **Docker**: Imagem disponível no Docker Hub

---

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature: `git checkout -b feature/nome-da-feature`
3. Commit suas mudanças: `git commit -m 'Adiciona feature X'`
4. Push para a branch: `git push origin feature/nome-da-feature`
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🙏 Agradecimentos

- **React Community** - Pelo ecossistema incrível
- **Supabase** - Por fornecer backend moderno
- **Tailwind CSS** - Por simplificar o design
- **Todos os contribuidores** - Por melhorar o projeto

---

**Versão**: 1.0.0  
**Status**: ✅ Production Ready  
**Última atualização**: Julho 2026

Boa sorte! 🏢🔒