"use client";

import * as React from "react";
import { ScrollableModal } from "@/components/ui/scrollable-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";
import { toast } from "sonner";

interface FornecedorItem {
  nome: string;
  cnpj?: string;
}

interface SelecionarFornecedoresModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (selectedFornecedores: string[]) => void;
  fornecedores: FornecedorItem[];
  selectedFornecedores: string[];
}

export function SelecionarFornecedoresModal({
  open,
  onClose,
  onSave,
  fornecedores,
  selectedFornecedores: initialSelected,
}: SelecionarFornecedoresModalProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const normalizeFornecedor = React.useCallback((nome: string) => {
    return nome.trim().toLowerCase();
  }, []);
  const [selectedFornecedores, setSelectedFornecedores] = React.useState<Set<string>>(
    new Set(initialSelected)
  );

  // Atualizar seleção quando initialSelected mudar ou quando o modal abrir
  React.useEffect(() => {
    if (open) {
      const sanitized = initialSelected
        .map((nome) => nome.trim())
        .filter(Boolean);
      setSelectedFornecedores(new Set(sanitized));
      setSearchQuery("");
    }
  }, [initialSelected, open]);

  // Função para normalizar CNPJ removendo pontuação
  const normalizeCNPJ = (cnpj: string) => {
    return cnpj.replace(/[^\d]/g, '');
  };

  // Garante que fornecedores já selecionados apareçam na lista, mesmo se não vierem no dataset atual.
  const fornecedoresComSelecionados = React.useMemo(() => {
    const merged = [...fornecedores];
    const existing = new Set(
      fornecedores.map((fornecedor) => normalizeFornecedor(fornecedor.nome))
    );

    selectedFornecedores.forEach((nome) => {
      const normalized = normalizeFornecedor(nome);
      if (!existing.has(normalized)) {
        merged.push({ nome });
      }
    });

    return merged.sort((a, b) => a.nome.localeCompare(b.nome));
  }, [fornecedores, normalizeFornecedor, selectedFornecedores]);

  // Filtrar fornecedores por busca (nome ou CNPJ)
  const filteredFornecedores = React.useMemo(() => {
    if (!searchQuery.trim()) return fornecedoresComSelecionados;
    const query = searchQuery.toLowerCase();
    const queryNormalized = normalizeCNPJ(query);
    
    return fornecedoresComSelecionados.filter((fornecedor) => {
      // Busca por nome (case-insensitive)
      const nomeMatch = fornecedor.nome.toLowerCase().includes(query);
      
      // Busca por CNPJ - funciona com ou sem pontuação
      let cnpjMatch = false;
      if (fornecedor.cnpj) {
        // Busca no CNPJ original (com pontuação)
        const cnpjLower = fornecedor.cnpj.toLowerCase();
        cnpjMatch = cnpjLower.includes(query);
        
        // Se não encontrou e a query tem números, busca no CNPJ normalizado
        if (!cnpjMatch && queryNormalized.length > 0) {
          const cnpjNormalized = normalizeCNPJ(fornecedor.cnpj);
          cnpjMatch = cnpjNormalized.includes(queryNormalized);
        }
      }
      
      return nomeMatch || cnpjMatch;
    });
  }, [fornecedoresComSelecionados, searchQuery]);

  // Fornecedores selecionados (para exibir na seção separada)
  const selectedList = React.useMemo(() => {
    return Array.from(selectedFornecedores).sort();
  }, [selectedFornecedores]);

  const MIN_SELECTION = 1;
  const MAX_SELECTION = 5;
  const canSelectMore = selectedFornecedores.size < MAX_SELECTION;

  const findSelectedMatch = React.useCallback((fornecedor: string, values: Set<string>) => {
    const normalized = normalizeFornecedor(fornecedor);
    return Array.from(values).find((nome) => normalizeFornecedor(nome) === normalized);
  }, [normalizeFornecedor]);

  const handleToggleFornecedor = (fornecedor: string) => {
    setSelectedFornecedores((prev) => {
      const next = new Set(prev);
      const existingMatch = findSelectedMatch(fornecedor, next);

      if (existingMatch) {
        // Sempre permite desmarcar
        next.delete(existingMatch);
      } else {
        // Só permite adicionar se ainda não atingiu o limite
        if (next.size < MAX_SELECTION) {
          next.add(fornecedor.trim());
        }
      }
      return next;
    });
  };

  const handleSave = () => {
    if (selectedFornecedores.size < MIN_SELECTION) {
      toast.error("Selecione pelo menos 1 fornecedor para continuar.");
      return;
    }
    onSave(Array.from(selectedFornecedores));
    onClose();
  };

  const handleCancel = () => {
    // Resetar para seleção inicial
    setSelectedFornecedores(new Set(initialSelected));
    setSearchQuery("");
    onClose();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const hasActiveSearch = searchQuery.trim().length > 0;
  const isSearchWithNoResults = hasActiveSearch && filteredFornecedores.length === 0;
  const isSearchWithSingleResult = hasActiveSearch && filteredFornecedores.length === 1;

  const clearSearchButton = (
    <Button
      type="button"
      variant="link"
      className="h-auto p-0 text-sm font-semibold text-[#0C3CF7]"
      onClick={handleClearSearch}
    >
      Limpar busca
    </Button>
  );

  return (
    <ScrollableModal
      open={open}
      onClose={handleCancel}
      title="Selecionar fornecedores"
      maxWidth="600px"
      showClose={true}
      actions={
        <>
          <Button variant="secondary" onClick={handleCancel} className="font-bold">
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            className="font-bold"
            disabled={selectedFornecedores.size < MIN_SELECTION}
          >
            Salvar
          </Button>
        </>
      }
    >
      <div className="flex flex-col space-y-6">
        {/* Barra de busca */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold" style={{ color: '#5F6572' }}>
            Busca
          </Label>
          <div className="relative">
            <Input
              placeholder="Buscar fornecedor ou CNPJ..."
              className={hasActiveSearch ? "w-full pr-16 shadow-none" : "w-full pr-9 shadow-none"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {hasActiveSearch ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-md text-[#5F6572] hover:bg-[#EFF1F2] hover:text-[#0d0f1c] transition-colors"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            )}
          </div>
        </div>

        {/* Lista de fornecedores - altura responsiva */}
        <div className="flex flex-col space-y-2 flex-1 min-h-0" style={{ maxHeight: '200px' }}>
          <div className="flex items-center justify-between flex-shrink-0">
            <Label className="text-sm font-semibold text-[#0d0f1c]">
              Fornecedores ({filteredFornecedores.length})
            </Label>
            <span className="text-xs text-[#5F6572]">
              {selectedFornecedores.size} de {MAX_SELECTION} selecionados
            </span>
          </div>
          <div className="border border-border rounded-lg overflow-y-auto flex-1 min-h-0">
            {filteredFornecedores.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
                <p className="text-sm font-normal text-[#5F6572]">
                  Nenhum fornecedor encontrado
                </p>
                {isSearchWithNoResults ? clearSearchButton : null}
              </div>
            ) : (
              <>
                <div className="divide-y divide-border">
                  {filteredFornecedores.map((fornecedor) => {
                    const isSelected = !!findSelectedMatch(fornecedor.nome, selectedFornecedores);
                    const isDisabled = !isSelected && !canSelectMore;
                    return (
                      <div
                        key={fornecedor.nome}
                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                          isDisabled
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-50 cursor-pointer"
                        }`}
                        onClick={() => !isDisabled && handleToggleFornecedor(fornecedor.nome)}
                      >
                        <input
                          type="checkbox"
                          className={`h-4 w-4 appearance-none relative grid place-content-center rounded-[4px] border-[1.5px] border-[rgba(4,14,35,0.16)] bg-white shadow-[0_2px_0_0_rgba(4,14,35,0.04)] focus-visible:outline-none checked:bg-[#0C3CF7] checked:border-[#0C3CF7] after:content-[''] after:hidden checked:after:block after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45 ${
                            isDisabled ? "cursor-not-allowed" : "cursor-pointer"
                          }`}
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={() => !isDisabled && handleToggleFornecedor(fornecedor.nome)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className={`text-sm flex-1 flex items-center gap-2 ${isDisabled ? "text-[#5F6572]" : ""}`}>
                          <span className={`font-semibold ${isDisabled ? "text-[#5F6572]" : "text-[#0d0f1c]"}`}>
                            {fornecedor.nome}
                          </span>
                          {fornecedor.cnpj && (
                            <>
                              <span className={isDisabled ? "text-[#5F6572]" : "text-[#5F6572]"}>-</span>
                              <span className={isDisabled ? "text-[#5F6572]" : "text-[#5F6572]"}>
                                {fornecedor.cnpj}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {isSearchWithSingleResult ? (
                  <div className="flex flex-col items-center justify-center gap-2 border-t border-border p-6 text-center">
                    {clearSearchButton}
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>

        {/* Fornecedores selecionados */}
        {selectedList.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#0d0f1c]">
              Fornecedores selecionados ({selectedList.length})
            </Label>
            <div className="border border-border rounded-lg bg-gray-50 p-4">
              <div className="flex flex-wrap gap-2">
                {selectedList.map((fornecedor) => (
                  <span
                    key={fornecedor}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-border rounded-md text-sm text-[#0d0f1c]"
                  >
                    {fornecedor}
                    <button
                      onClick={() => handleToggleFornecedor(fornecedor)}
                      className="text-[#5F6572] hover:text-[#0d0f1c] transition-colors"
                      aria-label={`Remover ${fornecedor}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mensagem de validação */}
        {selectedFornecedores.size < MIN_SELECTION && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm text-amber-800">
              Selecione ao menos 1 fornecedor para continuar
            </p>
          </div>
        )}
      </div>
    </ScrollableModal>
  );
}
