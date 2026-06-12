"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import Footer from "@/components/navigation/Footer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Check, Loader2, MoreVertical, Plus, Users, X } from "lucide-react";
import { toast } from "sonner";
import { ListFetchErrorState } from "../components/ListFetchErrorState";
import type { AccountFetchErrorVariant } from "../lib/account-fetch-error";
import { isAccountFetchError } from "../lib/account-fetch-error";
import type { UserGroup } from "../data/mock-grupos-usuarios";
import { fetchAccountGrupos } from "./lib/account-grupos-service";

const AVATAR_COLORS = [
  "bg-[#0C3CF7] text-white",
  "bg-[#F5A962] text-white",
  "bg-[#10B981] text-white",
  "bg-[#8B5CF6] text-white",
  "bg-[#EC4899] text-white",
];

const MAX_VISIBLE_AVATARS = 4;

function GruposSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-lg border border-[rgba(4,14,35,0.08)] bg-white px-4 py-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-[#E5E7EB]" />
            <div className="h-4 w-32 rounded bg-[#E5E7EB]" />
            <div className="ml-auto h-8 w-48 rounded-full bg-[#E5E7EB]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function GruposEmptyState({ onAddGroup }: { onAddGroup: () => void }) {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-center">
      <div className="h-12 w-12 rounded-full bg-[#E7EEFF] flex items-center justify-center mb-4">
        <Users className="h-6 w-6 text-[#0C3CF7]" />
      </div>
      <h3 className="text-base font-semibold text-[#0d0f1c]">
        Nenhum grupo de usuário criado
      </h3>
      <p className="mt-1 text-sm text-[#5F6572] max-w-md">
        Crie grupos para definir permissões e controlar o que cada usuário pode ver ou
        fazer na conta.
      </p>
      <Button className="mt-4 inline-flex items-center gap-2 font-bold" onClick={onAddGroup}>
        <Plus className="h-4 w-4" />
        Adicionar grupo
      </Button>
    </div>
  );
}

function UserInitialAvatar({ initials, colorIndex }: { initials: string; colorIndex: number }) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white text-[11px] font-semibold",
        AVATAR_COLORS[colorIndex % AVATAR_COLORS.length]
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}

function GrupoUsuarioCard({
  grupo,
  isMenuOpen,
  onMenuOpenChange,
  onCardClick,
}: {
  grupo: UserGroup;
  isMenuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  onCardClick: (grupo: UserGroup) => void;
}) {
  const visibleUsers = grupo.usuarios.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCount = grupo.extraUsersCount ?? Math.max(0, grupo.usuarios.length - MAX_VISIBLE_AVATARS);

  const handleMenuAction = (action: string) => {
    onMenuOpenChange(false);
    toast.info(`${action}: ${grupo.nome}`, {
      description: "Ação preparada para integração futura.",
    });
  };

  return (
    <article
      className={cn(
        "rounded-lg border border-[rgba(4,14,35,0.08)] bg-white px-4 py-3 shadow-[0_1px_0_0_rgba(4,14,35,0.04)] transition-colors",
        "hover:bg-[#FAFAFF] hover:border-[rgba(4,14,35,0.12)] cursor-pointer"
      )}
      onClick={() => onCardClick(grupo)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onCardClick(grupo);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F3F5FF] text-[#0C3CF7]">
              <Users className="h-5 w-5" />
            </div>
            <p className="truncate text-sm font-semibold text-[#0d0f1c]">{grupo.nome}</p>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-2">
            <Tag className="gap-1 whitespace-nowrap border-[#B8CCFF] bg-[#E7EEFF] text-[#003F70]">
              <Check className="h-3.5 w-3.5 shrink-0 text-[#0C3CF7]" aria-hidden />
              {grupo.cnpjCount} CNPJs
            </Tag>
            <Tag className="whitespace-nowrap border-[#E5E7EB] bg-[#F3F4F6] text-[#5B616F]">
              {grupo.listagensLabel}
            </Tag>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 sm:gap-4">
          {visibleUsers.length > 0 || overflowCount > 0 ? (
            <div className="flex items-center -space-x-2">
              {visibleUsers.map((initials, index) => (
                <UserInitialAvatar key={`${grupo.id}-${initials}-${index}`} initials={initials} colorIndex={index} />
              ))}
              {overflowCount > 0 ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#EAEBEC] text-[11px] font-semibold text-[#5B616F]">
                  +{overflowCount}
                </div>
              ) : null}
            </div>
          ) : (
            <span className="text-xs text-[#8A90A0] lg:min-w-[88px]" />
          )}

          <DropdownMenu open={isMenuOpen} onOpenChange={onMenuOpenChange} modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-[#5B616F]"
                aria-label={`Ações do grupo ${grupo.nome}`}
                onClick={(event) => event.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
              <DropdownMenuItem onClick={() => handleMenuAction("Editar grupo")}>
                Editar grupo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuAction("Editar permissões")}>
                Editar permissões
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuAction("Duplicar grupo")}>
                Duplicar grupo
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-[#B91C1C] focus:text-[#B91C1C]"
                onClick={() => handleMenuAction("Excluir grupo")}
              >
                Excluir grupo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </article>
  );
}

export default function GruposDeUsuariosPage() {
  const router = useRouter();
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<AccountFetchErrorVariant | null>(
    null
  );
  const [grupos, setGrupos] = React.useState<UserGroup[]>([]);

  const loadGrupos = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const result = await fetchAccountGrupos();
      setGrupos(result);
    } catch (error) {
      setGrupos([]);
      setLoadError(isAccountFetchError(error) ? error.variant : "system");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadGrupos();
  }, [loadGrupos]);

  const handleClose = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/minha-conta/usuarios");
  };

  const handleAddGroup = () => {
    router.push("/minha-conta/grupos-de-usuarios/novo");
  };

  const handleCardClick = (grupo: UserGroup) => {
    toast.info(`Detalhes do grupo: ${grupo.nome}`, {
      description: "Fluxo de detalhes/edição em breve.",
    });
  };

  return (
    <section className="p-6 h-full box-border">
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col">
        <div className="mb-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-sm font-medium text-[#5B616F] hover:text-[#0d0f1c]"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
            Fechar
          </Button>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-[#0d0f1c]">
              Grupos de usuários e Permissões
            </h1>
            <p className="mt-1 text-sm text-[#4B5563] max-w-2xl">
              Crie grupos de usuários para definir o que os usuários desse grupo podem
              ver/fazer na sua conta Qive.
            </p>
          </div>
          <Button
            className="inline-flex shrink-0 items-center gap-2 font-bold"
            onClick={handleAddGroup}
          >
            <Plus className="h-4 w-4" />
            Adicionar grupo
          </Button>
        </div>

        {isLoading ? (
          <GruposSkeleton />
        ) : loadError ? (
          <ListFetchErrorState
            variant={loadError}
            resourceLabel="os grupos de usuários"
            onRetry={() => void loadGrupos()}
          />
        ) : grupos.length === 0 ? (
          <GruposEmptyState onAddGroup={handleAddGroup} />
        ) : (
          <div className="space-y-3">
            {grupos.map((grupo) => (
              <GrupoUsuarioCard
                key={grupo.id}
                grupo={grupo}
                isMenuOpen={openMenuId === grupo.id}
                onMenuOpenChange={(open) => setOpenMenuId(open ? grupo.id : null)}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="mt-3 flex items-center gap-2 text-xs text-[#5B616F]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Carregando grupos...
          </div>
        ) : null}

        <div className="mt-auto pt-8">
          <Footer />
        </div>
      </div>
    </section>
  );
}
