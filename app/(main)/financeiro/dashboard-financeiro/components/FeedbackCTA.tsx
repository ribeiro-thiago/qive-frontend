"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquarePlus, Send, X, Check } from "lucide-react";
import { toast } from "sonner";

interface FeedbackCTAProps {
  openWithMessage?: string | null;
  onMessageProcessed?: () => void;
}

export function FeedbackCTA({ openWithMessage, onMessageProcessed }: FeedbackCTAProps) {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [nome, setNome] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [mensagem, setMensagem] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Abrir formulário e pré-preencher mensagem quando openWithMessage for definido
  React.useEffect(() => {
    if (openWithMessage) {
      setIsFormOpen(true);
      setMensagem(openWithMessage);
      // Fazer scroll até o elemento após um pequeno delay para garantir que o formulário está renderizado
      setTimeout(() => {
        const element = document.getElementById("feedback-cta");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
      // Notificar que a mensagem foi processada para limpar o estado no componente pai
      if (onMessageProcessed) {
        setTimeout(() => {
          onMessageProcessed();
        }, 200);
      }
    }
  }, [openWithMessage, onMessageProcessed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim() || !email.trim() || !mensagem.trim()) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setIsSubmitting(true);

    // Simular envio do feedback
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Feedback enviado com sucesso! Obrigado pela sua contribuição.");
    
    // Limpar formulário e mostrar estado de sucesso
    setNome("");
    setEmail("");
    setMensagem("");
    setIsFormOpen(false);
    setIsSuccess(true);
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setNome("");
    setEmail("");
    setMensagem("");
  };

  const handleSendAnother = () => {
    setIsSuccess(false);
    setIsFormOpen(true);
  };

  return (
    <div id="feedback-cta" className="w-auto max-w-4xl mx-auto p-8">
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              Feedback enviado!
            </h3>
            <p className="text-sm text-gray-600 max-w-md">
              Obrigado por compartilhar sua opinião conosco. Seu feedback é muito importante 
              para continuarmos melhorando o Painel de Performance.
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={handleSendAnother}
            className="mt-2 bg-[#0C3CF7] hover:bg-[#0a32c5] text-white font-medium"
          >
            <MessageSquarePlus className="h-4 w-4 mr-2" />
            Enviar outro feedback
          </Button>
        </div>
      ) : !isFormOpen ? (
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center">
            <MessageSquarePlus className="h-8 w-8 text-[#0C3CF7]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              Ajude-nos a melhorar
            </h3>
            <p className="text-sm text-gray-600 max-w-md">
              Sua opinião é essencial para aprimorarmos o Painel de Performance. 
              Compartilhe suas sugestões, dificuldades ou ideias conosco.
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={() => setIsFormOpen(true)}
            className="mt-2 bg-[#0C3CF7] hover:bg-[#0a32c5] text-white font-medium"
          >
            <MessageSquarePlus className="h-4 w-4 mr-2" />
            Enviar Feedback
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full">
          <div className="w-full max-w-3xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  Enviar Feedback
                </h3>
                <p className="text-sm text-gray-600">
                  Preencha os campos abaixo com suas sugestões
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="shadow-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="shadow-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mensagem">Mensagem</Label>
                <Textarea
                  id="mensagem"
                  placeholder="Compartilhe suas sugestões, dificuldades ou ideias para melhorarmos o Painel de Performance..."
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  required
                  disabled={isSubmitting}
                  rows={6}
                  className="resize-none shadow-none"
                />
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#0C3CF7] hover:bg-[#0a32c5] text-white"
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2">Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Feedback
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
