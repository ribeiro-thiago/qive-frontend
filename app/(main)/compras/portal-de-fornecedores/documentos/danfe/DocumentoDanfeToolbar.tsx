"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type DocumentoDanfeToolbarProps = {
  novosImpostos: boolean;
  onNovosImpostosChange: (value: boolean) => void;
  /** `beside-title`: ao lado do título da modal; `header`: bloco isolado (legado). */
  layout?: "default" | "header" | "beside-title";
  className?: string;
};

export function DocumentoDanfeToolbar({
  novosImpostos,
  onNovosImpostosChange,
  layout = "default",
  className,
}: DocumentoDanfeToolbarProps) {
  const switchControl = (
    <div className="flex shrink-0 items-center gap-2">
      <Switch
        id="portal-danfe-novos-impostos"
        checked={novosImpostos}
        onCheckedChange={onNovosImpostosChange}
        aria-label="Exibir novos impostos da Reforma Tributária"
      />
      <Label
        htmlFor="portal-danfe-novos-impostos"
        className="cursor-pointer whitespace-nowrap text-sm font-medium text-[#5F6572]"
      >
        Novos impostos
      </Label>
    </div>
  );

  if (layout === "header") {
    return (
      <div className={cn("flex min-w-0 flex-1 items-center justify-end", className)}>
        {switchControl}
      </div>
    );
  }

  if (layout === "beside-title") {
    return <div className={cn("shrink-0", className)}>{switchControl}</div>;
  }

  return <div className={cn("bg-white", className)}>{switchControl}</div>;
}
