"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { BarIndicator } from "../data/mock-data";

const CHART_HOVER_TOOLTIP_MESSAGE = "Clique no gráfico para ver a lista de fornecedores";

interface HorizontalBarIndicatorProps {
  indicator: BarIndicator;
  href?: string;
}

function BarChartHoverTooltip({ indicator }: { indicator: BarIndicator }) {
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-[240px] -translate-x-1/2 rounded-lg border border-[#EBECEE] bg-white px-4 py-3 opacity-0 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] transition-opacity group-hover/bar:opacity-100"
    >
      <p className="m-0 text-sm font-semibold text-[#0d0f1c]">{indicator.label}</p>
      <p className="m-0 mt-1 text-sm text-[#5B616F]">{indicator.amount}</p>
      <p className="m-0 mt-2 text-xs font-semibold leading-4 text-[#5B616F]">
        {CHART_HOVER_TOOLTIP_MESSAGE}
      </p>
    </div>
  );
}

export function HorizontalBarIndicator({ indicator, href }: HorizontalBarIndicatorProps) {
  const fillWidth = Math.min(Math.max(indicator.percentage, 0), 100);

  const barChart = (
    <div
      className={cn(
        "group/bar relative h-8 w-full rounded-md bg-[#E5E7EB]",
        href && "overflow-visible transition-[filter,box-shadow] hover:brightness-[0.97] hover:ring-2 hover:ring-[rgba(12,60,247,0.25)]",
        !href && "overflow-hidden",
      )}
    >
      {href && <BarChartHoverTooltip indicator={indicator} />}
      <div className="relative h-full w-full overflow-hidden rounded-md">
        <div
          className="absolute inset-y-0 left-0 flex items-center px-2 text-xs font-bold text-white"
          style={{ width: `${fillWidth}%`, backgroundColor: indicator.fillColor }}
        >
          {fillWidth >= 12 && <span>{indicator.percentageLabel}</span>}
        </div>
        {fillWidth < 12 && (
          <span
            className="absolute inset-y-0 flex items-center pl-2 text-xs font-bold text-[#3D4350]"
            style={{ left: `${fillWidth}%` }}
          >
            {indicator.percentageLabel}
          </span>
        )}
      </div>
    </div>
  );

  const content = (
    <>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-[#3D4350]">{indicator.label}</span>
        <span className="font-semibold text-[#0d0f1c]">{indicator.amount}</span>
      </div>
      {barChart}
    </>
  );

  if (!href) {
    return <article className="space-y-2">{content}</article>;
  }

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block cursor-pointer space-y-2 rounded-md text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0C3CF7]"
      aria-label={`${indicator.label}: ${CHART_HOVER_TOOLTIP_MESSAGE}`}
    >
      {content}
    </Link>
  );
}
