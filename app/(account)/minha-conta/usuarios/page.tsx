"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/navigation/Footer";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  Filter,
  Loader2,
  PencilLine,
  Plus,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AccountSidebar } from "../components/AccountSidebar";
import { ListFetchErrorState } from "../components/ListFetchErrorState";
import type { AccountFetchErrorVariant } from "../lib/account-fetch-error";
import { isAccountFetchError, toAccountFetchError } from "../lib/account-fetch-error";
import type { AccountUser } from "../data/mock-usuarios";
import {
  fetchAccountUsuarios,
  setAccountUsuarioAtivo,
} from "./lib/account-usuarios-service";
import {
  DEFAULT_USUARIOS_FILTERS,
  UsuariosFiltersPanel,
  type UsuariosFiltersState,
} from "./components/UsuariosFiltersPanel";
import { AdicionarUsuarioModal } from "./components/AdicionarUsuarioModal";
import { EditarUsuarioModal } from "./components/EditarUsuarioModal";

const TABLE_GRID =
  "grid grid-cols-[minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.7fr)] gap-px";

function AtivoTag({ ativo }: { ativo: boolean }) {
  if (!ativo) return <span className="text-sm">NÃO</span>;

  return (
    <span className="inline-flex items-center rounded-full border border-[#BBF7D0] bg-[#ECFDF1] px-2 py-0.5 text-[11px] font-medium text-[#166534]">
      SIM
    </span>
  );
}

function TruncatedCell({
  value,
  className,
  isHighlighted,
}: {
  value: string;
  className?: string;
  isHighlighted?: boolean;
}) {
  return (
    <span
      className={cn(
        "block truncate text-sm",
        isHighlighted ? "text-white" : "text-[#111827]",
        className
      )}
      title={value}
    >
      {value}
    </span>
  );
}

const ACTION_BUTTON_CLASS =
  "h-7 gap-1.5 px-3 text-xs font-semibold bg-white text-[#111827] border border-[rgba(4,14,35,0.08)] shadow-sm";

function UsuarioRowActions({
  user,
  onToggleActive,
  onEditPermissions,
  isTogglingActive,
}: {
  user: AccountUser;
  onToggleActive: (user: AccountUser) => void;
  onEditPermissions: (user: AccountUser) => void;
  isTogglingActive: boolean;
}) {
  return (
    <div className="flex w-full items-center justify-end gap-2 bg-white px-4 py-2.5">
      <Button
        variant="secondary"
        size="sm"
        className={ACTION_BUTTON_CLASS}
        disabled={isTogglingActive}
        onClick={(event) => {
          event.stopPropagation();
          onToggleActive(user);
        }}
      >
        {user.ativo ? (
          <>
            <X className="h-3.5 w-3.5" />
            Desativar
          </>
        ) : (
          <>
            <Check className="h-3.5 w-3.5" />
            Reativar
          </>
        )}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className={ACTION_BUTTON_CLASS}
        onClick={(event) => {
          event.stopPropagation();
          onEditPermissions(user);
        }}
      >
        <PencilLine className="h-3.5 w-3.5" />
        Editar permissões
      </Button>
    </div>
  );
}

function UsuariosEmptyState({
  variant,
  onAddUser,
  onClearFilters,
}: {
  variant: "account" | "filters";
  onAddUser: () => void;
  onClearFilters?: () => void;
}) {
  const isAccountEmpty = variant === "account";

  return (
    <div className="py-12 flex flex-col items-center justify-center text-center">
      <div className="h-12 w-12 rounded-full bg-[#E7EEFF] flex items-center justify-center mb-4">
        <Users className="h-6 w-6 text-[#0C3CF7]" />
      </div>
      <h3 className="text-base font-semibold text-[#0d0f1c]">
        {isAccountEmpty
          ? "Nenhum usuário na conta"
          : "Nenhum usuário encontrado."}
      </h3>
      <p className="mt-1 text-sm text-[#5F6572] max-w-md">
        {isAccountEmpty
          ? "Adicione o primeiro usuário para começar a definir permissões por grupo."
          : "Adicione um novo usuário ou ajuste os filtros para visualizar resultados."}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Button className="inline-flex items-center gap-2 font-bold" onClick={onAddUser}>
          <Plus className="h-4 w-4" />
          Adicionar usuário
        </Button>
        {!isAccountEmpty && onClearFilters ? (
          <Button variant="secondary" onClick={onClearFilters}>
            Limpar filtros
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function UsuariosTableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className={cn(TABLE_GRID, "animate-pulse")}>
          {Array.from({ length: 7 }).map((__, cellIndex) => (
            <div key={cellIndex} className="bg-white px-4 py-3">
              <div className="h-4 rounded bg-[#E5E7EB]" />
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

function applyFilters(users: AccountUser[], filters: UsuariosFiltersState): AccountUser[] {
  return users.filter((user) => {
    const nomeMatch =
      !filters.nome || user.nome.toLowerCase().includes(filters.nome.toLowerCase());
    const emailMatch =
      !filters.email || user.email.toLowerCase().includes(filters.email.toLowerCase());
    const grupoMatch =
      !filters.grupo ||
      user.grupoUsuarios.toLowerCase().includes(filters.grupo.toLowerCase());
    const ativoMatch =
      !filters.ativo ||
      (filters.ativo === "Sim" && user.ativo) ||
      (filters.ativo === "Não" && !user.ativo);

    return nomeMatch && emailMatch && grupoMatch && ativoMatch;
  });
}

export default function AccountUsersPage() {
  const router = useRouter();
  const [filtersExpanded, setFiltersExpanded] = React.useState(false);
  const [draftFilters, setDraftFilters] =
    React.useState<UsuariosFiltersState>(DEFAULT_USUARIOS_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    React.useState<UsuariosFiltersState>(DEFAULT_USUARIOS_FILTERS);
  const [hoveredRowId, setHoveredRowId] = React.useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<AccountFetchErrorVariant | null>(
    null
  );
  const [users, setUsers] = React.useState<AccountUser[]>([]);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [addUserModalOpen, setAddUserModalOpen] = React.useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = React.useState(false);
  const [userToEdit, setUserToEdit] = React.useState<AccountUser | null>(null);
  const [togglingActiveUserId, setTogglingActiveUserId] = React.useState<string | null>(
    null
  );

  const filteredUsers = React.useMemo(
    () => applyFilters(users, appliedFilters),
    [users, appliedFilters]
  );

  const handleAddUser = () => {
    setAddUserModalOpen(true);
  };

  const handleUserCreated = (user: AccountUser) => {
    setUsers((current) => [user, ...current]);
    setTotalUsers((current) => current + 1);
  };

  const handleViewUserGroups = () => {
    router.push("/minha-conta/grupos-de-usuarios");
  };

  const handleToggleActive = async (user: AccountUser) => {
    const nextAtivo = !user.ativo;
    setTogglingActiveUserId(user.id);

    try {
      const updatedUser = await setAccountUsuarioAtivo(user, nextAtivo);
      setUsers((current) =>
        current.map((item) => (item.id === updatedUser.id ? updatedUser : item))
      );
      toast.success(
        nextAtivo
          ? "Usuário reativado com sucesso."
          : "Usuário desativado com sucesso."
      );
    } catch (error) {
      toast.error(toAccountFetchError(error).message);
    } finally {
      setTogglingActiveUserId(null);
    }
  };

  const handleEditPermissions = (user: AccountUser) => {
    setUserToEdit(user);
    setEditUserModalOpen(true);
  };

  const handleUserUpdated = (updatedUser: AccountUser) => {
    setUsers((current) =>
      current.map((item) => (item.id === updatedUser.id ? updatedUser : item))
    );
  };

  const handleToggleFilters = () => {
    setFiltersExpanded((open) => {
      if (!open) {
        setDraftFilters({ ...appliedFilters });
      }
      return !open;
    });
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...draftFilters });
  };

  const handleClearFilters = () => {
    setDraftFilters(DEFAULT_USUARIOS_FILTERS);
    setAppliedFilters(DEFAULT_USUARIOS_FILTERS);
  };

  const loadUsuarios = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const result = await fetchAccountUsuarios();
      setUsers(result.users);
      setTotalUsers(result.total);
    } catch (error) {
      setUsers([]);
      setTotalUsers(0);
      setLoadError(isAccountFetchError(error) ? error.variant : "system");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadUsuarios();
  }, [loadUsuarios]);

  const isAccountEmpty = !isLoading && !loadError && users.length === 0;
  const isFilterEmpty =
    !isLoading && !loadError && users.length > 0 && filteredUsers.length === 0;

  const existingEmails = React.useMemo(
    () => users.map((user) => user.email),
    [users]
  );

  const activeRowId = hoveredRowId ?? selectedRowId;

  return (
    <section className="p-6 h-full box-border">
      <div className="w-full h-full mx-auto">
        <div className="flex h-full gap-6 items-stretch lg:flex-row">
          <AccountSidebar />

          <div className="flex-1 min-w-0 flex flex-col">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-[#0d0f1c]">
                  Listagem de usuários
                </h1>
                <p className="text-sm text-[#4B5563] mt-1 max-w-2xl">
                  Adicione novos usuários na sua conta, e defina o que eles podem ver/fazer
                  através dos grupos de usuários.
                </p>
              </div>
              <Button
                className="inline-flex shrink-0 items-center gap-2 font-bold"
                onClick={handleAddUser}
              >
                <Plus className="h-4 w-4" />
                Adicionar usuário
              </Button>
            </div>

            <div className="mb-3 flex justify-end">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  className={cn(
                    "h-9 gap-2 px-4",
                    filtersExpanded &&
                      "border-[#0C3CF7] ring-1 ring-[#0C3CF7] data-[state=open]:border-[#0C3CF7]"
                  )}
                  onClick={handleToggleFilters}
                  aria-expanded={filtersExpanded}
                >
                  <Filter className="h-4 w-4" />
                  Filtrar
                </Button>
                <Button
                  variant="secondary"
                  className="h-9 gap-2 px-4"
                  onClick={handleViewUserGroups}
                >
                  <Users className="h-4 w-4" />
                  Ver Grupos de Usuário
                </Button>
              </div>
            </div>

            <UsuariosFiltersPanel
              expanded={filtersExpanded}
              filters={draftFilters}
              onFiltersChange={setDraftFilters}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
            />

            <div className="overflow-x-auto">
              <div className="min-w-[960px] overflow-hidden rounded-lg border border-border bg-[#F9FAFB]">
                <div className="text-xs text-[#4B5563]">
                  <div className={TABLE_GRID}>
                    <div className="bg-[#F3F4F6] px-4 py-2 font-medium">Nome</div>
                    <div className="bg-[#F3F4F6] px-4 py-2 font-medium">Email</div>
                    <div className="bg-[#F3F4F6] px-4 py-2 font-medium">
                      Grupo de usuários
                    </div>
                    <div className="bg-[#F3F4F6] px-4 py-2 font-medium">Área</div>
                    <div className="bg-[#F3F4F6] px-4 py-2 font-medium">Cargo</div>
                    <div className="bg-[#F3F4F6] px-4 py-2 font-medium">Telefone</div>
                    <div className="bg-[#F3F4F6] px-4 py-2 font-medium">Ativo?</div>
                  </div>

                  {isLoading ? (
                    <UsuariosTableSkeleton />
                  ) : loadError ? (
                    <div className="bg-white">
                      <ListFetchErrorState
                        variant={loadError}
                        resourceLabel="os usuários"
                        onRetry={() => void loadUsuarios()}
                      />
                    </div>
                  ) : isAccountEmpty || isFilterEmpty ? (
                    <div className="bg-white">
                      <UsuariosEmptyState
                        variant={isAccountEmpty ? "account" : "filters"}
                        onAddUser={handleAddUser}
                        onClearFilters={handleClearFilters}
                      />
                    </div>
                  ) : (
                    filteredUsers.map((user) => {
                      const isHighlighted = activeRowId === user.id;

                      return (
                        <div
                          key={user.id}
                          onMouseEnter={() => setHoveredRowId(user.id)}
                          onMouseLeave={() => setHoveredRowId(null)}
                        >
                          <div
                            className={cn(TABLE_GRID, "cursor-pointer transition-colors")}
                            onClick={() =>
                              setSelectedRowId((current) =>
                                current === user.id ? null : user.id
                              )
                            }
                          >
                            {[
                              { value: user.nome, className: "font-medium" },
                              { value: user.email },
                              { value: user.grupoUsuarios },
                              { value: user.area },
                              { value: user.cargo },
                              { value: user.telefone },
                            ].map((cell, cellIndex) => (
                              <div
                                key={cellIndex}
                                className={cn(
                                  "px-4 py-3 transition-colors",
                                  isHighlighted ? "bg-[#040E23]" : "bg-white"
                                )}
                              >
                                <TruncatedCell
                                  value={cell.value}
                                  className={cell.className}
                                  isHighlighted={isHighlighted}
                                />
                              </div>
                            ))}
                            <div
                              className={cn(
                                "px-4 py-3 transition-colors",
                                isHighlighted ? "bg-[#040E23]" : "bg-white"
                              )}
                            >
                              <AtivoTag ativo={user.ativo} />
                            </div>
                          </div>

                          {isHighlighted ? (
                            <UsuarioRowActions
                              user={user}
                              onToggleActive={handleToggleActive}
                              onEditPermissions={handleEditPermissions}
                              isTogglingActive={togglingActiveUserId === user.id}
                            />
                          ) : null}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {!isLoading && !loadError && filteredUsers.length > 0 ? (
              <div className="mt-3 flex flex-col gap-2 text-xs text-[#6B7280] sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <span>Resultados por página</span>
                  <button
                    type="button"
                    className="inline-flex items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-2.5 py-1 text-xs font-medium text-[#111827] min-w-[60px]"
                  >
                    10
                    <ChevronDown className="ml-1 h-3 w-3 text-[#6B7280]" />
                  </button>
                </div>
                <div className="text-xs text-[#4B5563]">
                  Mostrando 1-{Math.min(10, filteredUsers.length)} de {totalUsers} usuários
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full border-[#E5E7EB] bg-white px-3 text-xs font-medium text-[#9CA3AF]"
                    disabled
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full border-[#CBD5F5] bg-[#EEF2FF] px-3 text-xs font-medium text-[#111827]"
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            ) : null}

            {isLoading ? (
              <div className="mt-3 flex items-center gap-2 text-xs text-[#5B616F]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Carregando usuários...
              </div>
            ) : null}

            <div className="mt-auto pt-8">
              <Footer />
            </div>
          </div>
        </div>
      </div>

      <AdicionarUsuarioModal
        open={addUserModalOpen}
        onOpenChange={setAddUserModalOpen}
        onAddUser={handleUserCreated}
        existingEmails={existingEmails}
      />

      <EditarUsuarioModal
        open={editUserModalOpen}
        onOpenChange={setEditUserModalOpen}
        user={userToEdit}
        onUserUpdated={handleUserUpdated}
      />
    </section>
  );
}
