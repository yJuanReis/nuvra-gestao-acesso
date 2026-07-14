# 🚀 COMECE AQUI - Guia de Início Rápido

Bem-vindo ao Sistema de Controle de Acesso! Este guia rápido irá ajudá-lo a entender e usar o sistema em 5 passos simples.

## 📋 Passo 1: Entenda o Sistema (2 minutos)

O Sistema de Controle de Acesso é uma aplicação web completa para gerenciar entradas e saídas de pessoas e veículos em empresas e estabelecimentos.

### Principais Funcionalidades:
- **Cadastro de Pessoas**: Registre funcionários, visitantes e fornecedores
- **Registro de Acesso**: Controle de entradas e saídas em tempo real
- **Histórico**: Consulta avançada de todos os acessos
- **Multi-empresa**: Isolamento total entre diferentes empresas
- **Administração**: Gestão de usuários e permissões

## 📋 Passo 2: Primeiros Passos (3 minutos)

### 1. Acesse o Sistema
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/sistema-controle-acesso.git

# Entre na pasta
cd sistema-controle-acesso

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### 2. Acesse o App
- Abra seu navegador e acesse: `http://localhost:5173`
- **Login**: use o usuário admin criado no Supabase (ex.: `admin@nuvra.com`)
  — veja o Passo 3. Não há login mock: o app exige Supabase configurado.
- Explore as funcionalidades básicas

## 📋 Passo 3: Configuração Básica (5 minutos)

### Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Banco de Dados (Supabase)
1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. No SQL Editor, cole e execute o script completo:
   - [`SETUP_SUPABASE_DEMO.sql`](./SETUP_SUPABASE_DEMO.sql)
4. Crie o usuário admin e promova a owner seguindo o
   [Tutorial de Instalação](./TUTORIAL_INSTALACAO.md) (passos 2.6+)

## 📋 Passo 4: Primeiro Uso (10 minutos)

### 1. Cadastre uma Pessoa
- Acesse "Cadastro de Pessoas"
- Preencha os campos obrigatórios (Nome e Documento)
- Salve o registro

### 2. Registre uma Entrada
- Acesse "Registro de Acesso"
- Selecione a pessoa cadastrada
- Clique em "Registrar Entrada"

### 3. Registre uma Saída
- Volte ao "Registro de Acesso"
- Selecione a pessoa que está "DENTRO"
- Clique em "Registrar Saída"

### 4. Consulte o Histórico
- Acesse "Histórico de Acessos"
- Use os filtros para buscar registros específicos
- Exporte relatórios em PDF ou Excel

## 📋 Passo 5: Próximos Passos (5 minutos)

### Para Desenvolvedores
- **Documentação Completa**: [docs/DESENVOLVIMENTO.md](./DESENVOLVIMENTO.md)
- **API Reference**: [docs/API.md](./API.md)
- **Testes**: [docs/CHECKLIST.md](./CHECKLIST.md)

### Para Administradores
- **Configurações**: Ajuste permissões e configurações do sistema
- **Usuários**: Gerencie contas de administradores e operadores
- **Relatórios**: Configure relatórios personalizados

### Para Gestores
- **Visão Executiva**: [docs/SUMARIO_EXECUTIVO.md](./SUMARIO_EXECUTIVO.md)
- **Métricas**: Acompanhe estatísticas e indicadores
- **Segurança**: Entenda os controles de acesso e auditoria

## 🎯 Dicas Rápidas

### Atalhos do Sistema
- **Ctrl + N**: Novo cadastro de pessoa
- **Ctrl + E**: Registrar entrada
- **Ctrl + S**: Registrar saída
- **Ctrl + H**: Abrir histórico

### Principais Telas
1. **Dashboard**: Visão geral do sistema
2. **Cadastro**: Gerencie pessoas e veículos
3. **Acesso**: Registre entradas e saídas
4. **Histórico**: Consulte e exporte relatórios
5. **Admin**: Configure usuários e permissões

### Suporte
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/sistema-controle-acesso/issues)
- **Documentação**: [Documentação Completa](./INDEX.md)
- **Comunidade**: [Discord/Slack](link-para-comunidade)

---

## ✅ Checklist de Início

- [ ] Sistema instalado e rodando
- [ ] Demo testada e funcional
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados configurado
- [ ] Primeira pessoa cadastrada
- [ ] Primeiro acesso registrado
- [ ] Histórico consultado
- [ ] Documentação lida

**Próximo passo recomendado**: [Documentação Completa](./INDEX.md)

---

> **Dica**: Este é apenas o começo! O sistema oferece muito mais funcionalidades avançadas. Explore a documentação completa para descobrir todos os recursos disponíveis.