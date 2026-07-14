import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNuvra } from '@/contexts/NuvraContext';
import { FileText, Phone, Car, Users, Gift, Ship, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateCPF, validateRG, validatePlaca, formatName, formatPhone, formatPlaca } from '@/lib/validation';

interface CadastrarPessoaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCadastrarERegistrar?: (pessoaId: string) => void;
  nomePreenchido?: string;
}

export function CadastrarPessoaModal({ open, onOpenChange, onCadastrarERegistrar, nomePreenchido }: CadastrarPessoaModalProps) {
  const { cadastrarPessoa, pessoas, empresas, user, tiposPessoa } = useNuvra();
  const [formData, setFormData] = useState({
    nome: '',
    documento: '',
    tipo: '',
    contato: '',
    placa: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessOptions, setShowSuccessOptions] = useState(false);
  const [lastPessoaCadastrada, setLastPessoaCadastrada] = useState<{ id: string; nome: string } | null>(null);

  const handleChange = (field: string, value: string) => {
    let processedValue = value;
    
    // Processamento específico para cada campo
    if (field === 'documento') {
      // Manter o valor bruto para validação, mas permitir formatação visual
      processedValue = value;
    } else if (field === 'contato') {
      processedValue = value.replace(/\D/g, '');
    } else if (field === 'placa') {
      processedValue = value.toUpperCase();
    }
    // Removido o processamento do campo de nome para permitir digitação normal
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    if (!formData.documento.trim()) {
      newErrors.documento = 'Documento é obrigatório';
    } else {
      // Validar formato do documento (CPF ou RG)
      const documentoValue = formData.documento.trim();
      const cpfValidation = validateCPF(documentoValue);
      const rgValidation = validateRG(documentoValue);
      
      // Se não for um CPF válido e não for um RG válido, marcar como erro
      if (!cpfValidation.isValid && !rgValidation.isValid) {
        newErrors.documento = 'Documento inválido. Por favor, insira um CPF ou RG válido.';
      }
      
      // Verificar se pessoa com este documento já existe na empresa atual
      const empresaAtual = user?.empresa_id;
      const pessoaExistente = pessoas.find(
        p => p.documento === documentoValue && p.empresa_id === empresaAtual
      );
      if (pessoaExistente) {
        newErrors.documento = `Pessoa com documento ${documentoValue} já existe nesta empresa`;
      }
    }
    if (formData.placa.trim()) {
      // Validar formato da placa
      const placaValidation = validatePlaca(formData.placa.trim());
      if (!placaValidation.isValid) {
        newErrors.placa = 'Placa inválida. Por favor, insira uma placa no formato ABC-1234 ou ABC-1D23.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const novaPessoa = await cadastrarPessoa({
        nome: formData.nome,
        documento: formData.documento,
        tipo: formData.tipo ? (formData.tipo as 'cliente' | 'visita' | 'marinheiro' | 'proprietario' | 'colaborador') : undefined,
        contato: formData.contato.trim() || undefined,
        placa: formData.placa.trim() || undefined,
      });

      // Guardar informações da pessoa cadastrada para mostrar na tela de sucesso
      setLastPessoaCadastrada({ id: novaPessoa.id, nome: novaPessoa.nome });
      setShowSuccessOptions(true);
    } catch (error) {
      // Erro já tratado pelo contexto
    }
  };

  const handleCadastrarERegistrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const novaPessoa = await cadastrarPessoa({
        nome: formData.nome,
        documento: formData.documento,
        tipo: formData.tipo ? (formData.tipo as 'cliente' | 'visita' | 'marinheiro' | 'proprietario' | 'colaborador') : undefined,
        contato: formData.contato.trim() || undefined,
        placa: formData.placa.trim() || undefined,
      });

      // Guardar informações da pessoa cadastrada para mostrar na tela de sucesso
      setLastPessoaCadastrada({ id: novaPessoa.id, nome: novaPessoa.nome });
      setShowSuccessOptions(true);
      
      // Chamar callback para registrar a pessoa
      if (onCadastrarERegistrar) {
        onCadastrarERegistrar(novaPessoa.id);
      }
    } catch (error) {
      // Erro já tratado pelo contexto
    }
  };

  const handleClose = () => {
    setFormData({ nome: '', documento: '', tipo: '', contato: '', placa: '' });
    setErrors({});
    setShowSuccessOptions(false);
    setLastPessoaCadastrada(null);
    onOpenChange(false);
  };

  // Preencher nome quando modal abre com nomePreenchido
  useEffect(() => {
    if (open && nomePreenchido && nomePreenchido.trim()) {
      setFormData(prev => ({ ...prev, nome: nomePreenchido }));
      
      // Focar no campo de documento após o modal abrir
      setTimeout(() => {
        const documentoElement = document.getElementById('documento');
        if (documentoElement) {
          documentoElement.focus();
        }
      }, 100);
    }
  }, [open, nomePreenchido]);

  const handleCadastrarOutra = () => {
    setFormData({ nome: '', documento: '', tipo: '', contato: '', placa: '' });
    setErrors({});
    setShowSuccessOptions(false);
    setLastPessoaCadastrada(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-6" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Cadastrar Nova Pessoa
          </DialogTitle>
          <DialogDescription>
            Adicione uma nova pessoa ao sistema
          </DialogDescription>
        </DialogHeader>

        {showSuccessOptions ? (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-fit">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-medium text-lg">Sucesso!</h3>
              <p className="text-muted-foreground">
                <strong>{lastPessoaCadastrada?.nome}</strong> foi cadastrado(a) com sucesso.
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                O que você gostaria de fazer agora?
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={handleCadastrarOutra} className="flex-1">
                Cadastrar Outra Pessoa
              </Button>
              <Button onClick={handleClose} className="flex-1">
                Fechar
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Nome *
              </Label>
              <Input
                id="nome"
                placeholder="Nome completo"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                className={cn("h-11", errors.nome ? 'border-destructive' : '')}
              />
              {errors.nome && (
                <p className="text-xs text-destructive">{errors.nome}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="documento" className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Documento *
              </Label>
              <Input
                id="documento"
                placeholder="CPF, RG ou outro documento (apenas letras e números)"
                value={formData.documento}
                onChange={(e) => {
                  // Permitir apenas letras, números e espaços
                  const cleanValue = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                  handleChange('documento', cleanValue);
                }}
                onKeyDown={(e) => {
                  // Permitir teclas de controle e caracteres alfanuméricos e espaços
                  const controlKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', ' '];
                  const allowedKeys = /^[a-zA-Z0-9]$/;

                  if (!controlKeys.includes(e.key) && !allowedKeys.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                className={cn("h-11", errors.documento ? 'border-destructive' : '')}
                maxLength={20}
              />
              {errors.documento && (
                <p className="text-xs text-destructive">{errors.documento}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Label htmlFor="tipo" className="flex items-center gap-2 flex-shrink-0 text-sm font-medium">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Tipo de Pessoa
                </Label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => handleChange('tipo', e.target.value)}
                  className="h-11 px-3 rounded-md border border-input bg-background text-sm flex-1"
                >
                  <option value="">Selecione um tipo</option>
                  {tiposPessoa.map((tipo) => (
                    <option key={tipo.id} value={tipo.nome}>{tipo.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contato" className="flex items-center gap-2 text-sm font-medium">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Contato
              </Label>
              <Input
                id="contato"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Telefone ou celular (apenas números)"
                value={formData.contato}
                onChange={(e) => {
                  // Filtrar apenas números
                  const numericValue = e.target.value.replace(/\D/g, '');
                  handleChange('contato', numericValue);
                }}
                className="h-11"
                maxLength={15}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="placa" className="flex items-center gap-2 text-sm font-medium">
                <Car className="h-4 w-4 text-muted-foreground" />
                Placa do veículo
              </Label>
              <Input
                id="placa"
                placeholder="ABC1234 ou ABC1D23"
                value={formData.placa}
                onChange={(e) => {
                  let value = e.target.value.toUpperCase();
                  
                  // Se o valor atual tem hífen e o usuário está apagando, permitir a remoção
                  if (value.includes('-')) {
                    const beforeValue = formData.placa;
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
                  
                  handleChange('placa', value);
                }}
                onKeyDown={(e) => {
                  // Permitir teclas de controle
                  const controlKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
                  
                  if (!controlKeys.includes(e.key) && !/^[a-zA-Z0-9]$/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                className={cn("h-11 font-mono", errors.placa ? 'border-destructive' : '')}
              />
              {errors.placa && (
                <p className="text-xs text-destructive">{errors.placa}</p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              {onCadastrarERegistrar && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCadastrarERegistrar}
                  className="flex-1 bg-success hover:bg-success/90 text-white"
                >
                  Cadastrar e Registrar
                </Button>
              )}
              <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600">
                Cadastrar
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
