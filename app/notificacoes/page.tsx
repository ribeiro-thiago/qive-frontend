"use client";

import { NotificationItem } from "@/components/navigation/NotificationItem";
import { useNotifications } from "@/lib/notifications/NotificationsContext";

export default function Page() {
  const { notifications, formatTime } = useNotifications();

  return (
    <section className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold tracking-tight text-[#0d0f1c]">Notificações</h1>
      <p className="mt-2 text-sm text-[#5B616F]">Últimas notificações recebidas.</p>

      <div className="mt-6 overflow-hidden rounded-lg border border-[rgba(4,14,35,0.08)] bg-white">
        {notifications.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-[#5B616F]">Nenhuma notificação</p>
        ) : (
          <ul className="divide-y divide-[rgba(4,14,35,0.08)]">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={[
                  "px-4 py-4",
                  !notification.read ? "bg-[#F8FAFF]" : "",
                ].join(" ")}
              >
                <NotificationItem
                  notification={notification}
                  timeLabel={formatTime(notification.createdAt)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
