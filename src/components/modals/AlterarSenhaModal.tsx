import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNuvra } from '@/contexts/NuvraContext';
import { Lock, User } from 'lucide-react';

interface AlterarSenhaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuarioId: string;
  nomeUsuario: string;
}

export function AlterarSenhaModal({ open, onOpenChange, usuarioId, nomeUsuario }: AlterarSenhaModalProps) {
  const { alterarSenhaUsuario } = useNuvra();
  const [formData, setFormData] = useState({
    novaSenha: '',
    confirmarSenha: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.novaSenha) {
      newErrors.novaSenha = 'Nova senha é obrigatória';
    } else if (formData.novaSenha.length < 6) {
      newErrors.novaSenha = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.novaSenha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await alterarSenhaUsuario(usuarioId, formData.novaSenha);
      setFormData({
        novaSenha: '',
        confirmarSenha: '',
      });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      novaSenha: '',
      confirmarSenha: '',
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
              <Lock className="h-4 w-4 text-blue-600" />
            </div>
            Alterar Senha - {nomeUsuario}
          </DialogTitle>
          <DialogDescription>Digite sua nova senha para alterar</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="novaSenha" className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              Nova Senha *
            </Label>
            <Input
              id="novaSenha"
              type="password"
              placeholder="Digite a nova senha"
              value={formData.novaSenha}
              onChange={(e) => handleChange('novaSenha', e.target.value)}
              className={errors.novaSenha ? 'border-destructive' : ''}
              disabled={loading}
            />
            {errors.novaSenha && (
              <p className="text-xs text-destructive">{errors.novaSenha}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmarSenha" className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              Confirmar Nova Senha *
            </Label>
            <Input
              id="confirmarSenha"
              type="password"
              placeholder="Confirme a nova senha"
              value={formData.confirmarSenha}
              onChange={(e) => handleChange('confirmarSenha', e.target.value)}
              className={errors.confirmarSenha ? 'border-destructive' : ''}
              disabled={loading}
            />
            {errors.confirmarSenha && (
              <p className="text-xs text-destructive">{errors.confirmarSenha}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}