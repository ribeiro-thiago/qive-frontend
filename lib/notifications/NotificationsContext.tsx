"use client";

import * as React from "react";
import { formatNotificationRelativeTime } from "./format-relative-time";

export type AppNotification = {
  id: string;
  source: string;
  messageBeforeLink: string;
  linkLabel: string;
  createdAt: number;
  read: boolean;
};

const FORNECEDORES_EXCEL_SOURCE = "Lista de fornecedores";
const FORNECEDORES_EXCEL_MESSAGE =
  "Sua solicitação de Relatório Excel foi concluída. ";
const FORNECEDORES_EXCEL_LINK_LABEL = "Clique aqui para visualizar o arquivo.";
const FORNECEDORES_EXCEL_NOTIFICATION_DELAY_MS = 2_500;

type NotificationsContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  enqueueFornecedoresExcelExportNotification: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  formatTime: (createdAt: number) => string;
};

const NotificationsContext = React.createContext<NotificationsContextValue | null>(null);

function createNotificationId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `notification-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
  const pendingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (pendingTimeoutRef.current) {
        clearTimeout(pendingTimeoutRef.current);
      }
    };
  }, []);

  const unreadCount = React.useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const enqueueFornecedoresExcelExportNotification = React.useCallback(() => {
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current);
    }

    pendingTimeoutRef.current = setTimeout(() => {
      setNotifications((prev) => [
        {
          id: createNotificationId(),
          source: FORNECEDORES_EXCEL_SOURCE,
          messageBeforeLink: FORNECEDORES_EXCEL_MESSAGE,
          linkLabel: FORNECEDORES_EXCEL_LINK_LABEL,
          createdAt: Date.now(),
          read: false,
        },
        ...prev,
      ]);
      pendingTimeoutRef.current = null;
    }, FORNECEDORES_EXCEL_NOTIFICATION_DELAY_MS);
  }, []);

  const markAsRead = React.useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  }, []);

  const markAllAsRead = React.useCallback(() => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  }, []);

  const formatTime = React.useCallback(
    (createdAt: number) => formatNotificationRelativeTime(createdAt),
    [],
  );

  const value = React.useMemo(
    () => ({
      notifications,
      unreadCount,
      enqueueFornecedoresExcelExportNotification,
      markAsRead,
      markAllAsRead,
      formatTime,
    }),
    [
      notifications,
      unreadCount,
      enqueueFornecedoresExcelExportNotification,
      markAsRead,
      markAllAsRead,
      formatTime,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = React.useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications deve ser usado dentro de NotificationsProvider");
  }
  return context;
}
