"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type OverviewCardsSectionProps = {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

/**
 * Seção colapsável de cards de visão geral — mesmo padrão do Cockpit Financeiro
 * (gestão de pagamentos / BigNumberCard).
 */
export function OverviewCardsSection({
  title,
  expanded,
  onToggle,
  children,
  footer,
  className,
}: OverviewCardsSectionProps) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-lg border border-[rgba(4,14,35,0.08)] bg-[#F5F5F6] transition-all duration-300",
        className,
      )}
    >
      <div className="flex h-10 items-center px-4 py-1">
        <button
          type="button"
          className="flex items-center gap-2 rounded px-1.5 py-1 text-sm font-semibold transition-colors hover:bg-[#E5E7EB]"
          style={{ color: "#5F6572" }}
          onClick={onToggle}
          aria-expanded={expanded}
        >
          <span>{title}</span>
          <ChevronDown
            className={cn("h-4 w-4 shrink-0 transition-transform", expanded && "rotate-180")}
            aria-hidden
          />
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4">
          <div className="mt-4">{children}</div>
          {footer ? <div className="mt-3">{footer}</div> : null}
        </div>
      )}
    </div>
  );
}
