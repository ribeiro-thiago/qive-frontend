"use client";

import * as React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import type { AprovacaoPermissaoOption } from "./aprovacao-permissoes-config";
import {
  GRUPO_MODAL_BODY_CLASS,
  GRUPO_MODAL_CANCEL_BUTTON_CLASS,
  GRUPO_MODAL_CLOSE_BUTTON_CLASS,
  GRUPO_MODAL_CONTENT_CLASS,
  GRUPO_MODAL_FOOTER_CLASS,
  GRUPO_MODAL_HEADER_CLASS,
  GRUPO_MODAL_LIST_CLASS,
  GRUPO_MODAL_OPTION_DESCRIPTION_CLASS,
  GRUPO_MODAL_OPTION_TITLE_CLASS,
  GRUPO_MODAL_SAVE_BUTTON_CLASS,
  GRUPO_MODAL_TITLE_CLASS,
} from "./grupo-modal-styles";

const EMPTY_CHECKBOX_VALUES: Record<string, boolean> = {};

function CheckboxIndicator({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border-[1.5px] border-[rgba(4,14,35,0.16)] bg-white shadow-[0_2px_0_0_rgba(4,14,35,0.04)]",
        checked && "border-[#0C3CF7] bg-[#0C3CF7]"
      )}
      aria-hidden
    >
      {checked ? (
        <span className="block h-[10px] w-[6px] rotate-45 border-b-2 border-r-2 border-white" />
      ) : null}
    </span>
  );
}

function RadioIndicator({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[rgba(4,14,35,0.16)] bg-white shadow-[0_2px_0_0_rgba(4,14,35,0.04)]",
        checked && "border-[#0C3CF7] bg-[#0C3CF7]"
      )}
      aria-hidden
    >
      {checked ? <span className="block h-1.5 w-1.5 rounded-full bg-white" /> : null}
    </span>
  );
}

function PermissionOptionRow({
  option,
  selectionMode,
  checked,
  onSelect,
}: {
  option: AprovacaoPermissaoOption;
  selectionMode: "multiple" | "single";
  checked: boolean;
  onSelect: () => void;
}) {
  const isSingle = selectionMode === "single";

  return (
    <button
      type="button"
      role={isSingle ? "radio" : "checkbox"}
      aria-checked={checked}
      onClick={onSelect}
      className="flex w-full cursor-pointer items-center gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C3CF7] focus-visible:ring-offset-2 rounded-md"
    >
      <div className="min-w-0 flex-1">
        <p className={GRUPO_MODAL_OPTION_TITLE_CLASS}>{option.title}</p>
        <p className={GRUPO_MODAL_OPTION_DESCRIPTION_CLASS}>{option.description}</p>
      </div>
      <div className="flex h-5 w-5 shrink-0 items-center justify-center">
        {isSingle ? (
          <RadioIndicator checked={checked} />
        ) : (
          <CheckboxIndicator checked={checked} />
        )}
      </div>
    </button>
  );
}

type FeatureAprovacaoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  options: AprovacaoPermissaoOption[];
  selectionMode: "multiple" | "single";
  checkboxValues?: Record<string, boolean>;
  selectedValue?: string | null;
  onSaveMultiple?: (values: Record<string, boolean>) => void;
  onSaveSingle?: (value: string) => void;
};

export function FeatureAprovacaoModal({
  open,
  onOpenChange,
  title,
  options,
  selectionMode,
  checkboxValues: checkboxValuesProp,
  selectedValue = null,
  onSaveMultiple,
  onSaveSingle,
}: FeatureAprovacaoModalProps) {
  const checkboxValues = checkboxValuesProp ?? EMPTY_CHECKBOX_VALUES;
  const [draftCheckboxes, setDraftCheckboxes] = React.useState<Record<string, boolean>>({});
  const [draftSelected, setDraftSelected] = React.useState<string | null>(null);
  const wasOpenRef = React.useRef(false);

  React.useEffect(() => {
    const justOpened = open && !wasOpenRef.current;
    wasOpenRef.current = open;

    if (!justOpened) return;

    if (selectionMode === "multiple") {
      setDraftCheckboxes(
        Object.fromEntries(
          options.map((option) => [option.id, checkboxValues[option.id] ?? false])
        )
      );
      return;
    }

    setDraftSelected(selectedValue);
  }, [open, selectionMode, options, checkboxValues, selectedValue]);

  const handleSave = () => {
    if (selectionMode === "multiple") {
      onSaveMultiple?.(draftCheckboxes);
    } else if (draftSelected) {
      onSaveSingle?.(draftSelected);
    }
    onOpenChange(false);
  };

  const canSave = selectionMode === "multiple" ? true : draftSelected !== null;

  if (!open) return null;

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className={GRUPO_MODAL_CONTENT_CLASS}>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          Configure as permissões de aprovação para este grupo.
        </DialogDescription>

        <div className={GRUPO_MODAL_HEADER_CLASS}>
          <h2 className={GRUPO_MODAL_TITLE_CLASS}>{title}</h2>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className={GRUPO_MODAL_CLOSE_BUTTON_CLASS}
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </div>

        <div
          role={selectionMode === "single" ? "radiogroup" : undefined}
          aria-label={selectionMode === "single" ? title : undefined}
          className={cn(GRUPO_MODAL_BODY_CLASS, GRUPO_MODAL_LIST_CLASS)}
        >
          {options.map((option) => (
            <PermissionOptionRow
              key={option.id}
              option={option}
              selectionMode={selectionMode}
              checked={
                selectionMode === "multiple"
                  ? Boolean(draftCheckboxes[option.id])
                  : draftSelected === option.id
              }
              onSelect={() => {
                if (selectionMode === "multiple") {
                  setDraftCheckboxes((current) => ({
                    ...current,
                    [option.id]: !current[option.id],
                  }));
                  return;
                }
                setDraftSelected(option.id);
              }}
            />
          ))}
        </div>

        <DialogFooter className={GRUPO_MODAL_FOOTER_CLASS}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={GRUPO_MODAL_CANCEL_BUTTON_CLASS}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            className={GRUPO_MODAL_SAVE_BUTTON_CLASS}
            disabled={!canSave}
            onClick={handleSave}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
