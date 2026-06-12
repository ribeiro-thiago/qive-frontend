"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="font-sans">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
          <h2 className="text-lg font-semibold text-[#0d0f1c]">Algo deu errado</h2>
          <p className="text-sm text-[#5B616F]">Tente recarregar a página.</p>
          {process.env.NODE_ENV === "development" && error?.message ? (
            <p className="max-w-lg text-center text-xs text-[#8A90A0]">{error.message}</p>
          ) : null}
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg bg-[#0C3CF7] px-4 py-2 text-sm font-medium text-white"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
