import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNuvra } from '@/contexts/NuvraContext';
import { LogOut, User, Clock, Car, Phone, FileText } from 'lucide-react';
import { PessoaDentro } from '@/types/nuvra';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatters } from '@/lib/validation';

interface RegistrarSaidaPersonalizadaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pessoaDentro: PessoaDentro | null;
}

export function RegistrarSaidaPersonalizadaModal({ open, onOpenChange, pessoaDentro }: RegistrarSaidaPersonalizadaModalProps) {
  const { registrarSaida } = useNuvra();
  const [saidaEm, setSaidaEm] = useState('');
  const [observacao, setObservacao] = useState('');
  const [isLoading, setIsLoading] = useState(false);



  // Preencher horário atual quando o modal abre
  useEffect(() => {
    if (open) {
      const now = new Date();
      const formatted = format(now, "yyyy-MM-dd'T'HH:mm", { locale: ptBR });
      setSaidaEm(formatted);
      // NÃO limpar observação - o contexto vai usar a observação original da entrada
      // e adicionar a nova observação (se houver) ou "Saída finalizada"
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!pessoaDentro) return;

    setIsLoading(true);
    try {
      // Atualizar a movimentação com horário personalizado e observação
      const result = await registrarSaida(pessoaDentro.movimentacaoId, saidaEm, observacao);
      if (result.success) {
        onOpenChange(false);
        setSaidaEm('');
        setObservacao('');
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSaidaEm('');
    setObservacao('');
  };

  if (!pessoaDentro) return null;

  const { pessoa, entradaEm } = pessoaDentro;
  const entradaDate = new Date(entradaEm);
  const tempoDecorrido = Math.round((Date.now() - entradaDate.getTime()) / (1000 * 60));
  const horas = Math.floor(tempoDecorrido / 60);
  const minutos = tempoDecorrido % 60;
  const tempoFormatado = horas > 0 ? `${horas}h ${minutos}min` : `${minutos}min`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" hideCloseButton>
        <DialogHeader>
          <DialogTitle>Registrar Saída Personalizada</DialogTitle>
          <DialogDescription>
            Configure o horário e observação para a saída
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Person info */}
          <div className="rounded-lg border border-border bg-secondary/50 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-lg">{pessoa.nome}</p>
                <p className="text-sm text-muted-foreground">{pessoa.documento}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {pessoa.contato && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  {pessoa.contato}
                </div>
              )}
              {pessoa.placa && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Car className="h-3.5 w-3.5" />
                  {formatters.placa(pessoa.placa)}
                </div>
              )}
            </div>
          </div>

          {/* Time info */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Entrada:</span>
              <span className="font-medium">
                {format(entradaDate, "HH:mm", { locale: ptBR })}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Tempo na marina</p>
              <p className="font-semibold text-primary">{tempoFormatado}</p>
            </div>
          </div>

          {/* Exit time */}
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horário de saída
            </Label>
            <Input
              type="datetime-local"
              value={saidaEm}
              onChange={(e) => setSaidaEm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Observation */}
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Observação de Saída (será adicionada ao histórico)
            </Label>
            <Textarea
              placeholder="Ex: Finalização de serviço, ... (será concatenado com observação da entrada)"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} variant="destructive" className="px-6" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Registrando...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Confirmar Saída
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
