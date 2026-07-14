import { useState } from 'react';
import { useNuvra } from '@/contexts/NuvraContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ExcluirPessoaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pessoa: {
    id: string;
    nome: string;
    documento: string;
    tipo: string;
  } | null;
}

export function ExcluirPessoaModal({ open, onOpenChange, pessoa }: ExcluirPessoaModalProps) {
  const { excluirPessoa } = useNuvra();
  const [isLoading, setIsLoading] = useState(false);

  const handleExcluir = async () => {
    if (!pessoa) return;

    setIsLoading(true);
    try {
      await excluirPessoa(pessoa.id);
      toast.success(`Pessoa "${pessoa.nome}" excluída com sucesso`);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao excluir pessoa:', error);
      toast.error('Erro ao excluir pessoa. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Excluir Pessoa
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir esta pessoa? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        {pessoa && (
          <div className="space-y-4">
            <Alert variant="destructive" className="border-destructive/20">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> Esta ação excluirá permanentemente a pessoa do sistema.
              </AlertDescription>
            </Alert>

            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Nome:</div>
              <div className="font-medium">{pessoa.nome}</div>
              
              <div className="text-sm text-muted-foreground mb-1 mt-2">Documento:</div>
              <div className="font-medium">{pessoa.documento}</div>
              
              <div className="text-sm text-muted-foreground mb-1 mt-2">Tipo:</div>
              <div className="font-medium capitalize">{pessoa.tipo}</div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleExcluir}
                disabled={isLoading}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {isLoading ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}