import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNuvra } from '@/contexts/NuvraContext';
import { ICON_DATABASE, ICON_COLORS, getIconByName } from '@/lib/iconDatabase';
import { Plus, Trash2, Edit3, X, Check, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GerenciarTiposPessoaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GerenciarTiposPessoaPanel() {
  const { tiposPessoa, adicionarTipoPessoa, removerTipoPessoa, atualizarTipoPessoa } = useNuvra();
  const [showForm, setShowForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    icone: 'User',
    cor_texto: 'text-blue-600',
    cor_fundo: 'bg-blue-100',
  });
  const [searchIcon, setSearchIcon] = useState('');

  const filteredIcons = ICON_DATABASE.filter(i =>
    i.name.toLowerCase().includes(searchIcon.toLowerCase()) ||
    i.keywords.some(k => k.includes(searchIcon.toLowerCase()))
  );

  const resetForm = () => {
    setFormData({ nome: '', icone: 'User', cor_texto: 'text-blue-600', cor_fundo: 'bg-blue-100' });
    setShowForm(false);
    setEditandoId(null);
  };

  const handleEdit = (tipo: typeof tiposPessoa[0]) => {
    setFormData({
      nome: tipo.nome,
      icone: tipo.icone,
      cor_texto: tipo.cor_texto,
      cor_fundo: tipo.cor_fundo,
    });
    setEditandoId(tipo.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) return;

    try {
      if (editandoId) {
        await atualizarTipoPessoa(editandoId, formData);
      } else {
        await adicionarTipoPessoa(formData);
      }
      resetForm();
    } catch (err) {
      // Erro já tratado pelo contexto
    }
  };

  const handleDelete = async (tipoId: string) => {
    if (confirm('Tem certeza que deseja remover este tipo?')) {
      try {
        await removerTipoPessoa(tipoId);
      } catch (err) {
        // Erro já tratado pelo contexto
      }
    }
  };

  return (
        <div className="space-y-6">
          {/* Lista de tipos existentes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-700">
                {tiposPessoa.length} tipo{tiposPessoa.length !== 1 ? 's' : ''} cadastrado{tiposPessoa.length !== 1 ? 's' : ''}
              </h3>
              <Button
                size="sm"
                onClick={() => { resetForm(); setShowForm(true); }}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Novo Tipo
              </Button>
            </div>

            {tiposPessoa.length === 0 && !showForm && (
              <div className="text-center py-8 text-slate-500">
                <p>Nenhum tipo cadastrado ainda.</p>
                <p className="text-sm mt-1">Clique em "Novo Tipo" para começar.</p>
              </div>
            )}

            <div className="grid gap-2">
              {tiposPessoa.map((tipo) => {
                const Icon = getIconByName(tipo.icone);
                return (
                  <div
                    key={tipo.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tipo.cor_fundo}`}>
                        <Icon className={`h-5 w-5 ${tipo.cor_texto}`} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{tipo.nome}</p>
                        <p className="text-xs text-slate-500">Ícone: {tipo.icone}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(tipo)}
                        className="gap-1"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(tipo.id)}
                        className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Formulário de criação/edição */}
          {showForm && (
            <div className="border border-slate-200 rounded-lg p-4 space-y-4 bg-slate-50">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-900">
                  {editandoId ? 'Editar Tipo' : 'Novo Tipo'}
                </h3>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Nome */}
              <div className="space-y-1">
                <Label>Nome do Tipo</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Cliente, Visitante, Funcionário..."
                />
              </div>

              {/* Seletor de Ícone */}
              <div className="space-y-2">
                <Label>Ícone</Label>
                <Input
                  value={searchIcon}
                  onChange={(e) => setSearchIcon(e.target.value)}
                  placeholder="Buscar ícone..."
                  className="mb-2"
                />
                <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 bg-white rounded-lg border">
                  {filteredIcons.map((item) => {
                    const Icon = item.icon;
                    const isSelected = formData.icone === item.name;
                    return (
                      <button
                        key={item.name}
                        onClick={() => setFormData({ ...formData, icone: item.name })}
                        className={cn(
                          "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all",
                          isSelected
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        )}
                        title={item.name}
                      >
                        <Icon className="h-5 w-5 text-slate-700" />
                        <span className="text-[10px] text-slate-500 truncate w-full text-center">
                          {item.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seletor de Cor */}
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {ICON_COLORS.map((cor) => {
                    const isSelected = formData.cor_texto === cor.value;
                    return (
                      <button
                        key={cor.name}
                        onClick={() => setFormData({ ...formData, cor_texto: cor.value, cor_fundo: cor.bg })}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm",
                          isSelected
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                            : "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className={`w-4 h-4 rounded-full ${cor.bg}`}>
                          <div className={`w-4 h-4 rounded-full ${cor.value}`}>
                            <Check className={`h-4 w-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                          </div>
                        </div>
                        <span>{cor.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview */}
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs text-slate-500 mb-2">Preview:</p>
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${formData.cor_fundo}`}>
                    {(() => {
                      const Icon = getIconByName(formData.icone);
                      return <Icon className={`h-5 w-5 ${formData.cor_texto}`} />;
                    })()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{formData.nome || 'Nome do Tipo'}</p>
                    <p className="text-xs text-slate-500">Preview do tipo de pessoa</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                <Button onClick={handleSave} disabled={!formData.nome.trim()} className="gap-1.5">
                  <Save className="h-4 w-4" />
                  {editandoId ? 'Atualizar' : 'Criar Tipo'}
                </Button>
              </div>
            </div>
          )}
        </div>
  );
}

export function GerenciarTiposPessoaModal({ open, onOpenChange }: GerenciarTiposPessoaModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Tipos de Pessoa</DialogTitle>
          <DialogDescription>
            Crie e personalize os tipos de pessoa do seu estabelecimento
          </DialogDescription>
        </DialogHeader>
        <GerenciarTiposPessoaPanel />
      </DialogContent>
    </Dialog>
  );
}