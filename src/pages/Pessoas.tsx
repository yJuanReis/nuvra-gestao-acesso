import { useState, useMemo, useEffect } from 'react';
import { useNuvra } from '@/contexts/NuvraContext';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { EditarPessoaModal } from '@/components/modals/EditarPessoaModal';
import { CadastrarPessoaModal } from '@/components/modals/CadastrarPessoaModal';
import { ExcluirPessoaModal } from '@/components/modals/ExcluirPessoaModal';
import { Pessoa } from '@/types/nuvra';
import { UserTypeAvatar } from '@/lib/userTypeIcons';
import { smartSearch } from '@/lib/utils';
import { formatters } from '@/lib/validation';
import {
  Users,
  Search,
  Edit,
  Trash2,
  Phone,
  FileText,
  Car,
  X,
  UserPlus,
  ArrowUp,
  Filter
} from 'lucide-react';

export function PessoasPage() {
  const { pessoas, tiposPessoa } = useNuvra();
  const tiposUsuario = [
    { value: 'all', label: 'Todos os tipos' },
    ...tiposPessoa.map((t) => ({ value: t.nome, label: t.nome })),
  ];
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [editandoPessoa, setEditandoPessoa] = useState<Pessoa | null>(null);
  const [excluindoPessoa, setExcluindoPessoa] = useState<Pessoa | null>(null);
  const [showCadastrar, setShowCadastrar] = useState(false);
  const [nomePreenchidoCadastro, setNomePreenchidoCadastro] = useState<string>('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const getTotalPages = (totalItems: number, size: number) => Math.ceil(totalItems / size);
  const getPaginatedItems = <T,>(items: T[], page: number, size: number): T[] => {
    const startIndex = (page - 1) * size;
    return items.slice(startIndex, startIndex + size);
  };

  const pessoasFiltradas = useMemo(() => {
    const filteredBySearch = pessoas.filter(p => 
      smartSearch(p.nome, searchTerm) ||
      smartSearch(p.documento, searchTerm) ||
      smartSearch(p.placa || '', searchTerm)
    );
    
    return filteredBySearch.filter(p => 
      tipoFiltro === 'all' || p.tipo === tipoFiltro
    );
  }, [pessoas, searchTerm, tipoFiltro]);

  const pessoasPaginadas = useMemo(() => {
    return getPaginatedItems(pessoasFiltradas, currentPage, pageSize);
  }, [pessoasFiltradas, currentPage, pageSize]);

  const totalPages = getTotalPages(pessoasFiltradas.length, pageSize);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Pessoas Cadastradas</h1>
          <p className="text-slate-500 mt-1">Gerencie o cadastro de pessoas</p>
        </div>

        {/* Search and Filters Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Filter className="h-5 w-5 text-slate-500" />
                Filtros
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {pessoasFiltradas.length} de {pessoas.length} pessoa{pessoas.length !== 1 ? 's' : ''} encontrada{pessoas.length !== 1 ? 's' : ''}
              </p>
            </div>

            <Button 
              onClick={() => setShowCadastrar(true)}
              className="gap-2 bg-slate-900 hover:bg-slate-800 text-white"
            >
              <UserPlus className="h-4 w-4" />
              Nova Pessoa
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Nome, documento ou placa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Tipo de pessoa</Label>
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  {tiposUsuario.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(searchTerm || tipoFiltro !== 'all') && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setTipoFiltro('all');
                  setCurrentPage(1);
                }}
                className="text-slate-500 gap-1.5"
              >
                <X className="h-4 w-4" />
                Limpar filtros
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        {pessoasFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhuma pessoa encontrada</h3>
            <p className="text-slate-500 mb-6">
              {searchTerm ? 'Tente ajustar os filtros de busca' : 'Cadastre uma pessoa para começar'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCadastrar(true)} className="bg-slate-900 hover:bg-slate-800 gap-2">
                <UserPlus className="h-4 w-4" />
                Cadastrar Pessoa
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {pessoasPaginadas.map((pessoa) => (
                <div 
                  key={pessoa.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <UserTypeAvatar pessoa={pessoa} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {pessoa.nome}
                      </h3>
                      {pessoa.tipo && (
                        <span className="inline-block mt-1 text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                          {pessoa.tipo.charAt(0).toUpperCase() + pessoa.tipo.slice(1)}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditandoPessoa(pessoa)}
                        className="gap-1.5 border-slate-200 hover:bg-slate-50"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExcluindoPessoa(pessoa)}
                        className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-500">Documento:</span>
                      <span className="font-mono text-slate-900">{pessoa.documento}</span>
                    </div>

                    {pessoa.contato && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-500">Contato:</span>
                        <span className="font-medium text-slate-900">{pessoa.contato}</span>
                      </div>
                    )}

                    {pessoa.placa && (
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-500">Placa:</span>
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs font-medium text-slate-900">
                          {formatters.placa(pessoa.placa)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="text-sm text-slate-500">
                  Mostrando {Math.min((currentPage - 1) * pageSize + 1, pessoasFiltradas.length)} a {Math.min(currentPage * pageSize, pessoasFiltradas.length)} de {pessoasFiltradas.length}
                </div>
                <div className="flex items-center gap-2">
                  <Select value={pageSize.toString()} onValueChange={(value) => { setPageSize(parseInt(value)); setCurrentPage(1); }}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25 por página</SelectItem>
                      <SelectItem value="50">50 por página</SelectItem>
                      <SelectItem value="75">75 por página</SelectItem>
                    </SelectContent>
                  </Select>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <CadastrarPessoaModal 
        open={showCadastrar} 
        onOpenChange={setShowCadastrar}
        nomePreenchido={nomePreenchidoCadastro}
      />
      <EditarPessoaModal 
        open={editandoPessoa !== null} 
        onOpenChange={(open) => !open && setEditandoPessoa(null)}
        pessoa={editandoPessoa}
      />
      <ExcluirPessoaModal 
        open={excluindoPessoa !== null} 
        onOpenChange={(open) => !open && setExcluindoPessoa(null)}
        pessoa={excluindoPessoa}
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
