"use client";

import type { AppNotification } from "@/lib/notifications/NotificationsContext";

type NotificationItemProps = {
  notification: AppNotification;
  timeLabel: string;
};

export function NotificationItem({ notification, timeLabel }: NotificationItemProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm leading-5 text-[#3D4350]">
        <span className="font-semibold text-[#0d0f1c]">[{notification.source}]</span>{" "}
        {notification.messageBeforeLink}
        <span
          className="text-[#0C3CF7] underline underline-offset-2"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          {notification.linkLabel}
        </span>
      </p>
      <p className="text-xs text-[#90949D]">{timeLabel}</p>
    </div>
  );
}
