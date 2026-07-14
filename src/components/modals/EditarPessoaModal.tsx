import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNuvra } from '@/contexts/NuvraContext';
import { Pessoa } from '@/types/nuvra';
import { FileText, Phone, Car, Users, Gift, Ship, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateCPF, validateRG, validatePlaca } from '@/lib/validation';

interface EditarPessoaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pessoa: Pessoa | null;
}

export function EditarPessoaModal({ open, onOpenChange, pessoa }: EditarPessoaModalProps) {
  const { atualizarPessoa, tiposPessoa } = useNuvra();
  const [formData, setFormData] = useState({
    nome: '',
    documento: '',
    tipo: '',
    contato: '',
    placa: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preencher formulário com dados da pessoa
  useEffect(() => {
    if (pessoa) {
      setFormData({
        nome: pessoa.nome,
        documento: pessoa.documento,
        tipo: pessoa.tipo || '',
        contato: pessoa.contato || '',
        placa: pessoa.placa || '',
      });
      setErrors({});
    }
  }, [pessoa, open]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !pessoa) return;

    atualizarPessoa(pessoa.id, {
      nome: formData.nome,
      documento: formData.documento,
      tipo: formData.tipo || undefined,
      contato: formData.contato || undefined,
      placa: formData.placa || undefined,
    });

    setFormData({ nome: '', documento: '', tipo: '', contato: '', placa: '' });
    setErrors({});
    onOpenChange(false);
  };

  const handleClose = () => {
    setFormData({ nome: '', documento: '', tipo: '', contato: '', placa: '' });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-6" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Editar Pessoa
          </DialogTitle>
          <DialogDescription>
            Atualize as informações da pessoa
          </DialogDescription>
        </DialogHeader>

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
            <Label htmlFor="tipo" className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-muted-foreground" />
              Tipo de Pessoa
            </Label>
            <select
              id="tipo"
              value={formData.tipo}
              onChange={(e) => handleChange('tipo', e.target.value)}
              className="h-11 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="">Selecione um tipo</option>
              {tiposPessoa.map((tipo) => (
                <option key={tipo.id} value={tipo.nome}>{tipo.nome}</option>
              ))}
            </select>
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
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
