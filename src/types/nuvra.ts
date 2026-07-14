// Data types for Nuvra - Gestão de Acesso
// Sistema profissional de controle de entrada e saída para estabelecimentos

export interface Empresa {
  id: string;
  nome: string;
  cnpj?: string | null;
  created_at: string;
}

export interface Pessoa {
  id: string;
  empresa_id: string;
  nome: string;        // obrigatório
  documento: string;   // obrigatório
  tipo?: string | null;
  contato?: string | null;
  placa?: string | null;
  created_at: string;
}

export interface AppUser {
  id: string;
  nome: string;
  email: string;
  empresa_id: string;
  role: 'user' | 'admin' | 'owner';
  created_at: string;
}

export type MovimentacaoStatus = 'DENTRO' | 'FORA';

export interface Movimentacao {
  id: string;
  empresa_id: string;
  pessoa_id: string;
  entrada_em: string;   // ISO datetime
  saida_em?: string | null;    // ISO datetime
  status: MovimentacaoStatus;
  observacao?: string | null;
  created_at: string;
}

// Extended types for UI
export interface MovimentacaoComPessoa extends Movimentacao {
  pessoa: Pessoa;
}

export interface PessoaDentro {
  movimentacaoId: string;
  pessoa: Pessoa;
  entradaEm: string;
  observacao?: string | null;
}

// Tipo de Pessoa Configurável
export interface TipoPessoaConfig {
  id: string;
  empresa_id: string;
  nome: string;
  icone: string;        // Nome do ícone (ex: 'User', 'Briefcase')
  cor_texto: string;    // Classe Tailwind (ex: 'text-blue-600')
  cor_fundo: string;    // Classe Tailwind (ex: 'bg-blue-100')
  created_at: string;
}

// Form types
export interface NovaPessoaForm {
  nome: string;
  documento: string;
  tipo?: string;
  contato?: string;
  placa?: string;
}
