import {
  // Pessoas
  User, Users, UserCircle, UserCheck, UserPlus, UserX,
  // Profissões
  Briefcase, Wrench, HardHat, Stethoscope, GraduationCap,
  // Transporte
  Car, Truck, Ship, Plane, Bike,
  // Serviços
  ShoppingBag, Store, Building2, Home, Hotel,
  // Natureza
  TreePine, Flower2, Sun, Cloud, Waves,
  // Diversos
  Star, Heart, Shield, Award, Gift,
  // Outros
  HelpCircle, Smile, BookOpen, Music, Camera
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface IconOption {
  name: string;
  icon: LucideIcon;
  keywords: string[];
}

export const ICON_DATABASE: IconOption[] = [
  // Pessoas
  { name: 'User', icon: User, keywords: ['pessoa', 'usuário', 'padrão'] },
  { name: 'Users', icon: Users, keywords: ['grupo', 'equipe', 'pessoas'] },
  { name: 'UserCircle', icon: UserCircle, keywords: ['perfil', 'avatar', 'círculo'] },
  { name: 'UserCheck', icon: UserCheck, keywords: ['verificado', 'aprovado', 'confirmado'] },
  { name: 'UserPlus', icon: UserPlus, keywords: ['novo', 'adicionar', 'convidar'] },
  { name: 'UserX', icon: UserX, keywords: ['removido', 'bloqueado', 'cancelado'] },

  // Profissões
  { name: 'Briefcase', icon: Briefcase, keywords: ['trabalho', 'profissional', 'colaborador', 'funcionário'] },
  { name: 'Wrench', icon: Wrench, keywords: ['mecânico', 'técnico', 'ferramenta', 'prestador'] },
  { name: 'HardHat', icon: HardHat, keywords: ['obra', 'construção', 'engenheiro', 'operário'] },
  { name: 'Stethoscope', icon: Stethoscope, keywords: ['médico', 'saúde', 'hospital', 'doutor'] },
  { name: 'GraduationCap', icon: GraduationCap, keywords: ['estudante', 'escola', 'professor', 'aluno'] },

  // Transporte
  { name: 'Car', icon: Car, keywords: ['carro', 'veículo', 'automóvel', 'motorista'] },
  { name: 'Truck', icon: Truck, keywords: ['caminhão', 'entrega', 'frete', 'logística'] },
  { name: 'Ship', icon: Ship, keywords: ['navio', 'barco', 'marinha', 'náutico'] },
  { name: 'Plane', icon: Plane, keywords: ['avião', 'voo', 'piloto', 'aéreo'] },
  { name: 'Bike', icon: Bike, keywords: ['bicicleta', 'ciclista', 'entrega'] },

  // Serviços
  { name: 'ShoppingBag', icon: ShoppingBag, keywords: ['compra', 'cliente', 'loja', 'shopping'] },
  { name: 'Store', icon: Store, keywords: ['comércio', 'venda', 'negócio', 'estabelecimento'] },
  { name: 'Building2', icon: Building2, keywords: ['empresa', 'prédio', 'corporativo', 'escritório'] },
  { name: 'Home', icon: Home, keywords: ['casa', 'residência', 'morador', 'familiar'] },
  { name: 'Hotel', icon: Hotel, keywords: ['hospedagem', 'hóspede', 'turista'] },

  // Natureza
  { name: 'TreePine', icon: TreePine, keywords: ['árvore', 'natureza', 'jardim', 'parque'] },
  { name: 'Flower2', icon: Flower2, keywords: ['flor', 'jardinagem', 'planta'] },
  { name: 'Sun', icon: Sun, keywords: ['sol', 'praia', 'verão', 'claro'] },
  { name: 'Cloud', icon: Cloud, keywords: ['nuvem', 'tempo', 'clima'] },
  { name: 'Waves', icon: Waves, keywords: ['onda', 'mar', 'praia', 'náutico'] },

  // Diversos
  { name: 'Star', icon: Star, keywords: ['estrela', 'favorito', 'destaque', 'vip'] },
  { name: 'Heart', icon: Heart, keywords: ['coração', 'amor', 'saúde', 'vida'] },
  { name: 'Shield', icon: Shield, keywords: ['escudo', 'segurança', 'proteção', 'vigilante'] },
  { name: 'Award', icon: Award, keywords: ['prêmio', 'troféu', 'conquista', 'vip'] },
  { name: 'Gift', icon: Gift, keywords: ['presente', 'visita', 'convidado', 'surpresa'] },

  // Outros
  { name: 'Smile', icon: Smile, keywords: ['sorriso', 'feliz', 'cliente', 'visita'] },
  { name: 'BookOpen', icon: BookOpen, keywords: ['livro', 'estudo', 'biblioteca', 'leitura'] },
  { name: 'Music', icon: Music, keywords: ['música', 'artista', 'evento', 'show'] },
  { name: 'Camera', icon: Camera, keywords: ['câmera', 'foto', 'fotógrafo', 'evento'] },
];

export function getIconByName(name: string): LucideIcon {
  const found = ICON_DATABASE.find(i => i.name === name);
  return found?.icon || HelpCircle;
}

export function getDefaultIcons(): { name: string; icon: LucideIcon }[] {
  return ICON_DATABASE.map(i => ({ name: i.name, icon: i.icon }));
}

export const ICON_COLORS = [
  { name: 'Azul', value: 'text-blue-600', bg: 'bg-blue-100', hex: '#2563eb' },
  { name: 'Verde', value: 'text-green-600', bg: 'bg-green-100', hex: '#16a34a' },
  { name: 'Roxo', value: 'text-purple-600', bg: 'bg-purple-100', hex: '#9333ea' },
  { name: 'Laranja', value: 'text-orange-600', bg: 'bg-orange-100', hex: '#ea580c' },
  { name: 'Vermelho', value: 'text-red-600', bg: 'bg-red-100', hex: '#dc2626' },
  { name: 'Teal', value: 'text-teal-600', bg: 'bg-teal-100', hex: '#0d9488' },
  { name: 'Rosa', value: 'text-pink-600', bg: 'bg-pink-100', hex: '#db2777' },
  { name: 'Índigo', value: 'text-indigo-600', bg: 'bg-indigo-100', hex: '#4f46e5' },
  { name: 'Amarelo', value: 'text-yellow-600', bg: 'bg-yellow-100', hex: '#ca8a04' },
  { name: 'Ciano', value: 'text-cyan-600', bg: 'bg-cyan-100', hex: '#0891b2' },
  { name: 'Cinza', value: 'text-gray-600', bg: 'bg-gray-100', hex: '#4b5563' },
  { name: 'Esmeralda', value: 'text-emerald-600', bg: 'bg-emerald-100', hex: '#059669' },
];