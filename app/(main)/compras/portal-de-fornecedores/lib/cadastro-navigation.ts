import { COMPANY_FILTER_OPTIONS } from "../painel-de-transicao-tributaria/data/mock-data";

export const CADASTRO_PATH = "/compras/portal-de-fornecedores/cadastro";
export const CADASTRO_TABLE_ANCHOR = "tabela-fornecedores";

export type RecorrenciaSlug = "alta" | "media" | "baixa";
export type RecorrenciaLabel = "Alta" | "Média" | "Baixa";

export const COMPLIANCE_CARD_TO_RECORRENCIA: Record<string, RecorrenciaSlug> = {
  "high-risk": "alta",
  evaluation: "media",
  safe: "baixa",
};

const RECORRENCIA_SLUG_TO_LABEL: Record<RecorrenciaSlug, RecorrenciaLabel> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

const COMPANY_LABEL_TO_SLUG: Record<string, string> = {
  "Todas as empresas": "todas",
  "12.345.678/0001-90": "matriz",
  "12.345.678/0002-71": "filial1",
};

const COMPANY_SLUG_TO_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(COMPANY_LABEL_TO_SLUG).map(([label, slug]) => [slug, label]),
);

export type RegimeTributarioSlug = "normal" | "simples-mei";
export type DestaqueCbsIbsSlug = "com-destaque" | "sem-destaque";

const ENQUADRAMENTO_BAR_TO_REGIME: Record<string, RegimeTributarioSlug> = {
  normal: "normal",
  "simples-mei": "simples-mei",
};

const ENQUADRAMENTO_BAR_TO_DESTAQUE: Record<string, DestaqueCbsIbsSlug> = {
  "com-destaque": "com-destaque",
  "sem-destaque": "sem-destaque",
};

const SUPPLIER_PERIOD_TO_SLUG: Record<string, string> = {
  "Todo o período": "todo-periodo",
  "Últimos 30 dias": "30-dias",
  "Últimos 90 dias": "90-dias",
};

const DOCUMENT_TYPE_TO_SLUG: Record<string, string> = {
  "NF-e": "nfe",
  "NFS-e": "nfse",
  "CT-e": "cte",
};

export type VisaoGeralSlug =
  | "total"
  | "cnpj-irregular"
  | "maior-valor"
  | "dados-sem-fornecedor";

const VISAO_GERAL_SLUGS: VisaoGeralSlug[] = [
  "total",
  "cnpj-irregular",
  "maior-valor",
  "dados-sem-fornecedor",
];

/** Slug do card na UI → slug persistido na URL (`visaoGeral`). */
export const OVERVIEW_CARD_TO_VISAO_GERAL: Record<string, VisaoGeralSlug> = {
  "cnpj-regular": "total",
  "cnpj-irregular": "cnpj-irregular",
  "sem-credito-reforma": "maior-valor",
  "com-credito-reforma": "dados-sem-fornecedor",
};

export type CadastroUrlFilters = {
  recorrencia?: RecorrenciaSlug;
  empresa?: string;
  periodo?: string;
  regimeTributario?: RegimeTributarioSlug;
  destaqueCbsIbs?: DestaqueCbsIbsSlug;
  tipoDocumento?: string;
  visaoGeral?: VisaoGeralSlug[];
};

export function companyLabelToSlug(label: string): string {
  return COMPANY_LABEL_TO_SLUG[label] ?? label.toLowerCase().replace(/\s+/g, "-");
}

export function companySlugToLabel(slug: string): string | null {
  if (COMPANY_SLUG_TO_LABEL[slug]) return COMPANY_SLUG_TO_LABEL[slug];
  const fromOptions = COMPANY_FILTER_OPTIONS.find(
    (option) => companyLabelToSlug(option) === slug,
  );
  return fromOptions ?? null;
}

export function recorrenciaSlugToLabel(slug: string): RecorrenciaLabel | null {
  if (slug in RECORRENCIA_SLUG_TO_LABEL) {
    return RECORRENCIA_SLUG_TO_LABEL[slug as RecorrenciaSlug];
  }
  return null;
}

const REGIME_TRIBUTARIO_SLUGS: RegimeTributarioSlug[] = ["normal", "simples-mei"];
const DESTAQUE_CBS_IBS_SLUGS: DestaqueCbsIbsSlug[] = ["com-destaque", "sem-destaque"];

/** Valores do drawer de filtros correspondentes ao slug da URL. */
export function regimeTributarioSlugToDrawerValue(slug: RegimeTributarioSlug): string {
  return slug === "normal" ? "Normal" : "Simples Nacional";
}

export function matchesRegimeTributarioSlug(
  regimeTributario: string,
  slug: RegimeTributarioSlug,
): boolean {
  const normalized = regimeTributario.trim().toLowerCase();

  if (slug === "normal") {
    return normalized === "normal";
  }

  return (
    normalized === "simples nacional" ||
    normalized === "simples e mei" ||
    normalized === "mei" ||
    normalized.includes("simples")
  );
}

/** Sem destaque = sem comprovantes CBS/IBS na listagem mockada. */
export function matchesDestaqueCbsIbsSlug(
  comproCgsIss: string[],
  slug: DestaqueCbsIbsSlug,
): boolean {
  const hasDestaque = comproCgsIss.length > 0;
  return slug === "com-destaque" ? hasDestaque : !hasDestaque;
}

export function buildCadastroFilterUrl(
  cardId: string,
  options: { empresa?: string; periodo?: string } = {},
): string {
  const recorrencia = COMPLIANCE_CARD_TO_RECORRENCIA[cardId];
  if (!recorrencia) return `${CADASTRO_PATH}#${CADASTRO_TABLE_ANCHOR}`;

  const params = new URLSearchParams();
  params.set("recorrencia", recorrencia);

  if (options.empresa) {
    params.set("empresa", companyLabelToSlug(options.empresa));
  }

  if (options.periodo) {
    params.set("periodo", options.periodo);
  } else {
    params.set("periodo", "12-meses");
  }

  return `${CADASTRO_PATH}?${params.toString()}#${CADASTRO_TABLE_ANCHOR}`;
}

export function buildEnquadramentoBarFilterUrl(
  barId: string,
  options: { empresa?: string; periodo?: string; tipoDocumento?: string } = {},
): string {
  const regime = ENQUADRAMENTO_BAR_TO_REGIME[barId];
  const destaque = ENQUADRAMENTO_BAR_TO_DESTAQUE[barId];

  if (!regime && !destaque) {
    return `${CADASTRO_PATH}#${CADASTRO_TABLE_ANCHOR}`;
  }

  const params = new URLSearchParams();

  if (regime) {
    params.set("regimeTributario", regime);
  } else if (destaque) {
    params.set("destaqueCbsIbs", destaque);
  }

  if (options.empresa) {
    params.set("empresa", companyLabelToSlug(options.empresa));
  }

  const periodoSlug = options.periodo ? SUPPLIER_PERIOD_TO_SLUG[options.periodo] : undefined;
  if (periodoSlug) {
    params.set("periodo", periodoSlug);
  }

  const tipoSlug = options.tipoDocumento ? DOCUMENT_TYPE_TO_SLUG[options.tipoDocumento] : undefined;
  if (tipoSlug) {
    params.set("tipoDocumento", tipoSlug);
  }

  return `${CADASTRO_PATH}?${params.toString()}#${CADASTRO_TABLE_ANCHOR}`;
}

export function parseCadastroSearchParams(
  searchParams: URLSearchParams,
): CadastroUrlFilters {
  const filters: CadastroUrlFilters = {};

  const recorrenciaParam = searchParams.get("recorrencia");
  if (recorrenciaParam && recorrenciaParam in RECORRENCIA_SLUG_TO_LABEL) {
    filters.recorrencia = recorrenciaParam as RecorrenciaSlug;
  }

  const empresaParam = searchParams.get("empresa");
  if (empresaParam) {
    filters.empresa = empresaParam;
  }

  const periodoParam = searchParams.get("periodo");
  if (periodoParam) {
    filters.periodo = periodoParam;
  }

  const regimeParam = searchParams.get("regimeTributario");
  if (regimeParam && REGIME_TRIBUTARIO_SLUGS.includes(regimeParam as RegimeTributarioSlug)) {
    filters.regimeTributario = regimeParam as RegimeTributarioSlug;
  }

  const destaqueParam = searchParams.get("destaqueCbsIbs");
  if (destaqueParam && DESTAQUE_CBS_IBS_SLUGS.includes(destaqueParam as DestaqueCbsIbsSlug)) {
    filters.destaqueCbsIbs = destaqueParam as DestaqueCbsIbsSlug;
  }

  const tipoDocumentoParam = searchParams.get("tipoDocumento");
  if (tipoDocumentoParam) {
    filters.tipoDocumento = tipoDocumentoParam;
  }

  const visaoGeralSlugs = new Set<VisaoGeralSlug>();
  for (const param of searchParams.getAll("visaoGeral")) {
    for (const part of param.split(",")) {
      const slug = part.trim();
      if (VISAO_GERAL_SLUGS.includes(slug as VisaoGeralSlug)) {
        visaoGeralSlugs.add(slug as VisaoGeralSlug);
      }
    }
  }
  if (visaoGeralSlugs.size > 0) {
    filters.visaoGeral = Array.from(visaoGeralSlugs);
  }

  return filters;
}

export function setVisaoGeralInSearchParams(
  searchParams: URLSearchParams,
  visaoGeral: VisaoGeralSlug[] | null,
): URLSearchParams {
  const next = new URLSearchParams(searchParams.toString());

  next.delete("visaoGeral");
  if (visaoGeral?.length) {
    for (const slug of visaoGeral) {
      next.append("visaoGeral", slug);
    }
  }

  return next;
}
