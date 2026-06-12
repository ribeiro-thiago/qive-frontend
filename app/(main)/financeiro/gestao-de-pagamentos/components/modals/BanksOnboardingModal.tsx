import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Combobox,
  ComboboxAnchor,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox";
import { Tag } from "@/components/ui/tag";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, CircleDollarSign, X } from "lucide-react";
import { BankAccount } from "../../types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BanksOnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBank: (bank: BankAccount) => void;
  onStartConfiguration?: (bankId: Exclude<MainBankId, "request">) => void;
}

type MainBankId = "bb" | "inter" | "btg" | "santander" | "sicredi" | "request";

const MAIN_BANK_OPTIONS: Array<{
  id: MainBankId;
  displayLabel: string;
}> = [
  { id: "bb", displayLabel: "Banco do Brasil - 001" },
  { id: "inter", displayLabel: "Banco Inter - 077" },
  { id: "btg", displayLabel: "BTG Pactual - 208" },
  { id: "santander", displayLabel: "Santander - 033" },
  { id: "sicredi", displayLabel: "Sicredi - 748" },
  { id: "request", displayLabel: "Solicitar integração com outros bancos" },
];

const MODAL_TEXT_ON_WHITE = "#5E6572";

const INTEGRATED_BANK_CODES = new Set(["001", "077", "033", "208", "748"]);

type RequestableBankOption = {
  id: string;
  name: string;
  code: string;
  label: string;
};

const ALL_REQUESTABLE_BANK_OPTIONS: RequestableBankOption[] = [
  { name: "Banco da Amazônia", code: "003" },
  { name: "Banco do Nordeste", code: "004" },
  { name: "BNDES", code: "007" },
  { name: "Banestes", code: "021" },
  { name: "Banpará", code: "037" },
  { name: "Banrisul", code: "041" },
  { name: "BRB", code: "070" },
  { name: "Caixa Econômica Federal", code: "104" },
  { name: "Banco BOCOM BBM", code: "107" },
  { name: "Banco Genial", code: "125" },
  { name: "Banco Original", code: "212" },
  { name: "Banco BS2", code: "218" },
  { name: "Bradesco", code: "237" },
  { name: "Banco ABC Brasil", code: "246" },
  { name: "Itaú", code: "341" },
  { name: "Nubank", code: "260" },
  { name: "PagBank", code: "290" },
  { name: "Banco BMG", code: "318" },
  { name: "Mercado Pago", code: "323" },
  { name: "Banco Digio", code: "335" },
  { name: "C6 Bank", code: "336" },
  { name: "Banco XP", code: "348" },
  { name: "PicPay", code: "380" },
  { name: "Banco Mercantil do Brasil", code: "389" },
  { name: "Cora", code: "403" },
  { name: "Banco BV", code: "413" },
  { name: "Banco Safra", code: "422" },
  { name: "Banco PAN", code: "623" },
  { name: "Banco Pine", code: "643" },
  { name: "Banco Daycoval", code: "707" },
  { name: "Banco Neon", code: "735" },
  { name: "Banco Modal", code: "746" },
  { name: "Rabobank", code: "747" },
  { name: "Banco BNP Paribas Brasil", code: "752" },
  { name: "Banco Citibank", code: "745" },
  { name: "Sicoob", code: "756" },
]
  .filter((bank) => !INTEGRATED_BANK_CODES.has(bank.code))
  .map((bank) => ({
    ...bank,
    id: bank.code,
    label: `${bank.name} - ${bank.code}`,
  }));

export function BanksOnboardingModal({
  open,
  onOpenChange,
  onAddBank,
  onStartConfiguration,
}: BanksOnboardingModalProps) {
  const [selectedMainId, setSelectedMainId] = React.useState<MainBankId | null>(null);
  const [requestedBanks, setRequestedBanks] = React.useState<RequestableBankOption[]>([]);
  const [acceptResearch, setAcceptResearch] = React.useState(true);
  const [bankFieldError, setBankFieldError] = React.useState(false);
  const [requestedBankFieldError, setRequestedBankFieldError] =
    React.useState(false);
  const [bankMenuOpen, setBankMenuOpen] = React.useState(false);
  const dialogContentRef = React.useRef<HTMLDivElement>(null);
  const removeRequestedBank = (bankId: string) => {
    setRequestedBanks((prev) => prev.filter((bank) => bank.id !== bankId));
  };

  React.useEffect(() => {
    if (!open) {
      setSelectedMainId(null);
      setRequestedBanks([]);
      setAcceptResearch(true);
      setBankFieldError(false);
      setRequestedBankFieldError(false);
      setBankMenuOpen(false);
    }
  }, [open]);

  React.useEffect(() => {
    if (selectedMainId) {
      setBankFieldError(false);
    }
    if (selectedMainId !== "request") {
      setRequestedBanks([]);
      setAcceptResearch(true);
      setRequestedBankFieldError(false);
    }
  }, [selectedMainId]);

  const handleCreateBank = (id: Exclude<MainBankId, "request">) => {
    const now = Date.now();

    const bankTemplates: Record<Exclude<MainBankId, "request">, Omit<BankAccount, "id">> = {
      bb: {
        nomeBanco: "Banco do Brasil",
        apelido: "Conta Banco do Brasil",
        tipoConta: "corrente",
        agencia: "0001",
        conta: "123456",
        digitoConta: "0",
        titular: "Empresa Exemplo LTDA",
        documentoTitular: "00.000.000/0001-00",
        principal: true,
        ativa: true,
      },
      inter: {
        nomeBanco: "Banco Inter",
        apelido: "Conta Banco Inter",
        tipoConta: "corrente",
        agencia: "0001",
        conta: "123456",
        digitoConta: "0",
        titular: "Empresa Exemplo LTDA",
        documentoTitular: "00.000.000/0001-00",
        principal: true,
        ativa: true,
      },
      btg: {
        nomeBanco: "BTG Pactual",
        apelido: "Conta BTG Pactual",
        tipoConta: "corrente",
        agencia: "0001",
        conta: "123456",
        digitoConta: "0",
        titular: "Empresa Exemplo LTDA",
        documentoTitular: "00.000.000/0001-00",
        principal: true,
        ativa: true,
      },
      santander: {
        nomeBanco: "Santander",
        apelido: "Conta Santander",
        tipoConta: "corrente",
        agencia: "1234",
        conta: "987654",
        digitoConta: "1",
        titular: "Empresa Exemplo LTDA",
        documentoTitular: "00.000.000/0001-00",
        principal: true,
        ativa: true,
      },
      sicredi: {
        nomeBanco: "Sicredi",
        apelido: "Conta Sicredi",
        tipoConta: "corrente",
        agencia: "0001",
        conta: "123456",
        digitoConta: "0",
        titular: "Empresa Exemplo LTDA",
        documentoTitular: "00.000.000/0001-00",
        principal: true,
        ativa: true,
      },
    };

    const bank: BankAccount = {
      id: `bank-${now}-${id}`,
      ...bankTemplates[id],
    };

    onAddBank(bank);
    onOpenChange(false);
  };

  const handleSave = () => {
    if (
      selectedMainId === "bb" ||
      selectedMainId === "inter" ||
      selectedMainId === "btg" ||
      selectedMainId === "santander" ||
      selectedMainId === "sicredi"
    ) {
      if (onStartConfiguration) {
        onStartConfiguration(selectedMainId);
        return;
      }
      handleCreateBank(selectedMainId);
      return;
    }

    if (selectedMainId === "request") {
      if (requestedBanks.length === 0) {
        setRequestedBankFieldError(true);
        return;
      }

      toast.success("Solicitação feita com sucesso.", {
        duration: 5000,
      });
      onOpenChange(false);
      return;
    }

    setBankFieldError(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[488px] max-w-[488px] gap-0 rounded-[16px] p-0">
        <div ref={dialogContentRef} className="relative flex flex-col">
        <DialogTitle className="sr-only">Pagamento de contas</DialogTitle>
        <DialogDescription className="sr-only">
          Cadastro de banco para pagamento de contas
        </DialogDescription>

        <div className="flex items-start justify-between px-6 pt-6">
          <div className="flex min-w-0 flex-1 items-center gap-3 pr-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E7EEFF]">
              <CircleDollarSign className="h-5 w-5 text-[#0C3CF7]" aria-hidden />
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span
                className="text-[20px] font-bold"
                style={{ color: MODAL_TEXT_ON_WHITE }}
              >
                Pagamento de contas
              </span>
              <Tag
                bgColor="bg-[#E7EEFF]"
                textColor="text-[#0C3CF7]"
                borderColor="border-[#B8CCFF]"
                className="shrink-0"
              >
                Novidade
              </Tag>
            </div>
          </div>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Fechar"
              className="text-[#5E6572] hover:text-[#5E6572]"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </div>

        <div className="flex max-h-[calc(90vh-220px)] flex-col gap-6 overflow-y-auto px-6 pb-6 pt-4">
          <p className="text-sm leading-5" style={{ color: MODAL_TEXT_ON_WHITE }}>
            Para pagar suas contas com tranquilidade e segurança faça o cadastro do seu
            banco.
          </p>

          <div className="space-y-4">
            <div>
              <Label
                className="mb-1 block text-sm font-semibold"
                style={{ color: MODAL_TEXT_ON_WHITE }}
              >
                Banco
              </Label>
              <DropdownMenu open={bankMenuOpen} onOpenChange={setBankMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full px-3 inline-flex items-center justify-between gap-2 shadow-none font-bold text-[#5E6572] hover:bg-[#EFF1F2] hover:text-[#5E6572]",
                      bankFieldError && "border-[#F04438]",
                      bankMenuOpen &&
                        "border-[#0C3CF7] ring-1 ring-[#0C3CF7] data-[state=open]:border-[#0C3CF7] data-[state=open]:ring-1 data-[state=open]:ring-[#0C3CF7]"
                    )}
                    aria-invalid={bankFieldError}
                  >
                    <span className="t-text-sm truncate">
                      {selectedMainId
                        ? MAIN_BANK_OPTIONS.find((o) => o.id === selectedMainId)
                            ?.displayLabel
                        : "Selecione um banco"}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-[#5E6572] transition-transform",
                        bankMenuOpen && "rotate-180"
                      )}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[var(--radix-dropdown-menu-trigger-width)] text-[#5E6572]"
                >
                  {MAIN_BANK_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.id}
                      onClick={() => setSelectedMainId(option.id)}
                      className="text-[#5E6572] focus:text-[#5E6572]"
                    >
                      {option.displayLabel}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {bankFieldError ? (
                <p className="mt-1 text-sm text-[#F04438]">Selecione um banco para continuar</p>
              ) : null}
            </div>

            {selectedMainId === "request" && (
              <div className="space-y-4">
                <div>
                  <Label
                    className="mb-1 block text-sm font-semibold"
                    style={{ color: MODAL_TEXT_ON_WHITE }}
                  >
                    Banco solicitado
                  </Label>
                  <Combobox
                    multiple
                    items={ALL_REQUESTABLE_BANK_OPTIONS}
                    value={requestedBanks}
                    onValueChange={(value) => {
                      const next = Array.isArray(value) ? value : [];
                      setRequestedBanks(next);
                      if (next.length > 0) {
                        setRequestedBankFieldError(false);
                      }
                    }}
                    itemToStringValue={(bank) =>
                      `${bank.name} ${bank.code} ${bank.label}`
                    }
                  >
                    <ComboboxAnchor>
                      <ComboboxChips
                        className={cn(
                          "min-h-10 w-full gap-1 rounded-md border border-input bg-background py-2 pl-3 pr-9 shadow-none focus-within:ring-1 focus-within:ring-offset-0 focus-within:outline-none",
                          requestedBankFieldError
                            ? "border-[#F04438] focus-within:border-[#F04438] focus-within:ring-[#F04438]"
                            : "focus-within:border-[#0C3CF7] focus-within:ring-[#0C3CF7]"
                        )}
                      >
                        <ComboboxValue>
                          {requestedBanks.map((bank) => (
                            <span
                              key={bank.id}
                              className="inline-flex items-center gap-1 rounded-full bg-[#F3F5FF] px-2 py-0.5 text-xs font-medium text-[#0C3CF7]"
                            >
                              {bank.label}
                              <button
                                type="button"
                                className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[#0C3CF7] hover:bg-[#E7EEFF]"
                                aria-label={`Remover ${bank.label}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  removeRequestedBank(bank.id);
                                }}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </ComboboxValue>
                        <ComboboxChipsInput
                          placeholder={
                            requestedBanks.length === 0
                              ? "Busque por outros bancos"
                              : ""
                          }
                          className="min-w-[120px] flex-1 border-0 bg-transparent text-sm font-normal text-[#5E6572] placeholder:font-normal placeholder:text-[#5E6572] focus:outline-none focus:ring-0"
                        />
                      </ComboboxChips>
                      <ChevronDown
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5E6572]"
                        aria-hidden
                      />
                    </ComboboxAnchor>
                    <ComboboxContent
                      portal
                      portalContainerRef={dialogContentRef}
                      maxVisibleOptions={5}
                      className="text-[#5E6572]"
                    >
                      <ComboboxList>
                        {(bank: RequestableBankOption) => (
                          <ComboboxItem key={bank.id} value={bank}>
                            <span className="text-[#5E6572]">{bank.label}</span>
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                      <ComboboxEmpty className="text-[#5E6572]">
                        Nenhum banco encontrado
                      </ComboboxEmpty>
                    </ComboboxContent>
                  </Combobox>
                  {requestedBankFieldError ? (
                    <p className="mt-1 text-sm text-[#F04438]">
                      Selecione um banco solicitado para continuar
                    </p>
                  ) : null}
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="accept-research-checkbox"
                    className="mt-0.5 h-4 w-4 min-h-4 min-w-4 shrink-0 flex-none box-border cursor-pointer appearance-none relative inline-flex items-center justify-center rounded-[4px] border-[1.5px] border-[rgba(4,14,35,0.16)] bg-white shadow-[0_2px_0_0_rgba(4,14,35,0.04)] focus-visible:outline-none checked:bg-[#0C3CF7] checked:border-[#0C3CF7] after:content-[''] after:hidden checked:after:block after:h-[10px] after:w-[6px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45"
                    checked={acceptResearch}
                    onChange={(event) => setAcceptResearch(event.target.checked)}
                  />
                  <label
                    htmlFor="accept-research-checkbox"
                    className="cursor-pointer select-none text-sm leading-5"
                    style={{ color: MODAL_TEXT_ON_WHITE }}
                  >
                    Aceito participar de pesquisas rápidas feitas pela Qive sobre pagamento de
                    contas.
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 pt-3 pb-6">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="font-bold text-[#5E6572] hover:text-[#5E6572]"
          >
            Configurar mais tarde
          </Button>
          <Button onClick={handleSave} className="font-bold">
            {selectedMainId === "request"
              ? "Solicitar integração"
              : "Iniciar configuração"}
          </Button>
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
