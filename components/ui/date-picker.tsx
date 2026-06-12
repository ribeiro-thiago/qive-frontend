"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  showNoDateOption?: boolean
  noDateLabel?: string
  onNoDateSelect?: (newState: boolean) => void // Agora recebe o novo estado
  isNoDateSelected?: boolean
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Selecione uma data",
  disabled = false,
  className,
  showNoDateOption = false,
  noDateLabel = "Sem data de vencimento",
  onNoDateSelect,
  isNoDateSelected = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (onDateChange) {
      onDateChange(selectedDate)
    }
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal shadow-none",
            !date && !isNoDateSelected && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {isNoDateSelected ? (
            <span>{noDateLabel}</span>
          ) : date ? (
            format(date, "dd/MM/yyyy", { locale: ptBR })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
        />
        {showNoDateOption && (
          <div className="p-3 border-t">
            <div className="flex items-center justify-between space-x-2">
              <Label 
                htmlFor="no-date-switch" 
                className="text-sm font-normal cursor-pointer flex-1"
              >
                {noDateLabel}
              </Label>
              <Switch
                id="no-date-switch"
                checked={isNoDateSelected}
                onCheckedChange={(checked) => {
                  onNoDateSelect?.(checked);
                }}
              />
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

