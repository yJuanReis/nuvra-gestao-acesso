import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNuvra } from '@/contexts/NuvraContext';
import { UserPlus, Mail, Lock, Building2, Shield } from 'lucide-react';

interface AdicionarUsuarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdicionarUsuarioModal({ open, onOpenChange }: AdicionarUsuarioModalProps) {
  const { adicionarUsuario, empresas } = useNuvra();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    empresa_id: '',
    role: 'user' as 'user' | 'admin' | 'owner',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Senhas não coincidem';
    }

    if (!formData.empresa_id) {
      newErrors.empresa_id = 'Empresa é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await adicionarUsuario({
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        senha: formData.senha,
        empresa_id: formData.empresa_id,
        role: formData.role,
      });

      setFormData({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: '',
        empresa_id: '',
        role: 'user',
      });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      // O erro já é tratado dentro da função adicionarUsuario
    }
  };

  const handleClose = () => {
    setFormData({
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      empresa_id: '',
      role: 'user',
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
              <UserPlus className="h-4 w-4 text-blue-600" />
            </div>
            Adicionar Usuário
          </DialogTitle>
          <DialogDescription>Preencha os dados para adicionar um novo usuário</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome" className="flex items-center gap-2">
              <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
              Nome *
            </Label>
            <Input
              id="nome"
              placeholder="Nome completo"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              className={errors.nome ? 'border-destructive' : ''}
            />
            {errors.nome && (
              <p className="text-xs text-destructive">{errors.nome}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@exemplo.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha" className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              Senha *
            </Label>
            <Input
              id="senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.senha}
              onChange={(e) => handleChange('senha', e.target.value)}
              className={errors.senha ? 'border-destructive' : ''}
            />
            {errors.senha && (
              <p className="text-xs text-destructive">{errors.senha}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmarSenha" className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              Confirmar Senha *
            </Label>
            <Input
              id="confirmarSenha"
              type="password"
              placeholder="Repita a senha"
              value={formData.confirmarSenha}
              onChange={(e) => handleChange('confirmarSenha', e.target.value)}
              className={errors.confirmarSenha ? 'border-destructive' : ''}
            />
            {errors.confirmarSenha && (
              <p className="text-xs text-destructive">{errors.confirmarSenha}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="empresa_id" className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              Empresa *
            </Label>
            <select
              id="empresa_id"
              value={formData.empresa_id}
              onChange={(e) => handleChange('empresa_id', e.target.value)}
              className={`h-10 px-3 rounded-md border border-input bg-background text-sm w-full ${
                errors.empresa_id ? 'border-destructive' : ''
              }`}
            >
              <option value="">Selecione uma empresa</option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nome}
                </option>
              ))}
            </select>
            {errors.empresa_id && (
              <p className="text-xs text-destructive">{errors.empresa_id}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-muted-foreground" />
              Função
            </Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value as 'user' | 'admin' | 'owner')}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm w-full"
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
              <option value="owner">Dono</option>
            </select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Adicionar Usuário
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}