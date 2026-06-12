"use client"

import { Toaster as Sonner } from "sonner"
import { CheckCircle2, XCircle } from "lucide-react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-center"
      icons={{
        success: <CheckCircle2 className="h-6 w-6" />,
        error: <XCircle className="h-6 w-6" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-[#040E23] group-[.toaster]:border group-[.toaster]:border-[#E3E4E6] group-[.toaster]:rounded-lg group-[.toaster]:shadow-lg group-[.toaster]:min-w-[300px] group-[.toaster]:max-w-[500px]",
          description: "group-[.toast]:text-[#5B616F] group-[.toast]:whitespace-normal",
          actionButton:
            "group-[.toast]:bg-[#0C3CF7] group-[.toast]:text-white group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-2",
          cancelButton:
            "group-[.toast]:bg-[#F5F5F6] group-[.toast]:text-[#5B616F] group-[.toast]:rounded-lg",
          success: "group-[.toast]:bg-[#22C55E] group-[.toast]:text-white group-[.toast]:border-[#22C55E]",
          error: "group-[.toast]:bg-[#EF4444] group-[.toast]:text-white group-[.toast]:border-[#EF4444]",
          warning: "group-[.toast]:bg-[#F59E0B] group-[.toast]:text-white group-[.toast]:border-[#F59E0B]",
          info: "group-[.toast]:bg-[#0C3CF7] group-[.toast]:text-white group-[.toast]:border-[#0C3CF7]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

