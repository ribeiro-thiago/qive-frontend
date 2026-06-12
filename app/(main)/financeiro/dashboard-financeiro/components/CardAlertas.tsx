"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Clock, CalendarX, Trash2, Pen, ChevronLeft } from "lucide-react";
import { formatCurrency } from "../utils/formatters";
import { parseDate, getStartOfDay } from "../utils/formatters";
import { useRouter } from "next/navigation";
import { useFeatures } from "@/lib/features/useFeatures";
import { toast } from "sonner";
import { DismissPendencyModal } from "./DismissPendencyModal";
import { navigateToSemVencimento } from "../utils/navigation";
import { DIVERGENCIAS_FILTER_OPTIONS } from "../../gestao-de-pagamentos/utils/divergencias";

interface CardAlertasProps {
  contas: Array<{
    id: string;
    vencimento: string | null;
    valor: number;
    status: string;
    etapa: string;
    divergenciaTipo?: "emissor-diferente" | "forma-pagamento-divergente";
    cancelamentoOrigem?: "Manual" | "Nota" | "Boleto";
    notaAtualizadaAposCriacao?: boolean;
  }>;
  onNavigate?: (tipo: string) => void;
  onOpenFeedback?: () => void;
  selectedCompany?: string | string[];
  semVencimentoCount?: number;
}

interface Alerta {
  id: string;
  tipo: "vencidas-conferir" | "vencidas-pagar" | "pendentes-aprovacao" | "sem-vencimento" | "divergencias" | "cancelamentos-documentos" | "nota-atualizada";
  titulo: string;
  tituloMeio?: string;
  tituloResto?: string;
  descricao: string;
  count: number;
  valor: number;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  etapa?: string; // Etapa quando relevante (para vencidas-conferir, vencidas-pagar)
}

export function CardAlertas({ contas, onNavigate, onOpenFeedback, selectedCompany, semVencimentoCount }: CardAlertasProps) {
  const router = useRouter();
  const { isFeatureEnabled } = useFeatures();
  const isAprovador = isFeatureEnabled("gestao-de-pagamentos.aprovacao-tab");
  const hoje = getStartOfDay(new Date());

  const formatDateBR = React.useCallback((date: Date) => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = String(date.getFullYear());
    return `${dd}/${mm}/${yyyy}`;
  }, []);
  
  // Estados para modo de edição
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [selectedAlertas, setSelectedAlertas] = React.useState<Set<string>>(new Set());
  const [dismissedAlertas, setDismissedAlertas] = React.useState<Set<string>>(new Set());
  
  // Estados para modal de confirmação
  const [dismissModalOpen, setDismissModalOpen] = React.useState(false);
  const [pendingDismiss, setPendingDismiss] = React.useState<Alerta | null>(null);
  const [showDismissConfirmation, setShowDismissConfirmation] = React.useState(true);
  
  // Verificar preferência do usuário ao montar
  React.useEffect(() => {
    const preference = localStorage.getItem("dismiss-pendency-confirmation");
    if (preference === "false") {
      setShowDismissConfirmation(false);
    }
  }, []);

  const alertas = React.useMemo(() => {
    const lista: Alerta[] = [];

    // Contas vencidas em Conferir
    const vencidasConferir = contas.filter(
      (c) => c.etapa === "Conferir" && 
      (c.status === "Vencido" || (c.vencimento && parseDate(c.vencimento) && parseDate(c.vencimento)!.getTime() < hoje.getTime()))
    );
    if (vencidasConferir.length > 0 && !dismissedAlertas.has("vencidas-conferir")) {
      const situacao = vencidasConferir.length === 1 ? "vencida" : "vencidas";
      lista.push({
        id: "vencidas-conferir",
        tipo: "vencidas-conferir",
        titulo: `Verificar ${vencidasConferir.length}`,
        tituloMeio: ` ${vencidasConferir.length === 1 ? "conta " : "contas "}`,
        tituloResto: `vencida${vencidasConferir.length > 1 ? "s" : ""} em Conferir`,
        descricao: `${vencidasConferir.length} ${vencidasConferir.length === 1 ? "conta vencida" : "contas vencidas"} em Conferir`,
        count: vencidasConferir.length,
        valor: vencidasConferir.reduce((acc, c) => acc + c.valor, 0),
        icon: CalendarX,
        color: "#F64133",
        etapa: "conferir",
      });
    }

    // Contas vencidas em Pagar
    const vencidasPagar = contas.filter(
      (c) => c.etapa === "Pagar" && 
      (c.status === "Vencido" || (c.vencimento && parseDate(c.vencimento) && parseDate(c.vencimento)!.getTime() < hoje.getTime()))
    );
    if (vencidasPagar.length > 0 && !dismissedAlertas.has("vencidas-pagar")) {
      const situacao = vencidasPagar.length === 1 ? "vencida" : "vencidas";
      lista.push({
        id: "vencidas-pagar",
        tipo: "vencidas-pagar",
        titulo: `Verificar ${vencidasPagar.length}`,
        tituloMeio: ` ${vencidasPagar.length === 1 ? "conta " : "contas "}`,
        tituloResto: `vencida${vencidasPagar.length > 1 ? "s" : ""} em Pagar`,
        descricao: `${vencidasPagar.length} ${vencidasPagar.length === 1 ? "conta vencida" : "contas vencidas"} em Pagar`,
        count: vencidasPagar.length,
        valor: vencidasPagar.reduce((acc, c) => acc + c.valor, 0),
        icon: CalendarX,
        color: "#F64133",
        etapa: "pagar",
      });
    }

    // Contas pendentes de aprovação
    const pendentes = contas.filter((c) => c.etapa === "Aprovar" || c.etapa.toLowerCase() === "aprovacao");
    if (pendentes.length > 0 && !dismissedAlertas.has("pendentes-aprovacao")) {
      const situacao = pendentes.length === 1 ? "pendente de aprovação" : "pendentes de aprovação";
      lista.push({
        id: "pendentes-aprovacao",
        tipo: "pendentes-aprovacao",
        titulo: `Avaliar ${pendentes.length}`,
        tituloMeio: ` ${pendentes.length === 1 ? "conta " : "contas "}`,
        tituloResto: situacao,
        descricao: `${pendentes.length} ${pendentes.length === 1 ? "conta aguardando" : "contas aguardando"}`,
        count: pendentes.length,
        valor: pendentes.reduce((acc, c) => acc + c.valor, 0),
        icon: Clock,
        color: "#FF9705",
      });
    }

    // Contas sem data de vencimento
    const semVencimento = contas.filter((c) => !c.vencimento && c.status === "Aberto");
    // Usar semVencimentoCount se fornecido, senão usar o cálculo local
    const countSemVencimento = semVencimentoCount !== undefined ? semVencimentoCount : semVencimento.length;
    if (countSemVencimento > 0 && !dismissedAlertas.has("sem-vencimento")) {
      const situacao = countSemVencimento === 1 ? "vencimento faltante" : "vencimentos faltantes";
      lista.push({
        id: "sem-vencimento",
        tipo: "sem-vencimento",
        titulo: `Preencher ${countSemVencimento}`,
        tituloMeio: " data de ",
        tituloResto: situacao,
        descricao: `${countSemVencimento} ${countSemVencimento === 1 ? "conta sem vencimento" : "contas sem vencimento"}`,
        count: countSemVencimento,
        valor: semVencimento.reduce((acc, c) => acc + c.valor, 0),
        icon: CalendarX,
        color: "#0A29A3",
      });
    }

    // Contas com indicação de fraude/divergências
    const comDivergencias = contas.filter(
      (c) => Boolean(c.divergenciaTipo) && (c.status === "Aberto" || c.status === "Vencido")
    );
    if (comDivergencias.length > 0 && !dismissedAlertas.has("divergencias")) {
      const situacao = comDivergencias.length === 1 ? "com divergência" : "com divergências";
      lista.push({
        id: "divergencias",
        tipo: "divergencias",
        titulo: `Verificar ${comDivergencias.length}`,
        tituloMeio: ` ${comDivergencias.length === 1 ? "conta " : "contas "}`,
        tituloResto: situacao,
        descricao: `${comDivergencias.length} ${comDivergencias.length === 1 ? "conta com divergência" : "contas com divergências"}`,
        count: comDivergencias.length,
        valor: comDivergencias.reduce((acc, c) => acc + c.valor, 0),
        icon: AlertTriangle,
        color: "#F64133",
      });
    }

    const cancelamentosDocumento = contas.filter(
      (c) => c.etapa === "Cancelados" && (c.cancelamentoOrigem === "Nota" || c.cancelamentoOrigem === "Boleto")
    );
    if (cancelamentosDocumento.length > 0 && !dismissedAlertas.has("cancelamentos-documentos")) {
      lista.push({
        id: "cancelamentos-documentos",
        tipo: "cancelamentos-documentos",
        titulo: `Verificar ${cancelamentosDocumento.length}`,
        tituloMeio: ` ${cancelamentosDocumento.length === 1 ? "conta " : "contas "}`,
        tituloResto: "canceladas por Nota/Boleto",
        descricao: `${cancelamentosDocumento.length} ${cancelamentosDocumento.length === 1 ? "conta cancelada" : "contas canceladas"} por documento`,
        count: cancelamentosDocumento.length,
        valor: cancelamentosDocumento.reduce((acc, c) => acc + c.valor, 0),
        icon: AlertTriangle,
        color: "#F64133",
      });
    }

    const notasAtualizadas = contas.filter((c) => c.notaAtualizadaAposCriacao);
    if (notasAtualizadas.length > 0 && !dismissedAlertas.has("nota-atualizada")) {
      lista.push({
        id: "nota-atualizada",
        tipo: "nota-atualizada",
        titulo: `Revisar ${notasAtualizadas.length}`,
        tituloMeio: ` ${notasAtualizadas.length === 1 ? "conta " : "contas "}`,
        tituloResto: "com nota atualizada",
        descricao: `${notasAtualizadas.length} ${notasAtualizadas.length === 1 ? "conta com update de nota" : "contas com update de nota"}`,
        count: notasAtualizadas.length,
        valor: notasAtualizadas.reduce((acc, c) => acc + c.valor, 0),
        icon: AlertTriangle,
        color: "#FF9705",
      });
    }

    return lista;
  }, [contas, hoje, dismissedAlertas, semVencimentoCount]);

  const handleClick = (alerta: Alerta) => {
    if (isEditMode) return; // Não navega quando está em modo de edição
    
    if (onNavigate) {
      onNavigate(alerta.tipo);
    } else {
      // Navegar para gestão de pagamentos com filtros apropriados
      const params = new URLSearchParams();
      const ontem = new Date(hoje);
      ontem.setDate(ontem.getDate() - 1);
      
      switch (alerta.tipo) {
        case "vencidas-conferir":
          params.set('tab', 'conferir');
          params.set('vencimentoFim', formatDateBR(ontem));
          break;
        case "vencidas-pagar":
          params.set('tab', 'pagar');
          params.set('vencimentoFim', formatDateBR(ontem));
          break;
        case "pendentes-aprovacao":
          params.set('tab', 'aprovacao');
          break;
        case "sem-vencimento":
          navigateToSemVencimento(router, selectedCompany);
          return;
        case "divergencias":
          params.set('tab', 'todas');
          params.set('divergencias', DIVERGENCIAS_FILTER_OPTIONS[0]);
          break;
        case "cancelamentos-documentos":
          params.set('tab', 'cancelados');
          params.set('cancelamentoOrigem', 'Nota/Boleto');
          break;
        case "nota-atualizada":
          params.set('tab', 'cancelados');
          params.set('notaAtualizadaAposCriacao', 'true');
          break;
        default:
          if (selectedCompany) {
            const companyParam = Array.isArray(selectedCompany) 
              ? selectedCompany.join(',') 
              : selectedCompany;
            params.set('company', companyParam);
          }
          router.push(`/financeiro/gestao-de-pagamentos?${params.toString()}`);
          return;
      }
      
      if (selectedCompany) {
        const companyParam = Array.isArray(selectedCompany) 
          ? selectedCompany.join(',') 
          : selectedCompany;
        params.set('company', companyParam);
      }
      router.push(`/financeiro/gestao-de-pagamentos?${params.toString()}`);
    }
  };

  const handleToggleEditMode = () => {
    if (isEditMode) {
      // Sair do modo de edição
      setSelectedAlertas(new Set());
    }
    setIsEditMode(!isEditMode);
  };

  const handleToggleAlerta = (alertaId: string) => {
    const newSelected = new Set(selectedAlertas);
    if (newSelected.has(alertaId)) {
      newSelected.delete(alertaId);
    } else {
      newSelected.add(alertaId);
    }
    setSelectedAlertas(newSelected);
  };

  const handleDismissSelected = () => {
    if (showDismissConfirmation) {
      // Mostra o modal de confirmação
      const selected = alertas.filter(a => selectedAlertas.has(a.id));
      if (selected.length > 0) {
        setPendingDismiss(selected[0]); // Usa o primeiro para o título
        setDismissModalOpen(true);
      }
    } else {
      // Dispensa diretamente sem confirmação
      confirmDismissMultiple();
    }
  };

  const confirmDismissMultiple = () => {
    const newDismissed = new Set(dismissedAlertas);
    selectedAlertas.forEach((id) => newDismissed.add(id));
    setDismissedAlertas(newDismissed);
    setSelectedAlertas(new Set());
    setIsEditMode(false);
    toast.success(`${selectedAlertas.size} ${selectedAlertas.size === 1 ? "pendência dispensada" : "pendências dispensadas"}`);
    setDismissModalOpen(false);
    setPendingDismiss(null);
  };

  if (alertas.length === 0) {
    return (
      <Card className="rounded-xl bg-white border border-border h-full flex flex-col">
        <div className="px-4 py-3 border-b flex items-center gap-3 h-[62px] flex-shrink-0">
          <h3 className="text-sm font-semibold text-[#0d0f1c] flex-1">Últimas pendências</h3>
        </div>
        <CardContent className="flex-1 flex items-center justify-center !pt-24 !pb-32">
          <div className="flex flex-col items-center justify-center gap-3">
            <svg width="159" height="90" viewBox="0 0 159 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M69.9779 23.7272H76.168C85.6322 23.7272 93.3043 31.3994 93.3043 40.8635C93.3043 50.3277 85.6321 57.9999 76.168 57.9999H17.1363C7.67219 57.9999 0 50.3277 0 40.8635C0 31.3994 7.67221 23.7272 17.1364 23.7272H23.3258C23.3258 10.623 33.7693 0 46.6519 0C59.5345 0 69.9779 10.623 69.9779 23.7272Z" fill="#FFEDE8"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M132.87 52.1817H139.7C150.143 52.1817 158.609 60.6476 158.609 71.0908C158.609 81.534 150.143 89.9999 139.7 89.9999H74.5614C64.1182 89.9999 55.6523 81.534 55.6523 71.0908C55.6523 60.6476 64.1182 52.1817 74.5614 52.1817H81.3915C81.3915 37.7219 92.9153 26 107.131 26C121.346 26 132.87 37.7219 132.87 52.1817Z" fill="#FFDAD1"/>
            </svg>
            <p className="text-sm font-bold text-[#5F6572] text-center">
              Nenhuma pendência no momento
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-xl bg-white border border-border h-full flex flex-col">
        <div className="px-4 py-3 border-b flex items-center justify-between gap-3 h-[62px] flex-shrink-0">
          <div className="flex-1">
            {isEditMode ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleEditMode}
                className="font-bold text-[#0d0f1c] flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Button>
            ) : (
              <h3 className="text-sm font-semibold text-[#0d0f1c]">
                Últimas pendências
              </h3>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDismissSelected}
                disabled={selectedAlertas.size === 0}
                className="font-bold"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Dispensar
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleEditMode}
                className="font-bold"
              >
                <Pen className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </div>
      <CardContent className="px-4">
        <div className="space-y-0">
          {alertas.map((alerta, index) => {
            const Icon = alerta.icon;
            const isSelected = selectedAlertas.has(alerta.id);
            return (
              <React.Fragment key={alerta.id}>
                <div
                  className="rounded-lg cursor-pointer transition-colors hover:bg-[#EDF0F5]"
                  onClick={() => {
                    if (isEditMode) {
                      handleToggleAlerta(alerta.id);
                    } else {
                      handleClick(alerta);
                    }
                  }}
                >
                  <div className="flex items-center justify-between py-4 px-4">
                    <div className="flex items-center gap-4 flex-1">
                      {isEditMode ? (
                        <input
                          type="checkbox"
                          className="h-4 w-4 cursor-pointer appearance-none relative grid place-content-center rounded-[4px] border-[1.5px] border-[rgba(4,14,35,0.16)] bg-white shadow-[0_2px_0_0_rgba(4,14,35,0.04)] focus-visible:outline-none checked:bg-[#0C3CF7] checked:border-[#0C3CF7] after:content-[''] after:hidden checked:after:block after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45"
                          checked={isSelected}
                          onChange={() => handleToggleAlerta(alerta.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <Icon className="h-5 w-5" style={{ color: alerta.color }} />
                      )}
                      <div className="flex-1">
                        <div className="text-[#0d0f1c]">
                        {alerta.tituloMeio && alerta.tituloResto ? (
                          (() => {
                            // Separar "vencida(s)" de "em Conferir"/"em Pagar"
                            const emIndex = alerta.tituloResto.indexOf(' em ');
                            if (emIndex !== -1) {
                              const parte1 = alerta.tituloResto.substring(0, emIndex);
                              const parte2 = alerta.tituloResto.substring(emIndex);
                              return (
                                <>
                                  <span className="font-semibold">{alerta.titulo}</span>
                                  <span className="font-normal">{alerta.tituloMeio}</span>
                                  <span className="font-semibold">{parte1}</span>
                                  <span className="font-normal">{parte2}</span>
                                </>
                              );
                            }
                            return (
                              <>
                                <span className="font-semibold">{alerta.titulo}</span>
                                <span className="font-normal">{alerta.tituloMeio}</span>
                                <span className="font-semibold">{alerta.tituloResto}</span>
                              </>
                            );
                          })()
                        ) : alerta.tituloResto ? (
                          <>
                            <span className="font-semibold">{alerta.titulo}</span>
                            <span className="font-normal"> {alerta.tituloResto}</span>
                          </>
                        ) : (
                          <span className="font-semibold">{alerta.titulo}</span>
                        )}
                      </div>
                      <div className="text-sm text-[#5F6572] mt-1">
                        {formatCurrency(alerta.valor)}
                      </div>
                    </div>
                      </div>
                  </div>
                </div>
                {index < alertas.length - 1 && <Separator />}
              </React.Fragment>
            );
          })}
          {isEditMode && (
            <>
              <Separator />
              <div className="pt-4 pb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (onOpenFeedback) {
                      onOpenFeedback();
                    }
                  }}
                  className="w-full text-[#0C3CF7] hover:text-[#0a32c5] hover:bg-[#EFF1F2] font-bold"
                >
                  O que você deseja ver aqui?
                </Button>
              </div>
            </>
          )}
          </div>
        </CardContent>
      </Card>
      
      {/* Modal de confirmação para dispensar pendência */}
      {pendingDismiss && (
        <DismissPendencyModal
          open={dismissModalOpen}
          onClose={() => {
            setDismissModalOpen(false);
            setPendingDismiss(null);
          }}
          onConfirm={confirmDismissMultiple}
          pendencyTitle={pendingDismiss.titulo}
          count={selectedAlertas.size}
        />
      )}
    </>
  );
}

