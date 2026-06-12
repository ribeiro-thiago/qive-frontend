"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquarePlus, Check, AlertTriangle } from "lucide-react";
import { FEEDBACK_USER_EMAIL } from "../data/mock-data";

type FeedbackView = "idle" | "form" | "success" | "error";

function FeedbackAvatar() {
  return (
    <div
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-50"
      aria-hidden
    >
      <MessageSquarePlus className="h-8 w-8 text-[#0C3CF7]" strokeWidth={2} />
    </div>
  );
}

function FeedbackCard({
  children,
  statusBar,
}: {
  children: React.ReactNode;
  statusBar?: "success" | "error";
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-[rgba(4,14,35,0.08)] bg-white shadow-[0_1px_0_0_rgba(4,14,35,0.04)]">
      <div className="p-6 lg:p-8">{children}</div>
      {statusBar === "success" && <div className="h-1 bg-[#16A34A]" aria-hidden />}
      {statusBar === "error" && <div className="h-1 bg-[#DC2626]" aria-hidden />}
    </div>
  );
}

export function PortalFeedbackCTA() {
  const [view, setView] = React.useState<FeedbackView>("idle");
  const [nome, setNome] = React.useState("");
  const [comentario, setComentario] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isFormValid = nome.trim().length > 0 && comentario.trim().length > 0;

  const resetForm = () => {
    setNome("");
    setComentario("");
  };

  const handleOpenForm = () => {
    setView("form");
  };

  const handleCancel = () => {
    resetForm();
    setView("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    resetForm();
    setIsSubmitting(false);
    setView("success");
  };

  const handleSendAnother = () => {
    resetForm();
    setView("form");
  };

  const handleRetry = () => {
    setView("form");
  };

  return (
    <section id="portal-feedback-cta" className="w-full py-6" aria-live="polite">
      <FeedbackCard
        statusBar={view === "success" ? "success" : view === "error" ? "error" : undefined}
      >
        {view === "success" ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center space-y-4 py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#16A34A]">
              <Check className="h-8 w-8 text-white" strokeWidth={2.5} aria-hidden />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-[#0d0f1c]">
                Feedback enviado com sucesso!
              </h3>
              <p className="max-w-md text-sm text-[#5B616F]">
                Obrigado por sua colaboração. Sua opinião é muito importante para nós.
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleSendAnother}
              className="mt-2 font-medium"
            >
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              Enviar novo feedback
            </Button>
          </div>
        ) : view === "error" ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center space-y-4 py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#DC2626]">
              <AlertTriangle className="h-8 w-8 text-white" strokeWidth={2.5} aria-hidden />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-[#0d0f1c]">Erro ao enviar feedback</h3>
              <p className="max-w-md text-sm text-[#5B616F]">
                Ocorreu um problema ao processar sua solicitação. Por favor, tente novamente mais
                tarde.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={handleRetry}
                className="font-medium"
              >
                Tentar novamente
              </Button>
              <Button type="button" variant="ghost" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : view === "form" ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-semibold text-[#0d0f1c]">Ajude-nos a melhorar</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="portal-feedback-nome" className="text-[#0d0f1c]">
                    Nome <span className="text-[#DC2626]">*</span>
                  </Label>
                  <Input
                    id="portal-feedback-nome"
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="shadow-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portal-feedback-email" className="text-[#0d0f1c]">
                    E-mail
                  </Label>
                  <Input
                    id="portal-feedback-email"
                    type="email"
                    value={FEEDBACK_USER_EMAIL}
                    readOnly
                    disabled
                    className="shadow-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="portal-feedback-comentario" className="text-[#0d0f1c]">
                  Comentário <span className="text-[#DC2626]">*</span>
                </Label>
                <Textarea
                  id="portal-feedback-comentario"
                  placeholder="Escreva aqui seu comentário..."
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  required
                  disabled={isSubmitting}
                  rows={5}
                  className="shadow-none"
                />
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full font-medium sm:w-auto"
              >
                {isSubmitting ? "Enviando..." : "Enviar feedback"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex min-h-[180px] flex-col items-center justify-center space-y-4 py-4 text-center">
            <FeedbackAvatar />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-[#0d0f1c]">Ajude-nos a melhorar</h3>
              <p className="max-w-lg text-sm text-[#5B616F]">
                Sua opinião é muito importante para nós. Conte-nos o que você achou desta página.
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleOpenForm}
              className="font-medium"
            >
              Enviar feedback
            </Button>
          </div>
        )}
      </FeedbackCard>
    </section>
  );
}
