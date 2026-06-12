"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  value?: string | null;
  copyValue?: string | null;
  className?: string;
  ariaLabel?: string;
};

export function CopyableNumber({ value, copyValue, className, ariaLabel }: Props) {
  const [copied, setCopied] = React.useState(false);
  const display = (value ?? "").trim();
  const toCopy = (copyValue ?? value ?? "").replace(/\D/g, "");
  if (!display) return <span className={cn("text-[#90949D]", className)}>—</span>;

  async function doCopy() {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(toCopy);
      } else {
        const ta = document.createElement("textarea");
        ta.value = toCopy;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      // Silently ignore copy errors
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      doCopy();
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span
        role="button"
        tabIndex={0}
        onClick={doCopy}
        onKeyDown={onKeyDown}
        aria-label={ariaLabel || "Copiar número"}
        className={cn(
          "font-mono text-[#0d0f1c] cursor-pointer select-text rounded px-0.5 transition-colors hover:bg-[#FAFAFF]",
          className,
        )}
      >
        {display}
      </span>
      <span
        aria-hidden
        className={cn(
          "shrink-0 whitespace-nowrap text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1 py-0.5 transition-opacity",
          copied ? "opacity-100" : "opacity-0",
        )}
      >
        Copiado!
      </span>
    </span>
  );
}

