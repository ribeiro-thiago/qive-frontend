"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ScrollableModal } from "@/components/ui/scrollable-modal";
import { AlertCircle } from "lucide-react";

interface DismissPendencyModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pendencyTitle: string;
  count?: number;
}

export function DismissPendencyModal({
  open,
  onClose,
  onConfirm,
  pendencyTitle,
  count = 1,
}: DismissPendencyModalProps) {
  const [dontShowAgain, setDontShowAgain] = React.useState(false);
  const isMultiple = count > 1;

  const handleConfirm = () => {
    if (dontShowAgain) {
      localStorage.setItem("dismiss-pendency-confirmation", "false");
    }
    onConfirm();
  };

  return (
    <ScrollableModal
      open={open}
      onClose={onClose}
      title={isMultiple ? "Dispensar pendências" : "Dispensar pendência"}
      maxWidth="500px"
      showClose={true}
      actions={
        <>
          <Button variant="secondary" onClick={onClose} className="font-bold">
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} className="font-bold">
            Dispensar
          </Button>
        </>
      }
    >
      <div className="grid gap-4 text-sm">
        {/* Mensagem de confirmação */}
        <div className="rounded-lg border border-border bg-white p-4">
          {isMultiple ? (
            <>
              <p className="text-sm text-[#5F6572]">
                Tem certeza que deseja dispensar as pendências selecionadas?
              </p>
              <p className="text-sm font-semibold text-[#0d0f1c] mt-2">
                {count} {count === 1 ? "pendência" : "pendências"} selecionada{count === 1 ? "" : "s"}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-[#5F6572]">
                Tem certeza que deseja dispensar a seguinte pendência?
              </p>
              <p className="text-sm font-semibold text-[#0d0f1c] mt-2">
                {pendencyTitle}
              </p>
            </>
          )}
        </div>

        {/* Aviso */}
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-900">
              {isMultiple 
                ? "Ao dispensar estas pendências, elas não serão mais exibidas no dashboard no dia de hoje."
                : "Ao dispensar esta pendência, ela não será mais exibida no dashboard no dia de hoje."
              }
            </div>
          </div>
        </div>

        {/* Checkbox para não exibir novamente */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="dont-show-again"
            className="h-4 w-4 cursor-pointer appearance-none relative grid place-content-center rounded-[4px] border-[1.5px] border-[rgba(4,14,35,0.16)] bg-white shadow-[0_2px_0_0_rgba(4,14,35,0.04)] focus-visible:outline-none checked:bg-[#0C3CF7] checked:border-[#0C3CF7] after:content-[''] after:hidden checked:after:block after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45 mt-0.5"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
          />
          <label 
            htmlFor="dont-show-again" 
            className="text-sm text-[#5F6572] cursor-pointer select-none"
          >
            Não mostrar esse tipo de pendência novamente
          </label>
        </div>
      </div>
    </ScrollableModal>
  );
}

