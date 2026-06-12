"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CompanySelector } from "@/components/layout/CompanySelector";

type ProductToolbarProps = {
  className?: string;
  children?: React.ReactNode; // right-side actions
  selectedCompany?: string | string[];
  onCompanyChange?: (value: string[]) => void;
  multiCompanySelectionEnabled?: boolean;
};

export function ProductToolbar({ className, children, selectedCompany, onCompanyChange, multiCompanySelectionEnabled = true }: ProductToolbarProps) {
  return (
    <div className={cn("mt-4 flex items-center justify-between gap-3", className)}>
      <CompanySelector 
        value={selectedCompany} 
        onValueChange={onCompanyChange}
        multiCompanySelectionEnabled={multiCompanySelectionEnabled}
      />
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
