"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BigNumberCardProps {
  value: string | number;
  label: string;
  count?: number;
  unit?: string;
  /** Quando true, a contagem aparece abaixo do valor principal (antes do rótulo). */
  countBelowValue?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
  disabled?: boolean;
  /** Quando false, valores zero permanecem clicáveis (ex.: filtros do portal). Padrão: true. */
  disableWhenZero?: boolean;
  className?: string;
}

export function BigNumberCard({
  value,
  label,
  count,
  unit = "itens",
  countBelowValue = false,
  onClick,
  isSelected = false,
  disabled = false,
  disableWhenZero = true,
  className,
}: BigNumberCardProps) {
  const displayValue = typeof value === "string" ? value : value;
  const isZeroValue =
    (typeof value === "number" && value === 0) ||
    (typeof value === "string" && (value.includes("R$ 0") || value === "0"));
  const isInactive = disabled || (disableWhenZero && isZeroValue);
  const formattedCount =
    typeof count === "number" ? count.toLocaleString("pt-BR") : count;
  const countLabel =
    count !== undefined
      ? `${formattedCount} ${count === 1 ? unit.replace(/s$/, "") : unit}`
      : null;

  const valueClassName = "mb-1 min-w-0 truncate font-bold";
  const valueStyle: React.CSSProperties = {
    color: "rgba(4, 14, 35, 0.64)",
    fontSize: "clamp(1rem, 12cqi, 1.5rem)",
  };
  const labelClassName = "min-w-0 text-sm font-bold leading-snug";
  const labelStyle: React.CSSProperties = { color: "rgba(4, 14, 35, 0.42)" };
  const countClassName = "mt-1 text-xs font-medium";
  const countStyle: React.CSSProperties = { color: "#5F6572" };

  const cardStyle: React.CSSProperties = {
    borderRadius: "8px",
    border: `1px solid ${
      isInactive
        ? "rgba(4, 14, 35, 0.04)"
        : isSelected
          ? "#0C3CF7"
          : "rgba(4, 14, 35, 0.08)"
    }`,
    boxShadow: "0 1px 0 0 rgba(4, 14, 35, 0.04)",
    containerType: "inline-size",
  };

  const content = (
    <>
      <div className={valueClassName} style={valueStyle}>
        {displayValue}
      </div>
      {countLabel && countBelowValue && (
        <div className={countClassName} style={countStyle}>
          {countLabel}
        </div>
      )}
      <div className={labelClassName} style={labelStyle}>
        {label}
      </div>
      {countLabel && !countBelowValue && (
        <div className={countClassName} style={countStyle}>
          {countLabel}
        </div>
      )}
    </>
  );

  const sharedClassName = cn(
    "min-w-0 w-full p-3 text-left transition-all duration-200 sm:p-4",
    isInactive
      ? "cursor-not-allowed opacity-70 bg-gray-50"
      : onClick
        ? cn(
            "cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0C3CF7]",
            isSelected ? "bg-[#F3F5FF]" : "bg-white hover:bg-gray-100",
          )
        : "bg-white",
    className,
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={sharedClassName}
        style={cardStyle}
        onClick={() => {
          if (!isInactive) onClick();
        }}
        disabled={isInactive}
        aria-pressed={isSelected}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={sharedClassName} style={cardStyle}>
      {content}
    </div>
  );
}
