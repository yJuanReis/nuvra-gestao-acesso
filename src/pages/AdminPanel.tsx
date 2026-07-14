import { useState, useEffect } from 'react';
import { useNuvra } from '@/contexts/NuvraContext';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings,
  Users,
  Building2,
  LogOut,
  Shield,
  Mail,
  Loader2,
  User,
  UserPlus,
  Trash2,
  Lock,
  ArrowRightLeft,
  Eye,
  Tags,
} from 'lucide-react';
import { AdicionarUsuarioModal } from '@/components/modals/AdicionarUsuarioModal';
import { AlterarSenhaModal } from '@/components/modals/AlterarSenhaModal';
import { RelatoriosModal } from '@/components/modals/RelatoriosModal';
import { GerenciarTiposPessoaModal, GerenciarTiposPessoaPanel } from '@/components/modals/GerenciarTiposPessoaModal';
import { Navigate } from 'react-router-dom';
import { AppUser } from '@/types/nuvra';

export function AdminPanel() {
  const { user, empresaAtual, logout, empresas, pessoas, movimentacoes, getUsuarios, adicionarUsuario, removerUsuario, alterarSenhaUsuario, deletarEmpresa } = useNuvra();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState<string | null>(null);
  const [showDeleteCompanyAlert, setShowDeleteCompanyAlert] = useState<string | null>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [selectedUserForPasswordChange, setSelectedUserForPasswordChange] = useState<{ id: string; nome: string } | null>(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [showRelatoriosModal, setShowRelatoriosModal] = useState(false);
  const [showTiposPessoaModal, setShowTiposPessoaModal] = useState(false);

  // Pagination states
  const [empresasCurrentPage, setEmpresasCurrentPage] = useState(1);
  const [empresasPageSize, setEmpresasPageSize] = useState(20);
  const [usuariosCurrentPage, setUsuariosCurrentPage] = useState(1);
  const [usuariosPageSize, setUsuariosPageSize] = useState(20);

  // Buscar usuários ao montar o componente
  useEffect(() => {
    const carregarUsuarios = async () => {
      setLoadingUsuarios(true);
      try {
        const usuariosData = await getUsuarios();
        setUsuarios(usuariosData);
      } catch (error) {
      } finally {
        setLoadingUsuarios(false);
      }
    };

    carregarUsuarios();
  }, [getUsuarios]);

  // Função para recarregar usuários
  const recarregarUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const usuariosData = await getUsuarios();
      setUsuarios(usuariosData);
    } catch (error) {
    } finally {
      setLoadingUsuarios(false);
    }
  };

  // Função para remover usuário
  const handleRemoverUsuario = async (usuarioId: string) => {
    try {
      await removerUsuario(usuarioId);
      await recarregarUsuarios();
      setShowDeleteAlert(null);
    } catch (error) {
    }
  };

  // Função para abrir modal de alterar senha
  const handleAlterarSenha = (usuarioId: string, nomeUsuario: string) => {
    setSelectedUserForPasswordChange({ id: usuarioId, nome: nomeUsuario });
    setShowChangePasswordModal(true);
  };

  // Pagination helpers
  const getPaginatedItems = (items: any[], currentPage: number, pageSize: number) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  };

  const getTotalPages = (totalItems: number, pageSize: number) => {
    return Math.ceil(totalItems / pageSize);
  };

  const resetPaginationOnTabChange = (tab: string) => {
    if (tab === 'empresas') {
      setEmpresasCurrentPage(1);
    } else if (tab === 'usuarios') {
      setUsuariosCurrentPage(1);
    }
  };

  // Handle tab change to reset pagination and validate permissions
  const handleTabChange = (value: string) => {
    // Apenas usuários comuns são restritos às abas de empresas e usuários
    if (user?.role === 'user' && (value === 'empresas' || value === 'usuarios')) {
      // Manter na aba atual ou redirecionar para dashboard
      return;
    }

    setActiveTab(value);
    resetPaginationOnTabChange(value);
  };

  // Verificar se usuário está autenticado e tem permissões adequadas
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>Você precisa estar logado para acessar o painel administrativo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600 text-center">
              Faça login no sistema principal para acessar esta área.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verificar se usuário tem role admin ou owner
  if (!user || !['admin', 'owner'].includes(user.role)) {
    // Redirecionar para página de acesso negado
    return <Navigate to="/unauthorized" replace />;
  }


  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="mb-8">

        </div>

        {/* Main Navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <div className="flex items-center justify-center">
              <TabsList className={`grid w-full bg-white shadow-sm border ${
              user?.role === 'owner'
                ? 'max-w-2xl grid-cols-2 sm:grid-cols-5'
                : 'max-w-lg grid-cols-1'
            }`}>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>

              {/* Abas visíveis apenas para owners */}
              {user?.role === 'owner' && (
                <>
                  <TabsTrigger value="empresas" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Empresas</span>
                  </TabsTrigger>
                  <TabsTrigger value="usuarios" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Usuários</span>
                  </TabsTrigger>
                  <TabsTrigger value="tipos" className="flex items-center gap-2">
                    <Tags className="h-4 w-4" />
                    <span className="hidden sm:inline">Tipos</span>
                  </TabsTrigger>
                  <TabsTrigger value="configuracoes" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Info</span>
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Empresas</p>
                      <p className="text-3xl font-bold text-blue-900">{empresas.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Usuários {empresaAtual?.nome || 'Sistema'}</p>
                      <p className="text-3xl font-bold text-green-900">
                        {usuarios.filter(u => u.empresa_id === user?.empresa_id).length}
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Empresa: {empresaAtual?.nome || 'Marina não encontrada'}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Total Pessoas</p>
                      <p className="text-3xl font-bold text-purple-900">{pessoas.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Movimentações Hoje</p>
                      <p className="text-3xl font-bold text-orange-900">
                        {movimentacoes.filter(m =>
                          // Owner vê todas as empresas, outros usuários veem só a deles
                          (user?.role === 'owner' || m.empresa_id === user?.empresa_id) &&
                          new Date(m.entrada_em).toDateString() === new Date().toDateString()
                        ).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                      <ArrowRightLeft className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

                        {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => setShowAddUserModal(true)}
                  className="h-20 flex-col gap-2 bg-blue-500 hover:bg-blue-600 hover:text-white"
                >
                  <UserPlus className="h-6 w-6" />
                  <span>Adicionar Usuário</span>
                </Button>

                <Button
                  className="h-20 flex-col gap-2 bg-purple-500 hover:bg-purple-600 hover:text-white"
                  onClick={() => setShowRelatoriosModal(true)}
                >
                  <Users className="h-6 w-6" />
                  <span>Ver Relatórios</span>
                </Button>

              </div>



          </TabsContent>

          {/* Empresas Tab */}
          <TabsContent value="empresas" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Gerenciar Empresas</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {empresas.length} empresa{empresas.length !== 1 ? 's' : ''} cadastrada{empresas.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Itens por página:</span>
                  <Select
                    value={empresasPageSize.toString()}
                    onValueChange={(value) => {
                      setEmpresasPageSize(parseInt(value));
                      setEmpresasCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="bg-green-500 hover:bg-green-600">
                  <Building2 className="h-4 w-4 mr-2" />
                  Nova Empresa
                </Button>
              </div>
            </div>

            {empresas.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma empresa cadastrada</h3>
                  <p className="text-slate-500 mb-4">Comece criando sua primeira marina</p>
                  <Button>
                    <Building2 className="h-4 w-4 mr-2" />
                    Criar Primeira Empresa
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-4">
                  {getPaginatedItems(empresas, empresasCurrentPage, empresasPageSize).map((empresa) => (
                    <Card key={empresa.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-slate-900">{empresa.nome}</h3>

                              <p className="text-xs text-slate-400">
                                Criado em {new Date(empresa.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-sm font-medium text-slate-900">
                                {pessoas.filter(p => p.empresa_id === empresa.id).length} pessoas
                              </div>
                            </div>

                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {empresa.ativa ? 'Ativa' : 'Inativa'}
                            </Badge>

                            {(user?.role === 'admin' || empresa.id === user?.empresa_id) && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                              >
                                <User className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowDeleteCompanyAlert(empresa.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {getTotalPages(empresas.length, empresasPageSize) > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      Mostrando {Math.min((empresasCurrentPage - 1) * empresasPageSize + 1, empresas.length)} a{' '}
                      {Math.min(empresasCurrentPage * empresasPageSize, empresas.length)} de {empresas.length} empresas
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => empresasCurrentPage > 1 && setEmpresasCurrentPage(empresasCurrentPage - 1)}
                            className={empresasCurrentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>

                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, getTotalPages(empresas.length, empresasPageSize)) }, (_, i) => {
                          const totalPages = getTotalPages(empresas.length, empresasPageSize);
                          let pageNum;

                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (empresasCurrentPage <= 3) {
                            pageNum = i + 1;
                          } else if (empresasCurrentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = empresasCurrentPage - 2 + i;
                          }

                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => setEmpresasCurrentPage(pageNum)}
                                isActive={empresasCurrentPage === pageNum}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => empresasCurrentPage < getTotalPages(empresas.length, empresasPageSize) && setEmpresasCurrentPage(empresasCurrentPage + 1)}
                            className={empresasCurrentPage >= getTotalPages(empresas.length, empresasPageSize) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </TabsContent>



          {/* Usuários Tab */}
          <TabsContent value="usuarios" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Gerenciar Usuários</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {user?.role === 'owner' 
                    ? `${usuarios.length} usuário${usuarios.length !== 1 ? 's' : ''} no sistema`
                    : `${usuarios.filter(u => u.empresa_id === user?.empresa_id).length} usuário${usuarios.filter(u => u.empresa_id === user?.empresa_id).length !== 1 ? 's' : ''} ${empresaAtual?.nome || 'Sistema'}`
                  }
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Itens por página:</span>
                  <Select
                    value={usuariosPageSize.toString()}
                    onValueChange={(value) => {
                      setUsuariosPageSize(parseInt(value));
                      setUsuariosCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => setShowAddUserModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Adicionar Usuário
                </Button>
              </div>
            </div>

            {loadingUsuarios ? (
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin mr-3" />
                    <span className="text-lg text-slate-600">Carregando usuários...</span>
                  </div>
                </CardContent>
              </Card>
            ) : (user?.role === 'owner' ? usuarios.length === 0 : usuarios.filter(u => u.empresa_id === user?.empresa_id).length === 0) ? (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum usuário encontrado</h3>
                  <p className="text-slate-500 mb-4">Comece adicionando seu primeiro usuário</p>
                  <Button onClick={() => setShowAddUserModal(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Usuário
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-4">
                  {getPaginatedItems(
                    user?.role === 'owner' ? usuarios : usuarios.filter(usuario => usuario.empresa_id === user?.empresa_id),
                    usuariosCurrentPage,
                    usuariosPageSize
                  ).map((usuario) => (
                    <Card key={usuario.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-slate-900">{usuario.nome}</h3>
                              {usuario.email && (
                                <p className="text-sm text-slate-500">{usuario.email}</p>
                              )}
                              <p className="text-xs text-slate-400">
                                Empresa: {empresas.find(e => e.id === usuario.empresa_id)?.nome || usuario.empresa_id || 'Não associada'}
                              </p>
                              <p className="text-xs text-slate-400">
                                Criado em {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Badge
                            variant={usuario.role === 'admin' || usuario.role === 'owner' ? 'default' : 'secondary'}
                            className={usuario.role === 'admin' || usuario.role === 'owner' ? 'bg-purple-500 hover:bg-purple-600' : ''}
                          >
                            {usuario.role === 'admin' || usuario.role === 'owner' ? 'Dono' : 'Usuário'}
                          </Badge>

                            <div className="flex gap-2">
                              {(user?.role === 'admin' || user?.role === 'owner') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAlterarSenha(usuario.id, usuario.nome)}
                                  title="Alterar senha do usuário"
                                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                >
                                  <Lock className="h-4 w-4" />
                                </Button>
                              )}

                              {usuario.id !== user?.id && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowDeleteAlert(usuario.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {getTotalPages(user?.role === 'owner' ? usuarios.length : usuarios.filter(u => u.empresa_id === user?.empresa_id).length, usuariosPageSize) > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      {(() => {
                        const filteredUsuarios = user?.role === 'owner' ? usuarios : usuarios.filter(u => u.empresa_id === user?.empresa_id);
                        const total = filteredUsuarios.length;
                        const start = Math.min((usuariosCurrentPage - 1) * usuariosPageSize + 1, total);
                        const end = Math.min(usuariosCurrentPage * usuariosPageSize, total);
                        return `Mostrando ${start} a ${end} de ${total} usuários`;
                      })()}
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => usuariosCurrentPage > 1 && setUsuariosCurrentPage(usuariosCurrentPage - 1)}
                            className={usuariosCurrentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>

                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, getTotalPages(user?.role === 'owner' ? usuarios.length : usuarios.filter(u => u.empresa_id === user?.empresa_id).length, usuariosPageSize)) }, (_, i) => {
                          const filteredUsuarios = user?.role === 'owner' ? usuarios : usuarios.filter(u => u.empresa_id === user?.empresa_id);
                          const totalPages = getTotalPages(filteredUsuarios.length, usuariosPageSize);
                          let pageNum;

                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (usuariosCurrentPage <= 3) {
                            pageNum = i + 1;
                          } else if (usuariosCurrentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = usuariosCurrentPage - 2 + i;
                          }

                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => setUsuariosCurrentPage(pageNum)}
                                isActive={usuariosCurrentPage === pageNum}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => {
                              const filteredUsuarios = user?.role === 'owner' ? usuarios : usuarios.filter(u => u.empresa_id === user?.empresa_id);
                              usuariosCurrentPage < getTotalPages(filteredUsuarios.length, usuariosPageSize) && setUsuariosCurrentPage(usuariosCurrentPage + 1);
                            }}
                            className={usuariosCurrentPage >= getTotalPages(user?.role === 'owner' ? usuarios.length : usuarios.filter(u => u.empresa_id === user?.empresa_id).length, usuariosPageSize) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </TabsContent>


          {/* Tipos de Pessoa Tab */}
          <TabsContent value="tipos" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Tipos de Pessoa</h2>
              <p className="text-sm text-slate-500">
                Crie e personalize os tipos de pessoa do seu estabelecimento
              </p>
            </div>
            <Card>
              <CardContent className="p-6">
                <GerenciarTiposPessoaPanel />
              </CardContent>
            </Card>
          </TabsContent>


          {/* Configurações Tab */}
          <TabsContent value="configuracoes" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Informações do Sistema</h2>
                
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Database Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Banco de Dados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => window.open('https://supabase.com/dashboard/project/wdqtueefgwwkxelhaajr', '_blank')}
                      >
                        <span className="text-sm font-medium text-slate-700">Backend</span>
                        <Badge variant="secondary">Supabase</Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <div className="space-y-2">
                        <div className="font-semibold text-sm">Acesso ao Supabase</div>
                        <div className="text-xs space-y-1">
                          <div><strong>Email:</strong> suporte@nuvra.com</div>
                          <div><strong>Senha:</strong> padrão</div>
                          <div className="text-blue-600 font-medium">Clique para abrir painel</div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-700">Conexão</span>
                    <Badge className="bg-green-500">Online</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-700">RLS Policies</span>
                    <Badge variant="outline">Ativas</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-purple-700">Tabelas</span>
                    <Badge variant="outline">4 Ativas</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Hosting Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-black rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">V</span>
                    </div>
                    Hosting
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-black/5 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">Plataforma</span>
                    <Badge className="bg-black text-white">Vercel</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-700">Status</span>
                    <Badge className="bg-green-500">Ativo</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-700">Região</span>
                    <Badge variant="outline">São Paulo</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-purple-700">Último Deploy</span>
                    <Badge variant="outline">Agora</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Saúde do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-700">Uptime</span>
                    <Badge className="bg-green-500">99.9%</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-700">Última Verificação</span>
                    <Badge variant="outline">
                      {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-purple-700">Erros Hoje</span>
                    <Badge variant="outline">0</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

          </TabsContent>
        </Tabs>

        {/* Logout Button */}
        <div className="mt-8 flex justify-center">
          <Button
            variant="destructive"
            onClick={() => setShowLogoutAlert(true)}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair do Painel Admin
          </Button>
        </div>
      </main>

      {/* Logout Confirmation */}
      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair do Sistema?</AlertDialogTitle>
            <AlertDialogDescription>
              Você será desconectado e retornará à página de login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                logout();
                setShowLogoutAlert(false);
              }}
            >
              Sair
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add User Modal */}
      <AdicionarUsuarioModal
        open={showAddUserModal}
        onOpenChange={(open) => {
          setShowAddUserModal(open);
          if (!open) {
            // Recarregar usuários quando o modal for fechado
            recarregarUsuarios();
          }
        }}
      />

      {/* Delete User Confirmation */}
      <AlertDialog open={!!showDeleteAlert} onOpenChange={() => setShowDeleteAlert(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O usuário será permanentemente removido do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showDeleteAlert && handleRemoverUsuario(showDeleteAlert)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Company Confirmation */}
      <AlertDialog open={!!showDeleteCompanyAlert} onOpenChange={() => setShowDeleteCompanyAlert(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Empresa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá remover permanentemente a empresa do sistema.
              Certifique-se de que não há usuários ou dados associados antes de continuar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (showDeleteCompanyAlert) {
                  try {
                    await deletarEmpresa(showDeleteCompanyAlert);
                  } catch (error) {
                  }
                  setShowDeleteCompanyAlert(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar Empresa
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reports Modal */}
      <RelatoriosModal
        open={showRelatoriosModal}
        onOpenChange={setShowRelatoriosModal}
      />

      {/* Tipos de Pessoa Modal */}
      <GerenciarTiposPessoaModal
        open={showTiposPessoaModal}
        onOpenChange={setShowTiposPessoaModal}
      />

      {/* Change Password Modal */}
      <AlterarSenhaModal
        open={showChangePasswordModal}
        onOpenChange={(open) => {
          setShowChangePasswordModal(open);
          if (!open) {
            setSelectedUserForPasswordChange(null);
          }
        }}
        usuarioId={selectedUserForPasswordChange?.id || ''}
        nomeUsuario={selectedUserForPasswordChange?.nome || ''}
      />
    </div>
  </TooltipProvider>
  );
}