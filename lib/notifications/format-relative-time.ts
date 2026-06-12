export function formatNotificationRelativeTime(
  createdAt: number,
  now: number = Date.now(),
): string {
  const diffMs = Math.max(0, now - createdAt);
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return "agora";
  if (diffMinutes === 1) return "1 minuto atrás";
  if (diffMinutes < 60) return `${diffMinutes} minutos atrás`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours === 1) return "1 hora atrás";
  if (diffHours < 24) return `${diffHours} horas atrás`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1 dia atrás";
  return `${diffDays} dias atrás`;
}
