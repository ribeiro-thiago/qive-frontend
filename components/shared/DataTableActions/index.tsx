"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export interface ActionDropdown {
  label: string;
  icon?: React.ReactNode;
  items: ActionItem[];
  disabled?: boolean;
}

interface DataTableActionsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  allSelected: boolean;
  actions?: ActionDropdown[];
  primaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
  };
}

export function DataTableActions({
  selectedCount,
  totalCount,
  onSelectAll,
  allSelected,
  actions = [],
  primaryAction,
}: DataTableActionsProps) {
  const hasSelection = selectedCount > 0;
  const [openStates, setOpenStates] = React.useState<Record<number, boolean>>({});

  const handleOpenChange = (index: number, isOpen: boolean) => {
    setOpenStates(prev => ({ ...prev, [index]: isOpen }));
  };

  return (
    <div className="mt-4 mb-4 flex items-center gap-2 px-4">
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="default"
          className="inline-flex items-center gap-2 font-bold"
          onClick={onSelectAll}
        >
          Selecionar todos
          <span className="inline-flex items-center justify-center h-6 px-1.5 rounded-full bg-[#EAEBEC] text-sm text-current tabular-nums min-w-[56px]">
            {selectedCount}/{totalCount}
          </span>
        </Button>

        {actions.map((action, index) => {
          const isOpen = openStates[index] || false;
          
          return (
            <DropdownMenu 
              key={index} 
              modal={false} 
              open={hasSelection ? isOpen : false} 
              onOpenChange={(v) => hasSelection && handleOpenChange(index, v)}
            >
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={!hasSelection || action.disabled} 
                  className="inline-flex items-center gap-2 font-bold text-[#0d0f1c] shadow-none hover:bg-[#EFF1F2] data-[state=open]:bg-[#EFF1F2]"
                >
                  {action.icon}
                  {action.label}
                  {hasSelection && (
                    <span className="inline-flex items-center justify-center h-6 px-1.5 rounded-full bg-[#EAEBEC] text-sm text-current tabular-nums min-w-[24px]">
                      {selectedCount}
                    </span>
                  )}
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {action.items.map((item, itemIndex) => (
                  <DropdownMenuItem 
                    key={itemIndex} 
                    onClick={item.onClick}
                    disabled={item.disabled}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}
      </div>

      {primaryAction && (
        <Button
          className="ml-auto px-5 font-bold"
          variant="default"
          disabled={!hasSelection || primaryAction.disabled}
          onClick={primaryAction.onClick}
        >
          {primaryAction.icon}
          {primaryAction.label}
          {hasSelection && !primaryAction.disabled && (
            <span className="inline-flex items-center justify-center h-6 px-1.5 rounded-full bg-[#0B35D5] text-white text-sm tabular-nums min-w-[24px] ml-2">
              {selectedCount}
            </span>
          )}
        </Button>
      )}
    </div>
  );
}

