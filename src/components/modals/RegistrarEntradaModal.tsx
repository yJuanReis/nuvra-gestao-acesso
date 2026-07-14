import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNuvra } from '@/contexts/NuvraContext';
import { 
  LogIn, Search, FileText, Phone, Car, AlertCircle, 
  UserPlus, Edit2, X, Users, Gift, Ship, Briefcase, 
  CheckCircle, XCircle, Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserTypeAvatar } from '@/lib/userTypeIcons';
import { validateCPF, validateRG, validatePlaca } from '@/lib/validation';
import { smartSearch } from '@/lib/utils';
import { validators, formatters } from '@/lib/validation';

type TipoPessoa = 'cliente' | 'visita' | 'marinheiro' | 'proprietario' | 'colaborador' | 'prestador' | '';

const isValidTipoPessoa = (value: string): value is TipoPessoa => {
  return ['', 'cliente', 'visita', 'marinheiro', 'proprietario', 'colaborador', 'prestador'].includes(value);
};

interface RegistrarEntradaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pessoaPreSelecionada?: string | null;
  onPessoaPreSelecionadaUsada?: () => void;
  onAbrirCadastro?: (nomePreenchido: string) => void;
}

export function RegistrarEntradaModal({ 
  open, 
  onOpenChange, 
  pessoaPreSelecionada,
  onPessoaPreSelecionadaUsada,
  onAbrirCadastro
}: RegistrarEntradaModalProps) {
  const { pessoas, registrarEntrada, podeEntrar, atualizarPessoa, tiposPessoa } = useNuvra();
  
  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPessoaId, setSelectedPessoaId] = useState<string | null>(null);
  const [observacao, setObservacao] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado do formulário de edição
  const [editData, setEditData] = useState({
    nome: '',
    documento: '',
    tipo: '' as TipoPessoa,
    contato: '',
    placa: '',
  });

  // Filtragem
  const filteredPessoas = useMemo(() => {
    if (!searchTerm.trim()) return pessoas;
    return pessoas.filter(p => 
      smartSearch(p.nome, searchTerm) || 
      smartSearch(p.documento, searchTerm) ||
      smartSearch(p.placa || '', searchTerm)
    );
  }, [pessoas, searchTerm]);

  const selectedPessoa = useMemo(() => {
    return pessoas.find(p => p.id === selectedPessoaId);
  }, [pessoas, selectedPessoaId]);

  const validacao = useMemo(() => {
    if (!selectedPessoaId) return null;
    return podeEntrar(selectedPessoaId);
  }, [selectedPessoaId, podeEntrar]);

  // Handlers
  const carregarDadosEdicao = (pessoa: any) => {
    setEditData({
      nome: pessoa.nome,
      documento: pessoa.documento,
      tipo: (pessoa.tipo || '') as TipoPessoa,
      contato: pessoa.contato || '',
      placa: pessoa.placa || '',
    });
  };

  const handleSelectPessoa = (pessoaId: string) => {
    setSelectedPessoaId(pessoaId);
    const pessoa = pessoas.find(p => p.id === pessoaId);
    if (pessoa) {
      carregarDadosEdicao(pessoa);
      setIsEditing(false);
      // Focus on observação field after a small delay to ensure the form is rendered
      setTimeout(() => {
        const observacaoElement = document.getElementById('observacao-input');
        if (observacaoElement) {
          observacaoElement.focus();
        }
      }, 100);
    }
  };

  const handleEditDirectlyFromList = (e: React.MouseEvent, pessoaId: string) => {
    e.stopPropagation();
    handleSelectPessoa(pessoaId);
    setIsEditing(true);
  };

  useEffect(() => {
    if (open && pessoaPreSelecionada) {
      handleSelectPessoa(pessoaPreSelecionada);
    }
  }, [open, pessoaPreSelecionada]);

  const handleCancelEdit = () => {
    if (selectedPessoa) {
      carregarDadosEdicao(selectedPessoa);
    }
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (selectedPessoaId) {
      await atualizarPessoa(selectedPessoaId, {
        nome: editData.nome,
        documento: editData.documento,
        tipo: editData.tipo === '' ? undefined : editData.tipo,
        contato: editData.contato,
        placa: editData.placa,
      });
      setIsEditing(false);
      
      // After saving edits, automatically register the entry
      const result = await registrarEntrada(selectedPessoaId, observacao);
      if (result.success) {
        if (pessoaPreSelecionada && onPessoaPreSelecionadaUsada) {
          onPessoaPreSelecionadaUsada();
        }
        handleClose();
      }
    }
  };

  const handleSubmitEntrada = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPessoaId || !validacao?.pode) return;

    const result = await registrarEntrada(selectedPessoaId, observacao);
    if (result.success) {
      if (pessoaPreSelecionada && onPessoaPreSelecionadaUsada) {
        onPessoaPreSelecionadaUsada();
      }
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedPessoaId(null);
    setObservacao('');
    setIsEditing(false);
    setEditData({ nome: '', documento: '', tipo: '', contato: '', placa: '' });
    onOpenChange(false);
  };


  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-6xl h-[90vh] max-h-[900px] flex flex-col p-0 overflow-hidden bg-slate-50 gap-0" hideCloseButton>
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* LADO ESQUERDO: LISTA E BUSCA */}
          <div className="flex-1 flex flex-col border-r border-slate-200 bg-white min-w-0">
            {/* Search Bar */}
            <div className="p-4 border-b border-slate-100 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Buscar por nome, CPF ou placa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-11 text-base pl-10 bg-white border-slate-300 focus:bg-white transition-colors"
                />
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  if (onAbrirCadastro) {
                    onAbrirCadastro(searchTerm);
                    onOpenChange(false);
                  }
                }}
                className="h-11 gap-2 bg-orange-500 hover:bg-orange-600 text-white border-orange-600 hover:border-orange-700"
              >
                <UserPlus className="h-4 w-4" />
                Cadastrar
              </Button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredPessoas.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500">
                  <UserPlus className="h-10 w-10 mb-3 opacity-20" />
                  <p className="font-medium mb-4">Ninguém encontrado</p>
                </div>
              ) : (
                filteredPessoas.map((pessoa) => {
                  const check = podeEntrar(pessoa.id);
                  const isSelected = selectedPessoaId === pessoa.id;

                  return (
                    <div
                      key={pessoa.id}
onClick={() => handleSelectPessoa(pessoa.id)}
                      className={cn(
                        "group w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 border border-transparent",
                        isSelected
                          ? "bg-primary/5 border-primary/20 shadow-sm"
                          : "hover:bg-slate-50 hover:border-slate-200 cursor-pointer"
                      )}
                    >
                      {/* Avatar/Initials */}
                      <UserTypeAvatar pessoa={pessoa} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={cn("font-medium text-sm truncate", 
                        isSelected && !validacao?.pode ? "text-red-700" : 
                        isSelected ? "text-primary" : "text-black")}>
                        {pessoa.nome}
                      </p>
                          {/* Badges de Status */}
                          <div className="flex items-center gap-2">
                            {!check.pode && (
                              <span className="flex items-center gap-1 text-[11px] uppercase font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                                No Local
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1 text-xs text-black">
                          <span className="truncate">{pessoa.documento || 'Sem doc'}</span>
                          {pessoa.placa && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className="font-mono bg-slate-100 px-1 rounded">{formatters.placa(pessoa.placa)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Ação Rápida de Edição */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={(e) => handleEditDirectlyFromList(e, pessoa.id)}
                      >
                        <Edit2 className="h-4 w-4 text-slate-500" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* LADO DIREITO: DETALHES E AÇÃO */}
          <div className="lg:w-[500px] flex flex-col bg-slate-50/50">
            {selectedPessoa ? (
              <form onSubmit={handleSubmitEntrada} className="flex-1 flex flex-col h-full">
                
                {/* 2. Área de Conteúdo (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {/* Grid de Dados */}
                  <div className="space-y-4">
                    <div className="space-y-2">

                      <div className="grid gap-3">
                        <Label className="text-[11px] text-black">Nome</Label>
                        <Input
                          value={editData.nome}
                          disabled={!isEditing}
                          onChange={(e) => setEditData({ ...editData, nome: e.target.value })}
                          className={cn(
                            "bg-white",
                            !isEditing && "bg-slate-50 border-slate-200 text-slate-500 font-normal"
                          )}
                          placeholder="Nome Completo"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-[11px] text-black">Documento</Label>
                            <Input
                              value={editData.documento}
                              disabled={!isEditing}
                              onChange={(e) => {
                                if (isEditing) {
                                  // Permitir apenas letras, números e espaços
                                  const cleanValue = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                                  setEditData({ ...editData, documento: cleanValue });
                                }
                              }}
                              onKeyDown={(e) => {
                                if (isEditing) {
                                  // Permitir teclas de controle e caracteres alfanuméricos e espaços
                                  const controlKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', ' '];
                                  const allowedKeys = /^[a-zA-Z0-9]$/;

                                  if (!controlKeys.includes(e.key) && !allowedKeys.test(e.key)) {
                                    e.preventDefault();
                                  }
                                }
                              }}
                              className={cn(
                                "bg-white",
                                !isEditing && "bg-slate-50 border-slate-300 text-black"
                              )}
                              maxLength={20}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] text-black">Tipo</Label>
{isEditing ? (
                              <select
                                value={editData.tipo}
                                onChange={(e) => {
                                  if (isValidTipoPessoa(e.target.value)) {
                                    setEditData({ ...editData, tipo: e.target.value });
                                  }
                                }}
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <option value="">Selecione...</option>
                                {tiposPessoa.map((tipo) => (
                                  <option key={tipo.id} value={tipo.nome}>{tipo.nome}</option>
                                ))}
                              </select>
                            ) : (
                              <div className={cn(
                                "flex h-10 w-full items-center rounded-md border border-slate-300 px-3 text-sm",
                                !isEditing && "bg-slate-50 border-slate-300 text-slate-500"
                              )}>
                                {editData.tipo || '—'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Phone className="h-3 w-3 text-black" />
                              <Label className="text-xs text-black">Telefone</Label>
                            </div>
                            <Input
                              value={editData.contato}
                              disabled={!isEditing}
                              onChange={(e) => {
                                if (isEditing) {
                                  // Filtrar apenas números
                                  const numericValue = e.target.value.replace(/\D/g, '');
                                  setEditData({ ...editData, contato: numericValue });
                                }
                              }}
                              className={cn(
                                "bg-white",
                                !isEditing && "bg-slate-50 border-slate-300 text-black"
                              )}
                              placeholder="Nenhum registro"
                              maxLength={15}
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Car className="h-3 w-3 text-black" />
                              <Label className="text-xs text-black">Placa</Label>
                            </div>
                            <Input
                              value={editData.placa}
                              disabled={!isEditing}
                              onChange={(e) => {
                                if (isEditing) {
                                  let value = e.target.value.toUpperCase();
                                  
                                  // Se o valor atual tem hífen e o usuário está apagando, permitir a remoção
                                  if (value.includes('-')) {
                                    const beforeValue = editData.placa;
                                    const currentValue = value;
                                    
                                    // Verificar se o usuário está apagando (comprimento diminuiu)
                                    if (currentValue.length < beforeValue.length) {
                                      // Se está apagando o hífen, remover o hífen e continuar
                                      if (currentValue.includes('-')) {
                                        value = value.replace('-', '');
                                      } else {
                                        // Se o hífen foi removido, manter sem hífen
                                        value = value.replace(/[^a-zA-Z0-9]/g, '');
                                      }
                                    } else {
                                      // Se está digitando, remover caracteres inválidos e inserir hífen
                                      value = value.replace(/[^a-zA-Z0-9-]/g, '');
                                      if (value.length >= 4 && !value.includes('-')) {
                                        value = value.substring(0, 3) + '-' + value.substring(3);
                                      }
                                    }
                                  } else {
                                    // Sem hífen: permitir apenas letras e números
                                    value = value.replace(/[^a-zA-Z0-9]/g, '');
                                    // Inserir hífen após 3 caracteres
                                    if (value.length >= 3) {
                                      value = value.substring(0, 3) + '-' + value.substring(3);
                                    }
                                  }
                                  
                                  setEditData({ ...editData, placa: value });
                                }
                              }}
                              onKeyDown={(e) => {
                                if (isEditing) {
                                  // Permitir teclas de controle
                                  const controlKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
                                  
                                  if (!controlKeys.includes(e.key) && !/^[a-zA-Z0-9]$/.test(e.key)) {
                                    e.preventDefault();
                                  }
                                }
                              }}
                              className={cn(
                                "bg-white font-mono",
                                !isEditing && "bg-slate-50 border-slate-300 text-black"
                              )}
                              placeholder="---"
                            />
                          </div>
                        </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-slate-300">
                      <Label className="flex items-center gap-2 text-sm font-medium text-black">
                        <FileText className="h-4 w-4 text-primary" />
                        Observação de Entrada 
                      </Label>
                      <Textarea
                        id="observacao-input"
                        placeholder="Ex: Vai para o barco X, entrega de material..."
                        value={observacao}
                        onChange={(e) => setObservacao(e.target.value)}
                        className={`resize-none min-h-[100px] bg-white border-slate-300 focus:border-primary ${!validators.observacao(observacao) && observacao.trim() !== '' ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        required
                      />
                      {!validators.observacao(observacao) && observacao.trim() !== '' && (
                        <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                          <AlertCircle className="h-4 w-4" />
                          A observação deve conter pelo menos um caractere alfanumérico (letras ou números)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Alerta se não pode entrar */}
                  {validacao && !validacao.pode && (
                    <div className="rounded-lg bg-red-50 p-4 border border-red-100 flex gap-3 animate-in fade-in slide-in-from-top-2">
                      <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-900 text-sm">Entrada Bloqueada</h4>
                        <p className="text-sm text-red-700 mt-1">{validacao.motivo}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Rodapé com Ação Principal */}
                <div className="p-6 border-t border-slate-200 bg-white mt-auto">
                  <div className="flex gap-3">
                  <Button 
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={handleClose}
                    className="flex-1 h-12 text-base font-semibold border-slate-300 text-black hover:bg-slate-50"
                  >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      size="lg"
                      disabled={!selectedPessoaId || !validacao?.pode || !validators.observacao(observacao)}
                      className={cn(
                        "flex-1 h-12 text-base font-semibold shadow-md transition-all",
                        validacao?.pode && validators.observacao(observacao) ? "bg-green-600 hover:bg-green-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      )}
                      onClick={(e) => {
                        if (isEditing) {
                          e.preventDefault();
                          handleSaveEdit();
                        }
                      }}
                    >
                      {!selectedPessoaId ? (
                        "Selecione uma pessoa"
                      ) : isEditing ? (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Salvar e Registrar Entrada
                        </>
                      ) : !validacao?.pode ? (
                        "Entrada não permitida"
                      ) : (
                        <>
                          <LogIn className="h-5 w-5 mr-2" />
                          Confirmar Entrada
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              // Empty State (Lado Direito)
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-300 shadow-sm">
                    <Search className="h-8 w-8 text-black" />
                  </div>
                  <h3 className="text-lg font-semibold text-black">Selecione uma pessoa</h3>
                  <p className="text-black max-w-xs mt-2">
                    Clique em alguém na lista ao lado para ver detalhes, editar ou registrar a entrada.
                  </p>
                </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}