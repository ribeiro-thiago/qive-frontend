# Qive Design

Projeto iniciado em Next.js (App Router + TypeScript).

## Scripts

- `npm run dev`: sobe o servidor de desenvolvimento
- `npm run build`: build de produção
- `npm run start`: executa o build
- `npm run lint`: roda ESLint
- `npm run typecheck`: checa os tipos TypeScript

## Tailwind CSS

- Config: `tailwind.config.js` + `postcss.config.js`
- Global CSS: `app/globals.css` com `@tailwind base/components/utilities`
- Fonte: Inter via `next/font` aplicada no `app/layout.tsx`

## Estrutura

- `app/`: rotas e UI (App Router)
- `app/api/hello/route.ts`: exemplo de rota API
- `app/page.tsx`: página inicial
- `app/layout.tsx`: layout raiz

## Começo rápido

1. Instale as dependências: `npm install`
2. Rode o dev server: `npm run dev`
3. Acesse: http://localhost:3000

Se quiser que eu alinhe as cores/tokens com o Figma, compartilhe os tokens ou autorize acesso via API/MCP.

Ajustes desejados (TypeScript/JavaScript, Tailwind, etc.) podem ser adicionados.
