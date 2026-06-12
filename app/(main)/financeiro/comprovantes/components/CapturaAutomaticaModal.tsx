"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  X,
  ChevronLeft,
  Search,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type InstitutionOption = {
  id: string;
  name: string;
  disabled?: boolean;
  /** Cor de fundo do avatar circular */
  brandColor: string;
  initials: string;
};

const MOCK_INSTITUTIONS: InstitutionOption[] = [
  { id: "san", name: "Santander Empresas", brandColor: "#EC0000", initials: "S" },
  { id: "it", name: "Itaú Empresas", brandColor: "#1E49A0", initials: "i" },
  { id: "bb", name: "Banco do Brasil Empresas", brandColor: "#003DA5", initials: "BB" },
  { id: "brad", name: "Bradesco Empresas", brandColor: "#CC092F", initials: "B", disabled: true },
  { id: "inter", name: "Inter Empresas", brandColor: "#FF7A00", initials: "in" },
  { id: "sic", name: "Sicredi Empresas", brandColor: "#003641", initials: "Si" },
];

function QiveLogo({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-7 w-auto", className)}
      viewBox="0 0 113 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Qive"
    >
      <path d="M52.0063 39.375H44.6094V11.5517H52.0063V39.375Z" fill="#100F0D" />
      <path
        d="M76.5497 11.5517L70.412 30.2148L63.9749 11.5517H56.1797L66.9338 39.375H74.046L84.1741 11.5517H76.5497Z"
        fill="#100F0D"
      />
      <path
        d="M38.4924 12.006C37.5251 9.57916 36.1399 7.46374 34.3387 5.66196C32.5366 3.86018 30.4215 2.46635 27.9944 1.47937C25.5664 0.493492 22.9108 -5.98375e-07 20.0285 -5.98375e-07C17.1072 -5.98375e-07 14.424 0.493492 11.9773 1.47937C9.53067 2.46635 7.4156 3.86018 5.63302 5.66196C3.84963 7.46374 2.46535 9.57916 1.47938 12.006C0.492603 14.434 0 17.1076 0 20.0291C0 22.9121 0.492603 25.5759 1.47938 28.0225C2.46535 30.4691 3.84963 32.5944 5.63302 34.3951C7.4156 36.1979 9.53067 37.5819 11.9773 38.5491C14.424 39.5164 17.1072 40 20.0285 40C22.462 40 24.7332 39.6535 26.8429 38.9648L22.9494 32.4814C22.0243 32.6755 21.0509 32.7742 20.0285 32.7742C17.6388 32.7742 15.5051 32.2435 13.6274 31.1808C11.7496 30.1193 10.2703 28.63 9.18925 26.7142C8.10818 24.7995 7.56757 22.57 7.56757 20.0291C7.56757 17.4881 8.10818 15.2587 9.18925 13.3428C10.2703 11.4281 11.7496 9.92899 13.6274 8.8477C15.5051 7.76641 17.6388 7.22577 20.0285 7.22577C22.4183 7.22577 24.5423 7.76641 26.4012 8.8477C28.2592 9.92899 29.7201 11.4182 30.7825 13.3143C31.8439 15.2115 32.3757 17.4498 32.3757 20.0291C32.3757 22.5316 31.8439 24.7512 30.7825 26.6857C30.4065 27.37 29.978 27.9973 29.5023 28.573L33.467 35.2066C33.7644 34.9456 34.0567 34.678 34.3387 34.3951C36.1399 32.5944 37.5251 30.4691 38.4924 28.0225C39.4596 25.5759 39.9432 22.9121 39.9432 20.0291C39.9432 17.1076 39.4596 14.434 38.4924 12.006Z"
        fill="#100F0D"
      />
      <path d="M31.5819 39.375L20.0312 20.1432H28.9566L40.4503 39.375H31.5819Z" fill="#EF3923" />
      <path
        d="M93.2149 18.6651C94.4468 17.376 96.1073 16.7304 98.1941 16.7304C100.545 16.7304 102.28 17.48 103.4 18.9781C104.057 19.8574 104.519 20.8922 104.79 22.0783H91.5167C91.7671 20.7274 92.3319 19.5887 93.2149 18.6651ZM105.58 30.2473C104.847 31.2707 103.997 32.1325 103.03 32.8327C101.93 33.6296 100.412 34.0281 98.4778 34.0281C96.2391 34.0281 94.4952 33.3835 93.2431 32.0934C92.1553 30.9722 91.5404 29.4926 91.3989 27.6547H111.849C111.924 27.3901 111.972 27.0575 111.991 26.6591C112.01 26.2606 112.02 25.8539 112.02 25.4359C112.02 22.6291 111.451 20.1354 110.313 17.9536C109.174 15.7729 107.572 14.0555 105.505 12.8045C103.437 11.5525 101 10.9265 98.1941 10.9265C95.4247 10.9265 93.0058 11.5432 90.9394 12.7757C88.8712 14.0091 87.2592 15.7163 86.1026 17.897C84.9451 20.0788 84.3672 22.6106 84.3672 25.4925C84.3672 28.4146 84.9451 30.9547 86.1026 33.1169C87.2592 35.2791 88.8712 36.9584 90.9394 38.1527C93.0058 39.3481 95.4247 39.9453 98.1941 39.9453C101.228 39.9453 103.817 39.3286 105.96 38.0961C107.953 36.9491 109.562 35.3347 110.784 33.2517L105.58 30.2473Z"
        fill="#100F0D"
      />
    </svg>
  );
}

type CapturaAutomaticaModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CapturaAutomaticaModal({ open, onOpenChange }: CapturaAutomaticaModalProps) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [instQuery, setInstQuery] = React.useState("");
  const [selectedInstitution, setSelectedInstitution] = React.useState<InstitutionOption | null>(
    null
  );
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setStep(1);
      setInstQuery("");
      setSelectedInstitution(null);
      setShowPassword(false);
    }
  }, [open]);

  const filteredInstitutions = React.useMemo(() => {
    const q = instQuery.trim().toLowerCase();
    if (!q) return MOCK_INSTITUTIONS;
    return MOCK_INSTITUTIONS.filter((i) => i.name.toLowerCase().includes(q));
  }, [instQuery]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleConnect = () => {
    toast.success("Conexão simulada com sucesso.");
    handleClose();
  };

  const headerBarClass =
    "relative flex min-h-16 shrink-0 items-center justify-center px-12 pt-8 pb-3";

  const topBar = (opts: { showBack: boolean }) => (
    <div className={headerBarClass}>
      {opts.showBack ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 h-9 w-9 -translate-y-1/2"
          aria-label="Voltar"
          onClick={() => {
            if (step === 2) setStep(1);
            else if (step === 3) setStep(2);
          }}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      ) : null}
      <QiveLogo />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2"
        aria-label="Fechar"
        onClick={handleClose}
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[min(90vh,820px)] w-[min(100vw-2rem,560px)] max-w-none flex-col gap-0 overflow-hidden p-0",
          "rounded-2xl border-0 bg-white shadow-2xl sm:w-[min(100vw-3rem,600px)]"
        )}
      >
        <DialogTitle className="sr-only">Configurar captura automática</DialogTitle>

        {step === 1 && (
          <>
            <div className={headerBarClass}>
              <QiveLogo />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2"
                aria-label="Fechar"
                onClick={handleClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-8 pt-2">
              <h2 className="text-center text-lg font-bold leading-snug text-[#0d0f1c] sm:text-xl">
                Qive usa a Pluggy para se conectar às suas contas
              </h2>
              <div className="mt-8 space-y-6 text-left">
                <div>
                  <h3 className="text-base font-bold text-[#0d0f1c]">Segurança</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5F6572]">
                    Nossa conexão é criptografada e segue os mais altos padrões do mercado.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0d0f1c]">Privacidade</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5F6572]">
                    Suas credenciais de acesso nunca serão compartilhadas com terceiros.
                  </p>
                </div>
              </div>
              <p className="mt-10 text-center text-xs leading-relaxed text-[#5F6572]">
                Ao selecionar &quot;Continuar&quot;, você concorda com os{" "}
                <button
                  type="button"
                  className="font-medium text-[#0C3CF7] underline-offset-2 hover:underline"
                >
                  Termos e condições
                </button>{" "}
                e{" "}
                <button
                  type="button"
                  className="font-medium text-[#0C3CF7] underline-offset-2 hover:underline"
                >
                  Política de privacidade
                </button>
                .
              </p>
              <Button
                type="button"
                className="mt-6 h-11 w-full font-bold"
                size="lg"
                onClick={() => setStep(2)}
              >
                Continuar
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {topBar({ showBack: true })}
            <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-6 pt-2">
              <h2 className="text-center text-lg font-bold text-[#0d0f1c] sm:text-xl">
                Selecione a instituição
              </h2>
              <div className="relative mt-6">
                <Input
                  placeholder="Encontre a sua instituição"
                  className="h-11 w-full pr-10 shadow-none"
                  value={instQuery}
                  onChange={(e) => setInstQuery(e.target.value)}
                />
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <ul
                className="mt-4 max-h-[min(45vh,360px)] divide-y divide-border overflow-y-auto rounded-lg border border-border"
                role="listbox"
              >
                {filteredInstitutions.map((inst) => {
                  const disabled = inst.disabled;
                  return (
                    <li key={inst.id}>
                      <button
                        type="button"
                        disabled={disabled}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors",
                          disabled
                            ? "cursor-not-allowed bg-muted/30 text-muted-foreground"
                            : "hover:bg-[#FAFAFF]"
                        )}
                        onClick={() => {
                          if (disabled) return;
                          setSelectedInstitution(inst);
                          setStep(3);
                        }}
                      >
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                          style={{ backgroundColor: inst.brandColor }}
                        >
                          {inst.initials}
                        </span>
                        <span className={cn("flex-1 text-sm font-semibold", disabled && "text-muted-foreground")}>
                          {inst.name}
                        </span>
                        {disabled ? (
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-muted-foreground/40 bg-background">
                            <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-6 pb-2 text-center">
                <button
                  type="button"
                  className="text-sm font-medium text-[#0C3CF7] underline-offset-2 hover:underline"
                >
                  Eu não encontrei minha instituição
                </button>
              </div>
            </div>
          </>
        )}

        {step === 3 && selectedInstitution && (
          <>
            {topBar({ showBack: true })}
            <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-8 pt-2">
              <h2 className="text-center text-lg font-bold text-[#0d0f1c] sm:text-xl">
                Conecte a sua conta
              </h2>
              <div className="mt-6 flex items-center gap-3 rounded-lg border border-border bg-[#F9FAFB] px-4 py-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: selectedInstitution.brandColor }}
                >
                  {selectedInstitution.initials}
                </span>
                <span className="text-sm font-semibold text-[#0d0f1c]">{selectedInstitution.name}</span>
              </div>
              <div className="mt-6 space-y-4">
                <div>
                  <Label className="mb-1.5 block text-sm font-semibold text-[#5F6572]">Agência</Label>
                  <Input className="h-11 shadow-none" placeholder="Agência" />
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm font-semibold text-[#5F6572]">Conta</Label>
                  <Input className="h-11 shadow-none" placeholder="Conta" />
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm font-semibold text-[#5F6572]">
                    Senha Eletrônica
                  </Label>
                  <div className="relative">
                    <Input
                      className="h-11 pr-11 shadow-none"
                      placeholder="Senha Eletrônica"
                      type={showPassword ? "text" : "password"}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm font-semibold text-[#5F6572]">
                    CPF ou Código do operador
                  </Label>
                  <Input className="h-11 shadow-none" placeholder="CPF ou Código do operador" />
                  <p className="mt-1.5 text-xs text-muted-foreground">*Este campo pode ser opcional</p>
                </div>
              </div>
              <button
                type="button"
                className="mt-4 text-sm font-medium text-[#0C3CF7] underline-offset-2 hover:underline"
              >
                Precisa de ajuda? Clique aqui.
              </button>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#5F6572]">
                <Shield className="h-4 w-4 shrink-0" aria-hidden />
                <span className="underline decoration-muted-foreground/60 underline-offset-2">
                  Esta conexão é segura
                </span>
              </div>
              <Button
                type="button"
                className="mt-6 h-12 w-full font-bold text-white shadow-none hover:opacity-95"
                style={{ backgroundColor: "#FF9800" }}
                onClick={handleConnect}
              >
                Conectar
              </Button>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  className="text-sm font-medium text-[#0C3CF7] underline-offset-2 hover:underline"
                >
                  Resetar minha senha
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
