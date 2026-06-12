"use client";

import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogFooter, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ScrollableModalProps {
  open: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
  maxWidth?: string;
  showClose?: boolean;
  actions?: React.ReactNode;
  children: React.ReactNode;
  icon?: React.ReactNode;
  preventClose?: boolean;
}

export function ScrollableModal({ 
  open,
  onClose,
  title, 
  maxWidth = "500px",
  showClose = true, 
  actions = null,
  children,
  icon = null,
  preventClose = false,
}: ScrollableModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({
    canScroll: false,
    atTop: true,
    atBottom: false
  });

  React.useEffect(() => {
    const updateScrollState = () => {
      const scroller = scrollRef.current;
      if (!scroller) return;

      const { scrollTop, scrollHeight, clientHeight } = scroller;
      const canScroll = scrollHeight > clientHeight + 5;
      const atTop = scrollTop <= 5;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 5;

      setScrollState({ canScroll, atTop, atBottom });

      // Aplicar bordas diretamente via DOM para garantir que funcionem
      const modal = scroller.closest('[role="dialog"]');
      if (modal) {
        const header = modal.querySelector('[class*="sticky"][class*="top-0"]');
        const footer = modal.querySelector('[class*="sticky"][class*="bottom-0"]');
        
        if (header) {
          if (canScroll && !atTop) {
            header.classList.add('border-b', 'border-[rgba(4,14,35,0.08)]');
          } else {
            header.classList.remove('border-b', 'border-[rgba(4,14,35,0.08)]');
          }
        }
        
        if (footer) {
          if (canScroll && !atBottom) {
            footer.classList.add('border-t', 'border-[rgba(4,14,35,0.08)]');
          } else {
            footer.classList.remove('border-t', 'border-[rgba(4,14,35,0.08)]');
          }
        }
      }
    };

    const scroller = scrollRef.current;
    if (!scroller) return;

    // Atualiza estado inicialmente com delay para garantir renderização
    const initialTimeout = setTimeout(updateScrollState, 100);

    // Event listeners
    scroller.addEventListener('scroll', updateScrollState);

    // Observadores para mudanças
    const resizeObserver = new ResizeObserver(updateScrollState);
    const mutationObserver = new MutationObserver(updateScrollState);

    resizeObserver.observe(scroller);
    mutationObserver.observe(scroller, { childList: true, subtree: true });

    return () => {
      clearTimeout(initialTimeout);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      scroller.removeEventListener('scroll', updateScrollState);
    };
  }, [open]);

  return (
    <Dialog 
      open={open} 
      onOpenChange={preventClose ? undefined : onClose}
    >
      <DialogContent 
        className="rounded-[16px] p-0 max-h-[90vh] overflow-hidden gap-0"
        style={{ maxWidth }}
        onInteractOutside={preventClose ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={preventClose ? (e) => e.preventDefault() : undefined}
      >
        {/* Acessibilidade */}
        <DialogTitle className="sr-only">
          {typeof title === 'string' ? title : 'Modal'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Janela de diálogo modal
        </DialogDescription>
        
        {/* Header Fixo */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-6 bg-white">
          <div className="flex items-center gap-3">
            {icon}
            <div className="text-[20px] font-bold">{title}</div>
          </div>
          {showClose && !preventClose && (
            <DialogClose asChild>
              <Button variant="ghost" size="icon" aria-label="Fechar">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          )}
        </div>
        
        {/* Área de Conteúdo com Scroll */}
        <div className="relative flex-1 min-h-0 overflow-hidden">
          {/* Gradientes para indicar scroll */}
          {/* Linha + gradiente no topo - apenas quando há scroll e não está no topo */}
          {scrollState.canScroll && !scrollState.atTop && (
            <>
              <div className="absolute inset-x-0 top-0 h-px bg-[rgba(4,14,35,0.08)] z-20" />
              <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-white to-transparent z-10" />
            </>
          )}
          {scrollState.canScroll && !scrollState.atBottom && (
            <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white to-transparent z-10" />
          )}
          
          <div 
            ref={scrollRef}
            onScroll={() => {
              const scroller = scrollRef.current;
              if (!scroller) return;
              const { scrollTop, scrollHeight, clientHeight } = scroller;
              const canScroll = scrollHeight > clientHeight + 5;
              const atTop = scrollTop <= 5;
              const atBottom = scrollTop + clientHeight >= scrollHeight - 5;
              setScrollState({ canScroll, atTop, atBottom });
            }}
            className="px-6 py-4 overflow-y-auto flex-1 min-h-0 max-h-[calc(90vh-240px)]"
          >
            {children}
          </div>
        </div>
        
        {/* Footer Fixo */}
        {actions && (
          <DialogFooter className={`sticky bottom-0 z-20 px-6 py-6 bg-white ${
            scrollState.canScroll && !scrollState.atBottom ? 'border-t border-[rgba(4,14,35,0.08)]' : ''
          }`}>
            {actions}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

