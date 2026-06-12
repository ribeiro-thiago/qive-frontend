"use client";

import * as React from "react";
import { ScrollableModal } from "@/components/ui/scrollable-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ChevronDown, Calendar } from "lucide-react";
import { Row } from "../../types";
import { companies } from "@/components/layout/CompanySelector";

interface NovoPagamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPayment: (paymentData: Partial<Row>) => void;
  selectedCompany?: string | string[];
}

const formaPagamentoOptions = [
  { value: "Boleto", label: "Boleto" },
  { value: "TED", label: "TED" },
  { value: "PIX", label: "PIX" },
];

const bancoOptions = [
  { value: "001", label: "Banco do Brasil (001)" },
  { value: "025", label: "Banco Alfa (025)" },
  { value: "237", label: "Banco Bradesco (237)" },
];

export function NovoPagamentoModal({
  open,
  onOpenChange,
  onAddPayment,
  selectedCompany = "all",
}: NovoPagamentoModalProps) {
  const [dataVencimento, setDataVencimento] = React.useState("");
  const [valor, setValor] = React.useState("");
  const [ordemCompra, setOrdemCompra] = React.useState("");
  const [parcela, setParcela] = React.useState("");
  const [centroCusto, setCentroCusto] = React.useState("");
  const [observacoes, setObservacoes] = React.useState("");
  const [formaPagamento, setFormaPagamento] = React.useState<string>("");
  const [formaPagamentoOpen, setFormaPagamentoOpen] = React.useState(false);
  const [banco, setBanco] = React.useState<string>("");
  const [bancoOpen, setBancoOpen] = React.useState(false);
  const [cnpj, setCnpj] = React.useState("");
  const [agencia, setAgencia] = React.useState("");
  const [contaCorrente, setContaCorrente] = React.useState("");
  const [cnpjFornecedor, setCnpjFornecedor] = React.useState("");
  const [razaoSocial, setRazaoSocial] = React.useState("");
  const [tipoChavePix, setTipoChavePix] = React.useState<string>("");
  const [chavePix, setChavePix] = React.useState("");

  // Resetar campos quando o modal fechar
  React.useEffect(() => {
    if (!open) {
      setDataVencimento("");
      setValor("");
      setOrdemCompra("");
      setParcela("");
      setCentroCusto("");
      setObservacoes("");
      setFormaPagamento("");
      setBanco("");
      setCnpj("");
      setAgencia("");
      setContaCorrente("");
      setCnpjFornecedor("");
      setRazaoSocial("");
      setTipoChavePix("");
      setChavePix("");
    }
  }, [open]);

  const handleSubmit = () => {
    // Validação dos campos obrigatórios
    if (!dataVencimento || !valor || !formaPagamento || !cnpjFornecedor || !razaoSocial) {
      return;
    }

    // Converter valor para número (remove R$, espaços, pontos e substitui vírgula por ponto)
    const valorLimpo = valor.replace(/[^\d,]/g, "").replace(",", ".");
    const valorNumero = parseFloat(valorLimpo) || 0;

    // Determinar CNPJ pagador baseado na empresa selecionada
    let cnpjPagadorFinal = "";
    const selectedCompanyArray = Array.isArray(selectedCompany) ? selectedCompany : (selectedCompany ? [selectedCompany] : ["all"]);
    
    if (selectedCompanyArray.includes("all")) {
      // Se "todas as empresas", escolhe aleatoriamente entre as empresas disponíveis (exceto "all")
      const empresasComCNPJ = companies.filter(c => c.id !== "all" && c.cnpj);
      if (empresasComCNPJ.length > 0) {
        const empresaAleatoria = empresasComCNPJ[Math.floor(Math.random() * empresasComCNPJ.length)];
        cnpjPagadorFinal = empresaAleatoria.cnpj?.replace(/[^\d]/g, "") || "";
      }
    } else if (selectedCompanyArray.length > 0) {
      // Se uma ou mais empresas específicas estão selecionadas, usa a primeira
      const empresa = companies.find(c => selectedCompanyArray.includes(c.id));
      cnpjPagadorFinal = empresa?.cnpj?.replace(/[^\d]/g, "") || "";
    }

    // Criar objeto de pagamento
    const paymentData: Partial<Row> = {
      id: `manual-${Date.now()}`,
      fornecedor: razaoSocial,
      cnpjFornecedor: cnpjFornecedor.replace(/[^\d]/g, ""),
      cnpjPagador: cnpjPagadorFinal || cnpj.replace(/[^\d]/g, ""),
      valor: valorNumero,
      vencimento: dataVencimento,
      status: "Aberto",
      origem: "Manual",
      lancadoEm: "conferir",
      ordemCompra: ordemCompra || undefined,
      parcela: parcela || undefined,
      centroCusto: centroCusto || undefined,
      observacoes: observacoes || undefined,
      formaPagamento: {
        tipo: "PIX" as const,
        chavePix: formaPagamento === "PIX" ? chavePix.replace(/[^\d]/g, "") : "",
        dataGeracao: new Date().toLocaleDateString("pt-BR"),
        valor: valorNumero,
      },
      pagamentoPreferencial: {
        tipo: formaPagamento as "PIX" | "TED" | "Boleto",
        banco: banco || undefined,
        agencia: agencia || undefined,
        conta: contaCorrente || undefined,
        chavePix: formaPagamento === "PIX" ? chavePix : undefined,
      },
    };

    onAddPayment(paymentData);
    onOpenChange(false);
  };

  const formatCurrency = (value: string) => {
    // Remove tudo exceto números
    const numbers = value.replace(/[^\d]/g, "");
    if (!numbers) return "";
    
    // Converte para número e formata
    const num = parseInt(numbers, 10) / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num);
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setValor(formatted);
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/[^\d]/g, "");
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return value;
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const formatted = formatCNPJ(e.target.value);
    setter(formatted);
  };

  const formatDate = (value: string) => {
    const numbers = value.replace(/[^\d]/g, "");
    if (numbers.length <= 8) {
      return numbers
        .replace(/(\d{2})(\d)/, "$1/$2")
        .replace(/(\d{2})(\d)/, "$1/$2");
    }
    return value;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDate(e.target.value);
    setDataVencimento(formatted);
  };

  const isFormValid = dataVencimento && valor && formaPagamento && cnpjFornecedor && razaoSocial;

  return (
    <ScrollableModal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Nova conta a pagar"
      maxWidth="600px"
      showClose={true}
      actions={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid}>
            Criar conta a pagar
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Detalhes do Pagamento */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataVencimento" className="text-sm font-semibold text-[#0d0f1c]">
                Data do vencimento<span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="dataVencimento"
                  type="text"
                  placeholder="dd/mm/aaaa"
                  value={dataVencimento}
                  onChange={handleDateChange}
                  onClick={() => {
                    if (!dataVencimento) {
                      setDataVencimento("01/09/2025");
                      setValor("R$ 2.803,00");
                      setOrdemCompra("123123");
                      setParcela("1/12");
                      setCentroCusto("Compras");
                    }
                  }}
                  maxLength={10}
                  className="pr-10 shadow-none"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F6572]" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor" className="text-sm font-semibold text-[#0d0f1c]">
                Valor<span className="text-red-500">*</span>
              </Label>
              <Input
                id="valor"
                type="text"
                placeholder="R$ 0,00"
                value={valor}
                onChange={handleValorChange}
                className="shadow-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ordemCompra" className="text-sm font-semibold text-[#0d0f1c]">
                Ordem de compra
              </Label>
              <Input
                id="ordemCompra"
                type="text"
                placeholder="Código"
                value={ordemCompra}
                onChange={(e) => setOrdemCompra(e.target.value)}
                className="shadow-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parcela" className="text-sm font-semibold text-[#0d0f1c]">
                Parcela
              </Label>
              <Input
                id="parcela"
                type="text"
                placeholder="Ex. 1/2"
                value={parcela}
                onChange={(e) => setParcela(e.target.value)}
                className="shadow-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="centroCusto" className="text-sm font-semibold text-[#0d0f1c]">
              Centro de custo
            </Label>
            <Input
              id="centroCusto"
              type="text"
              placeholder="Departamento, código, ..."
              value={centroCusto}
              onChange={(e) => setCentroCusto(e.target.value)}
              className="shadow-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-sm font-semibold text-[#0d0f1c]">
              Observações
            </Label>
            <Textarea
              id="observacoes"
              placeholder="Digite aqui"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              className="shadow-none"
            />
          </div>
        </div>

        {/* Forma de pagamento */}
        <div className="py-4 px-4 bg-[#F5F5F6] rounded-lg space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#0d0f1c]">
              Forma de pagamento<span className="text-red-500">*</span>
            </Label>
            <DropdownMenu open={formaPagamentoOpen} onOpenChange={setFormaPagamentoOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-9 rounded-lg bg-white text-[#0d0f1c] shadow-none hover:bg-[#EFF1F2]"
                >
                  <span className={formaPagamento ? "text-[#0d0f1c]" : "text-[#5F6572]"}>
                    {formaPagamento || "Selecione"}
                  </span>
                  <ChevronDown className={["h-4 w-4 transition-transform", formaPagamentoOpen ? "rotate-180" : ""].join(" ")} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-full">
                {formaPagamentoOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => {
                      setFormaPagamento(option.value);
                      setFormaPagamentoOpen(false);
                      
                      // Preencher automaticamente baseado na forma de pagamento
                      if (option.value === "TED") {
                        setBanco("237");
                        setCnpj("12.345.678/0001-01");
                        setAgencia("2122-3");
                        setContaCorrente("123123-9");
                      } else if (option.value === "PIX") {
                        setTipoChavePix("CNPJ");
                        setChavePix("12.345.678/0001-01");
                      }
                    }}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Campos condicionais baseados na forma de pagamento */}
          {formaPagamento === "PIX" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#0d0f1c]">Tipo de chave</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-9 rounded-lg bg-white text-[#0d0f1c] shadow-none hover:bg-[#EFF1F2]"
                      >
                        <span className={tipoChavePix ? "text-[#0d0f1c]" : "text-[#5F6572]"}>
                          {tipoChavePix || "Selecione"}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-full">
                      <DropdownMenuItem onClick={() => setTipoChavePix("CPF")}>
                        CPF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTipoChavePix("CNPJ")}>
                        CNPJ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chavePix" className="text-sm font-semibold text-[#0d0f1c]">Chave</Label>
                  <Input
                    id="chavePix"
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={chavePix}
                    onChange={(e) => handleCNPJChange(e, setChavePix)}
                    maxLength={18}
                    className="shadow-none"
                  />
                </div>
              </div>
            </>
          )}

          {formaPagamento === "TED" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#0d0f1c]">Banco</Label>
                  <DropdownMenu open={bancoOpen} onOpenChange={setBancoOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-9 rounded-lg bg-white text-[#0d0f1c] shadow-none hover:bg-[#EFF1F2]"
                      >
                        <span className={banco ? "text-[#0d0f1c]" : "text-[#5F6572]"}>
                          {banco ? bancoOptions.find((b) => b.value === banco)?.label : "Selecione o banco"}
                        </span>
                        <ChevronDown className={["h-4 w-4 transition-transform", bancoOpen ? "rotate-180" : ""].join(" ")} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-full">
                      {bancoOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => {
                            setBanco(option.value);
                            setBancoOpen(false);
                          }}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj" className="text-sm font-semibold text-[#0d0f1c]">CNPJ</Label>
                  <Input
                    id="cnpj"
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={cnpj}
                    onChange={(e) => handleCNPJChange(e, setCnpj)}
                    maxLength={18}
                    className="shadow-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agencia" className="text-sm font-semibold text-[#0d0f1c]">Agência</Label>
                  <Input
                    id="agencia"
                    type="text"
                    placeholder="00000-0"
                    value={agencia}
                    onChange={(e) => setAgencia(e.target.value)}
                    className="shadow-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contaCorrente" className="text-sm font-semibold text-[#0d0f1c]">Conta Corrente</Label>
                  <Input
                    id="contaCorrente"
                    type="text"
                    placeholder="00000-0"
                    value={contaCorrente}
                    onChange={(e) => setContaCorrente(e.target.value)}
                    className="shadow-none"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Fornecedor */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[#0d0f1c]">Fornecedor</h3>
          
          <div className="space-y-2">
            <Label htmlFor="cnpjFornecedor" className="text-sm font-semibold text-[#0d0f1c]">
              CNPJ<span className="text-red-500">*</span>
            </Label>
            <Input
              id="cnpjFornecedor"
              type="text"
              placeholder="00.000.000/0001-00"
              value={cnpjFornecedor}
              onChange={(e) => handleCNPJChange(e, setCnpjFornecedor)}
              onClick={() => {
                if (!cnpjFornecedor) {
                  // Usa o mesmo CNPJ da chave PIX se existir, senão usa um padrão
                  const cnpjFicticio = chavePix || "12.345.678/0001-01";
                  setCnpjFornecedor(cnpjFicticio);
                  setRazaoSocial("Acme Comércio e Serviços LTDA");
                }
              }}
              maxLength={18}
              className="shadow-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="razaoSocial" className="text-sm font-semibold text-[#0d0f1c]">
              Razão Social<span className="text-red-500">*</span>
            </Label>
            <Input
              id="razaoSocial"
              type="text"
              placeholder="Razão Social do Fornecedor"
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
              className="shadow-none"
            />
          </div>
        </div>
      </div>
    </ScrollableModal>
  );
}





