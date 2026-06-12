import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir assets e rotas internas do Next (já tratadas pelo matcher também)
  if (
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    /\.(?:svg|png|jpg|jpeg|gif|webp)$/.test(pathname)
  ) {
    const response = NextResponse.next()
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return response
  }

  // Allowlist de rotas acessíveis
  const allowedPaths = new Set<string>([
    '/',
    '/financeiro/gestao-de-pagamentos',
    '/financeiro/dashboard-financeiro',
    '/financeiro/comprovantes',
    '/ajustes',
    '/compras/portal-de-fornecedores',
    '/compras/portal-de-fornecedores/documentos',
    '/compras/portal-de-fornecedores/documentos/importar',
    '/compras/portal-de-fornecedores/nfe',
    '/compras/portal-de-fornecedores/nfe/importar',
    '/compras/portal-de-fornecedores/nfse',
    '/compras/portal-de-fornecedores/nfse/importar',
    '/compras/portal-de-fornecedores/cte',
    '/compras/portal-de-fornecedores/cte/importar',
    '/compras/portal-de-fornecedores/cte-os',
    '/compras/portal-de-fornecedores/cte-os/importar',
    '/compras/portal-de-fornecedores/cadastro',
    '/compras/portal-de-fornecedores/cadastro/importar',
    '/compras/portal-de-fornecedores/indicadores/importar',
    '/compras/portal-de-fornecedores/indicadores',
    '/compras/portal-de-fornecedores/painel-de-transicao-tributaria',
    '/compras/portal-de-fornecedores/historico-de-atividades',
    '/compras/analise-de-fornecedores',
    '/compras/custos-de-transporte',
    '/compras/preco-de-produto',
    '/compras/controle-de-devolucao',
    '/fiscal/reforma-tributaria',
    '/fiscal/erros-em-notas',
    '/fiscal/painel-conexoes',
    '/fiscal/confere-chaves',
    '/fiscal/analise-tax-sped',
    '/fiscal/confere-c100d100',
    '/fiscal/speds-entregues',
    '/minha-conta',
    '/minha-conta/empresas',
    '/minha-conta/usuarios',
    '/minha-conta/grupos-de-usuarios',
    '/minha-conta/grupos-de-usuarios/novo',
    '/minha-conta/escolha-plano',
  ])
  if (allowedPaths.has(pathname)) {
    const response = NextResponse.next()
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return response
  }

  if (/^\/minha-conta\/empresas\/[^/]+\/editar\/?$/.test(pathname)) {
    const response = NextResponse.next()
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return response
  }

  // Página externa de pagamento Vindi (fatura por id)
  if (pathname.startsWith('/fatura/')) {
    const response = NextResponse.next()
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return response
  }

  // Redirecionar qualquer outra rota para o Painel de performance
  const url = request.nextUrl.clone()
  url.pathname = '/financeiro/dashboard-financeiro'
  const response = NextResponse.redirect(url)
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

