import { 
  Users,
  User,
  Gift,
  Ship,
  Briefcase,
  Wrench,
  HelpCircle
} from 'lucide-react';
import { Pessoa, TipoPessoaConfig } from '@/types/nuvra';
import { getIconByName } from '@/lib/iconDatabase';

// Mantém fallback para tipos fixos (quando não há configuração no banco)
export function getIconForUserType(tipo?: string | null, tiposPessoa?: TipoPessoaConfig[]) {
  // Se temos tipos configurados, buscar pelo nome
  if (tiposPessoa && tipo) {
    const config = tiposPessoa.find(t => t.nome === tipo);
    if (config) {
      return getIconByName(config.icone);
    }
  }
  
  // Fallback para tipos fixos
  switch (tipo) {
    case 'cliente':
      return Users;
    case 'visita':
      return Gift;
    case 'marinheiro':
      return Ship;
    case 'prestador':
      return Wrench;
    case 'proprietario':
      return Briefcase;
    case 'colaborador':
      return User;
    default:
      return HelpCircle;
  }
}

export function getColorForUserType(tipo?: string | null, tiposPessoa?: TipoPessoaConfig[]) {
  if (tiposPessoa && tipo) {
    const config = tiposPessoa.find(t => t.nome === tipo);
    if (config) return config.cor_texto;
  }
  
  switch (tipo) {
    case 'cliente': return 'text-blue-600';
    case 'visita': return 'text-green-600';
    case 'marinheiro': return 'text-blue-800';
    case 'prestador': return 'text-gray-600';
    case 'proprietario': return 'text-purple-600';
    case 'colaborador': return 'text-green-600';
    default: return 'text-gray-600';
  }
}

export function getBgColorForUserType(tipo?: string | null, tiposPessoa?: TipoPessoaConfig[]) {
  if (tiposPessoa && tipo) {
    const config = tiposPessoa.find(t => t.nome === tipo);
    if (config) return config.cor_fundo;
  }
  
  switch (tipo) {
    case 'cliente': return 'bg-blue-100';
    case 'visita': return 'bg-orange-100';
    case 'marinheiro': return 'bg-teal-100';
    case 'prestador': return 'bg-gray-100';
    case 'proprietario': return 'bg-purple-100';
    case 'colaborador': return 'bg-green-100';
    default: return 'bg-muted';
  }
}

interface UserTypeProps {
  pessoa: Pessoa;
  tiposPessoa?: TipoPessoaConfig[];
  size?: 'sm' | 'md' | 'lg';
}

export function UserTypeIcon({ pessoa, tiposPessoa, size = 'sm' }: UserTypeProps) {
  const Icon = getIconForUserType(pessoa.tipo, tiposPessoa);
  const colorClass = getColorForUserType(pessoa.tipo, tiposPessoa);
  
  const sizeMap = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-6 w-6',
  };

  return <Icon className={`${sizeMap[size]} ${colorClass}`} />;
}

export function UserTypeAvatar({ pessoa, tiposPessoa }: UserTypeProps) {
  const Icon = getIconForUserType(pessoa.tipo, tiposPessoa);
  const colorClass = getColorForUserType(pessoa.tipo, tiposPessoa);
  const bgColorClass = getBgColorForUserType(pessoa.tipo, tiposPessoa);

  return (
    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${bgColorClass} flex-shrink-0`}>
      <Icon className={`h-5 w-5 ${colorClass}`} />
    </div>
  );
}