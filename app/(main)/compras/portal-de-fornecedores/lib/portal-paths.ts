const PORTAL_BASE = "/compras/portal-de-fornecedores";

const PATH_SEGMENT_TO_PAGE_TITLE: Record<string, string> = {
  documentos: "Documentos",
  nfe: "NF-e",
  nfse: "NFS-e",
  cte: "CT-e",
  "cte-os": "CTE-OS",
  cadastro: "Cadastro",
  "painel-de-transicao-tributaria": "Radar da Reforma Tributária",
  indicadores: "Indicadores",
  "historico-de-atividades": "Registro de Atividades",
};

const PATH_SEGMENT_TO_TIPO_DOCUMENTO: Record<string, string> = {
  nfe: "NF-e",
  nfse: "NFS-e",
  cte: "CT-e",
  "cte-os": "CTE-OS",
};

function getPortalSectionFromPathname(pathname: string): string | undefined {
  const segments = pathname.split("/").filter(Boolean);
  const portalIndex = segments.indexOf("portal-de-fornecedores");
  return portalIndex >= 0 ? segments[portalIndex + 1] : undefined;
}

export function getPortalPageTitleFromPathname(pathname: string): string {
  const section = getPortalSectionFromPathname(pathname);
  if (section && PATH_SEGMENT_TO_PAGE_TITLE[section]) {
    return PATH_SEGMENT_TO_PAGE_TITLE[section];
  }
  return "Documentos";
}

export function getPortalTipoDocumentoFromPathname(pathname: string): string | undefined {
  const section = getPortalSectionFromPathname(pathname);
  if (section && PATH_SEGMENT_TO_TIPO_DOCUMENTO[section]) {
    return PATH_SEGMENT_TO_TIPO_DOCUMENTO[section];
  }
  return undefined;
}

export const PORTAL_DOCUMENTOS_PATH = `${PORTAL_BASE}/documentos`;
export const PORTAL_NFE_PATH = `${PORTAL_BASE}/nfe`;
export const PORTAL_NFSE_PATH = `${PORTAL_BASE}/nfse`;
export const PORTAL_CTE_PATH = `${PORTAL_BASE}/cte`;
export const PORTAL_CTE_OS_PATH = `${PORTAL_BASE}/cte-os`;
export const PORTAL_CADASTRO_PATH = `${PORTAL_BASE}/cadastro`;
export const PORTAL_INDICADORES_PATH = `${PORTAL_BASE}/indicadores`;

export type PortalImportSegment =
  | "documentos"
  | "nfe"
  | "nfse"
  | "cte"
  | "cte-os"
  | "cadastro"
  | "indicadores";

const SEGMENT_TO_RETURN_PATH: Record<PortalImportSegment, string> = {
  documentos: PORTAL_DOCUMENTOS_PATH,
  nfe: PORTAL_NFE_PATH,
  nfse: PORTAL_NFSE_PATH,
  cte: PORTAL_CTE_PATH,
  "cte-os": PORTAL_CTE_OS_PATH,
  cadastro: PORTAL_CADASTRO_PATH,
  indicadores: PORTAL_INDICADORES_PATH,
};

export function portalImportPath(segment: PortalImportSegment): string {
  return `${PORTAL_BASE}/${segment}/importar`;
}

export function portalImportReturnPath(segment: PortalImportSegment): string {
  return SEGMENT_TO_RETURN_PATH[segment];
}

/** Mapeia a aba interna do portal para a rota de importação do submenu correspondente. */
export function portalImportPathFromTab(
  activeTab: string,
  portalSegment?: PortalImportSegment
): string {
  if (portalSegment === "nfe") return portalImportPath("nfe");
  if (portalSegment === "nfse") return portalImportPath("nfse");
  if (portalSegment === "cte") return portalImportPath("cte");
  if (portalSegment === "cte-os") return portalImportPath("cte-os");
  if (activeTab === "lista") return portalImportPath("cadastro");
  if (activeTab === "dados-analiticos") return portalImportPath("indicadores");
  return portalImportPath("documentos");
}
