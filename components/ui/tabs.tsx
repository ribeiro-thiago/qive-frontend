"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type Tab = {
  id: string;
  label: string;
  hasNewItems?: boolean;
  newItemsCount?: number;
  disabled?: boolean;
};

type TabsProps = {
  tabs: Tab[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  className?: string;
  variant?: "default" | "header" | "product";
};

export function Tabs({ tabs, value, defaultValue, onValueChange, className, variant = "default" }: TabsProps) {
  const [internal, setInternal] = React.useState<string>(defaultValue ?? tabs[0]?.id);
  const current = value ?? internal;
  const set = (v: string) => {
    if (onValueChange) onValueChange(v);
    if (value === undefined) setInternal(v);
  };
  
  // Refs para medir posição e largura das tabs
  const tabRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = React.useState({ left: 0, width: 0 });
  
  // Atualizar posição do indicador quando a tab ativa muda
  React.useEffect(() => {
    if (variant !== "product") return;
    
    const activeTab = tabRefs.current.get(current);
    const container = containerRef.current;
    
    if (activeTab && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      
      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    }
  }, [current, variant, tabs]);
  
  const styles = {
    default: {
      active: "text-[#0d0f1c] bg-[#e9e6e2] rounded-[56px] hover:bg-[#e9e6e2]",
      inactive: "text-[#71717c] rounded-[56px] hover:text-[#0d0f1c] hover:bg-[#f5f4f2]",
    },
    header: {
      active: "text-white font-bold bg-[#383E4C] rounded-[56px] hover:bg-[#383E4C]",
      inactive: "text-[#71717c] rounded-[56px] hover:text-[#0d0f1c] hover:bg-[#f5f4f2]",
    },
    product: {
      active: "text-[#0d0f1c] bg-transparent rounded-none font-bold",
      inactive: "text-[#71717c] bg-transparent rounded-none hover:text-[#0d0f1c]",
    },
  } as const;
  
  return (
    <div className={cn("w-full", className)}>
      <div
        ref={containerRef}
        role="tablist"
        aria-orientation="horizontal"
        className={cn("flex", variant === "product" ? "gap-6 border-b border-border relative" : "gap-2")}
      >
        {tabs.map((t) => {
          const active = current === t.id;
          const count =
            typeof t.newItemsCount === "number" && t.newItemsCount > 0
              ? t.newItemsCount
              : undefined;
          const showDot = t.hasNewItems && !active && !count;
          const showCount = !!count && !active;
          return (
            <button
              key={t.id}
              ref={(el) => {
                if (el) {
                  tabRefs.current.set(t.id, el);
                } else {
                  tabRefs.current.delete(t.id);
                }
              }}
              role="tab"
              aria-selected={active}
              onClick={() => !t.disabled && set(t.id)}
              className={cn(
                "inline-flex items-center text-sm font-medium transition-colors focus-visible:outline-none relative",
                t.disabled ? "cursor-default" : "cursor-pointer",
                variant === "product"
                  ? "px-4 h-[52px]"
                  : variant === "header"
                  ? "px-3 h-8"
                  : "px-4 py-2.5",
                active ? styles[variant].active : styles[variant].inactive
              )}
            >
              <span className="relative inline-flex items-center gap-2">
                <span className="relative inline-grid place-items-center">
                  <span
                    className="invisible font-bold"
                    aria-hidden="true"
                  >
                    {t.label}
                  </span>
                  <span
                    className={cn("absolute", active && "font-bold")}
                  >
                    {t.label}
                  </span>
                  {showDot && (
                    <span
                      className="absolute -top-1 -right-3 h-2 w-2 rounded-full bg-[#0C3CF7] animate-pulse"
                      aria-label="Novos itens"
                    />
                  )}
                </span>
                {showCount && (
                  <span
                    className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#E4E5EB] px-1 text-[11px] font-medium text-[#111827]"
                    aria-label={`${count} novos itens`}
                  >
                    {count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
        
        {/* Indicador deslizante para variant product */}
        {variant === "product" && (
          <div
            className="absolute bottom-0 h-[2px] bg-[#0C3CF7] transition-all duration-300 ease-out"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
            }}
          />
        )}
      </div>
      {/* Consumers render panels below; simple component handles header only */}
    </div>
  );
}
