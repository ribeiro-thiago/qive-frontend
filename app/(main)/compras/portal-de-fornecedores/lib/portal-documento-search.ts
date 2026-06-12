import type { GroupedSearchFieldOption } from "@/components/shared/GroupedSearchField";
import type { PortalImportSegment } from "./portal-paths";

export type PortalDocumentoSearchField = "conteudo" | "empresa" | "numero";

const SEARCH_OPTIONS_BY_SEGMENT: Partial<
  Record<Exclude<PortalImportSegment, "documentos" | "cadastro" | "indicadores">, GroupedSearchFieldOption[]>
> = {
  nfse: [
    {
      value: "conteudo",
      label: "Conteúdo da NFS-e",
      placeholder: "Busque por qualquer informação dentro da NFS-e",
    },
    {
      value: "empresa",
      label: "Nome/CNPJ da Empresa",
      placeholder: "Busque por nome ou CNPJ da empresa",
    },
    {
      value: "numero",
      label: "Número da NFS-e",
      placeholder: "Busque por número da NFS-e",
    },
  ],
  nfe: [
    {
      value: "conteudo",
      label: "Conteúdo da NF-e",
      placeholder: "Busque por qualquer informação dentro da NF-e",
    },
    {
      value: "empresa",
      label: "Nome/CNPJ da Empresa",
      placeholder: "Busque por nome ou CNPJ da empresa",
    },
    {
      value: "numero",
      label: "Número",
      placeholder: "Busque por número da NF-e",
    },
  ],
  cte: [
    {
      value: "conteudo",
      label: "Conteúdo do CT-e",
      placeholder: "Busque por qualquer informação dentro do CT-e",
    },
    {
      value: "empresa",
      label: "Nome/CNPJ da Empresa",
      placeholder: "Busque por nome ou CNPJ da empresa",
    },
    {
      value: "numero",
      label: "Número do CT-e",
      placeholder: "Busque por número do CT-e",
    },
  ],
  "cte-os": [
    {
      value: "conteudo",
      label: "Conteúdo do CTE-OS",
      placeholder: "Busque por qualquer informação dentro do CTE-OS",
    },
    {
      value: "empresa",
      label: "Nome/CNPJ da Empresa",
      placeholder: "Busque por nome ou CNPJ da empresa",
    },
    {
      value: "numero",
      label: "Número do CTE-OS",
      placeholder: "Busque por número do CTE-OS",
    },
  ],
};

export function getPortalDocumentoSearchOptions(
  segment?: PortalImportSegment,
): GroupedSearchFieldOption[] | undefined {
  if (!segment || segment === "documentos" || segment === "cadastro" || segment === "indicadores") {
    return undefined;
  }
  return SEARCH_OPTIONS_BY_SEGMENT[segment];
}
