import React from 'react';
import { useState, useEffect } from 'react';
import { useNuvra } from '@/contexts/NuvraContext';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { EditarPessoaModal } from '@/components/modals/EditarPessoaModal';
import { EditarMovimentacaoModal } from '@/components/modals/EditarMovimentacaoModal';
import { RegistrarEntradaModal } from '@/components/modals/RegistrarEntradaModal';
import { CadastrarPessoaModal } from '@/components/modals/CadastrarPessoaModal';
import { RegistrarSaidaPersonalizadaModal } from '@/components/modals/RegistrarSaidaPersonalizadaModal';
import { RegistrarSaidaEmLoteModal } from '@/components/modals/RegistrarSaidaEmLoteModal';
import { Pessoa } from '@/types/nuvra';
import { nuvraService } from '@/services/nuvraService';
import { UserTypeAvatar } from '@/lib/userTypeIcons';
import { 
  UserPlus, 
  LogIn, 
  LogOut, 
  Users, 
  Clock, 
  Car,
  FileText,
  Ship,
  Edit,
  RefreshCw,
  ArrowUp,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PessoaDentro } from '@/types/nuvra';
import { formatters } from '@/lib/validation';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
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

export function Dashboard() {
  const { empresaAtual, getPessoasDentro } = useNuvra();
  const [showCadastrar, setShowCadastrar] = useState(false);
  const [showEntrada, setShowEntrada] = useState(false);
  const [showSaidaLote, setShowSaidaLote] = useState(false);
  const [pessoaPreSelecionada, setPessoaPreSelecionada] = useState<string | null>(null);
  const [nomePreenchidoCadastro, setNomePreenchidoCadastro] = useState<string>('');
  const [editandoPessoa, setEditandoPessoa] = useState<Pessoa | null>(null);
  const [editandoMovimentacao, setEditandoMovimentacao] = useState<PessoaDentro | null>(null);
  const [saidaModal, setSaidaModal] = useState<{ open: boolean; pessoa: PessoaDentro | null }>({
    open: false,
    pessoa: null,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getPaginatedItems = (items: any[], currentPage: number, pageSize: number) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  };

  const getTotalPages = (totalItems: number, pageSize: number) => {
    return Math.ceil(totalItems / pageSize);
  };

  useEffect(() => {
    if (!empresaAtual) return;

    const verificarTempoPermanencia = async () => {
      try {
        const pessoasRemovidas = await nuvraService.executarSaidaAutomatica(empresaAtual.id, 8);
        if (pessoasRemovidas > 0) {
          // Optional: show notification
        }
      } catch (error) {
        console.error('Erro na verificação automática:', error);
      }
    };

    const interval = setInterval(verificarTempoPermanencia, 3600000);
    verificarTempoPermanencia();

    return () => clearInterval(interval);
  }, [empresaAtual]);

  const handleCadastrarERegistrar = (pessoaId: string) => {
    setPessoaPreSelecionada(pessoaId);
    setShowCadastrar(false);
    setShowEntrada(true);
  };

  const pessoasDentro = getPessoasDentro();

  const formatHora = (dateStr: string) => {
    return format(new Date(dateStr), "HH:mm", { locale: ptBR });
  };

  const getTempoDecorrido = (dateStr: string) => {
    const minutos = Math.round((Date.now() - new Date(dateStr).getTime()) / (1000 * 60));
    const horas = Math.floor(minutos / 60);
    if (horas > 0) return `${horas}h ${minutos % 60}min`;
    return `${minutos}min`;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      window.location.reload();
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Painel de Controle</h1>
          <p className="text-slate-500 mt-1">Gerencie o acesso ao estabelecimento</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={() => setShowEntrada(true)}
            className="h-auto py-4 gap-3 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            <LogIn className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Registrar Entrada</div>
              <div className="text-xs opacity-80">Cadastrar nova pessoa</div>
            </div>
          </Button>

          <Button
            onClick={() => setShowSaidaLote(true)}
            className="h-auto py-4 gap-3 bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            disabled={pessoasDentro.length === 0}
          >
            <LogOut className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Registrar Saída</div>
              <div className="text-xs opacity-80">Saída em lote</div>
            </div>
          </Button>

          <Button
            onClick={handleRefresh}
            variant="outline"
            className="h-auto py-4 gap-3 border-slate-200 hover:bg-slate-50"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <div className="text-left">
              <div className="font-semibold text-slate-700">{isRefreshing ? 'Atualizando...' : 'Atualizar'}</div>
              <div className="text-xs text-slate-500">Recarregar dados</div>
            </div>
          </Button>
        </div>

        {/* People Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Registro de Entrada</h2>
                <p className="text-sm text-slate-500">Pessoas atualmente no local</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
                {pessoasDentro.length} pessoa{pessoasDentro.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          {pessoasDentro.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ship className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhum acesso no momento</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Registre uma entrada para começar a controlar o acesso ao seu estabelecimento
              </p>
              <Button onClick={() => setShowEntrada(true)} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                <LogIn className="h-4 w-4" />
                Registrar Entrada
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Pessoa
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">
                        Documento
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">
                        Placa
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">
                        Tipo
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Entrada
                      </th>
                      <th className="text-right py-3 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {getPaginatedItems(pessoasDentro, currentPage, pageSize).map((item, index) => (
                      <React.Fragment key={item.movimentacaoId}>
                        <tr
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => {
                            const details = document.getElementById(`details-${item.movimentacaoId}`);
                            if (details) {
                              details.style.display = details.style.display === 'none' ? 'table-row' : 'none';
                            }
                          }}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <UserTypeAvatar pessoa={item.pessoa} />
                              <div>
                                <p className="font-medium text-slate-900">{item.pessoa.nome}</p>
                                {item.observacao && (
                                  <p className="text-xs text-slate-500 mt-0.5 max-w-[250px] truncate">{item.observacao}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 hidden sm:table-cell">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <FileText className="h-4 w-4 text-slate-400" />
                              {item.pessoa.documento}
                            </div>
                          </td>
                          <td className="py-4 px-6 hidden lg:table-cell">
                            {item.pessoa.placa ? (
                              <div className="flex items-center gap-2">
                                <Car className="h-4 w-4 text-slate-400" />
                                <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">
                                  {formatters.placa(item.pessoa.placa)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-4 px-6 hidden md:table-cell">
                            {item.pessoa.tipo ? (
                              <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                                {item.pessoa.tipo.charAt(0).toUpperCase() + item.pessoa.tipo.slice(1)}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-emerald-500" />
                              <div>
                                <p className="text-sm font-medium text-slate-900">{formatHora(item.entradaEm)}</p>
                                <p className="text-xs text-slate-500">{getTempoDecorrido(item.entradaEm)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditandoMovimentacao(item);
                                }}
                                className="gap-1.5 border-slate-200 hover:bg-slate-50"
                              >
                                <Edit className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Editar</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSaidaModal({ open: true, pessoa: item });
                                }}
                                className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                              >
                                <LogOut className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Saída</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr id={`details-${item.movimentacaoId}`} style={{ display: 'none' }}>
                          <td colSpan={6} className="p-4 bg-slate-50">
                            <div className="flex items-start gap-3">
                              <FileText className="h-5 w-5 text-slate-400 mt-0.5" />
                              <div>
                                {item.observacao ? (
                                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{item.observacao}</p>
                                ) : (
                                  <p className="text-sm text-red-500 font-medium">⚠️ Observação obrigatória</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {getTotalPages(pessoasDentro.length, pageSize) > 1 && (
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-sm text-slate-500">
                    Mostrando {Math.min((currentPage - 1) * pageSize + 1, pessoasDentro.length)} a{' '}
                    {Math.min(currentPage * pageSize, pessoasDentro.length)} de {pessoasDentro.length}
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                          className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, getTotalPages(pessoasDentro.length, pageSize)) }, (_, i) => {
                        const totalPages = getTotalPages(pessoasDentro.length, pageSize);
                        let pageNum;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => currentPage < getTotalPages(pessoasDentro.length, pageSize) && setCurrentPage(currentPage + 1)}
                          className={currentPage >= getTotalPages(pessoasDentro.length, pageSize) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      <EditarPessoaModal
        open={editandoPessoa !== null}
        onOpenChange={(open) => !open && setEditandoPessoa(null)}
        pessoa={editandoPessoa}
      />
      <RegistrarEntradaModal
        open={showEntrada}
        onOpenChange={setShowEntrada}
        pessoaPreSelecionada={pessoaPreSelecionada}
        onPessoaPreSelecionadaUsada={() => setPessoaPreSelecionada(null)}
        onAbrirCadastro={(nomePreenchido) => {
          setNomePreenchidoCadastro(nomePreenchido);
          setShowCadastrar(true);
          setShowEntrada(false);
        }}
      />
      <CadastrarPessoaModal
        open={showCadastrar}
        onOpenChange={setShowCadastrar}
        nomePreenchido={nomePreenchidoCadastro}
        onCadastrarERegistrar={handleCadastrarERegistrar}
      />
      <RegistrarSaidaPersonalizadaModal
        open={saidaModal.open}
        onOpenChange={(open) => setSaidaModal({ open, pessoa: saidaModal.pessoa })}
        pessoaDentro={saidaModal.pessoa}
      />
      <RegistrarSaidaEmLoteModal
        open={showSaidaLote}
        onOpenChange={setShowSaidaLote}
        pessoasDentro={pessoasDentro}
      />
      <EditarMovimentacaoModal
        open={editandoMovimentacao !== null}
        onOpenChange={(open) => !open && setEditandoMovimentacao(null)}
        movimentacao={editandoMovimentacao}
      />

      {/* Scroll to top button */}
      <Button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg transition-all duration-300 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        variant="default"
        size="icon"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
}
