"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/lib/notifications/NotificationsContext";
import { Bell, Settings } from "lucide-react";
import { NotificationItem } from "./NotificationItem";

export default function NotificationsMenu() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, formatTime } = useNotifications();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [, setTimeTick] = React.useState(0);

  React.useEffect(() => {
    if (!menuOpen) return;

    setTimeTick((tick) => tick + 1);
    const interval = window.setInterval(() => {
      setTimeTick((tick) => tick + 1);
    }, 30_000);

    return () => window.clearInterval(interval);
  }, [menuOpen]);

  const recentNotifications = notifications.slice(0, 3);

  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label="Notificações" className="nav-icon-btn relative">
          <Bell size={20} className="text-[#5B616F]" />
          {unreadCount > 0 ? (
            <span
              className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#0C3CF7] ring-2 ring-white"
              aria-hidden
            />
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <DropdownMenuLabel className="p-0 text-base font-semibold text-[#0d0f1c]">
            Notificações
          </DropdownMenuLabel>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              router.push("/notificacoes/ajustes");
            }}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-[#5B616F] transition-colors hover:bg-[#EFF1F2]"
            aria-label="Configurações de notificações"
          >
            <Settings size={16} />
          </button>
        </div>

        <div className="max-h-[300px] min-h-[200px] overflow-y-auto">
          {recentNotifications.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center px-4">
              <p className="text-sm text-[#5B616F]">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="py-2">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={[
                    "cursor-pointer border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-[#EFF1F2]",
                    !notification.read ? "bg-[#F8FAFF]" : "",
                  ].join(" ")}
                  onClick={() => {
                    markAsRead(notification.id);
                    router.push("/notificacoes");
                  }}
                >
                  <NotificationItem
                    notification={notification}
                    timeLabel={formatTime(notification.createdAt)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <DropdownMenuSeparator />

        <div className="px-4 py-3">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              router.push("/notificacoes");
            }}
            className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-[#0C3CF7] transition-colors hover:bg-[#EFF1F2]"
          >
            Ver todas as notificações
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
