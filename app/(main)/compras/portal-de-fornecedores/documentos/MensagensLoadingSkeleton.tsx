"use client";

function MessageSkeletonRow({ align }: { align: "left" | "right" }) {
  return (
    <div
      className={`flex gap-3 ${align === "right" ? "flex-row-reverse" : ""}`}
      aria-hidden
    >
      <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-[#E5E7EB]" />
      <div className={`min-w-0 flex-1 space-y-2 ${align === "right" ? "items-end" : ""}`}>
        <div className="h-3 w-32 animate-pulse rounded bg-[#E5E7EB]" />
        <div className="h-14 w-full max-w-[280px] animate-pulse rounded-lg bg-[#F3F4F6]" />
      </div>
    </div>
  );
}

export function MensagensLoadingSkeleton() {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4"
      aria-busy="true"
      aria-label="Carregando mensagens"
    >
      <ul className="space-y-4">
        <li>
          <MessageSkeletonRow align="left" />
        </li>
        <li>
          <MessageSkeletonRow align="right" />
        </li>
        <li>
          <MessageSkeletonRow align="left" />
        </li>
      </ul>
    </div>
  );
}
