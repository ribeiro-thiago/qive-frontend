export const DOCUMENTO_TABLE_HEAD_BG_CLASS = "bg-[#F5F5F6]";

/** Padding alinhado ao DataTable comoditizado (NF-e). */
export const DOCUMENTO_TABLE_HEAD_CELL_CLASS =
  "bg-[#F5F5F6] px-3 py-2 text-[rgba(4,14,35,0.64)]";

export const DOCUMENTO_TABLE_BODY_CELL_CLASS = "px-3 py-3";

export const DOCUMENTO_TABLE_CHECKBOX_HEAD_CELL_CLASS =
  "bg-[#F5F5F6] w-10 pl-3 pr-2 py-2 text-center";

export const DOCUMENTO_TABLE_CHECKBOX_BODY_CELL_CLASS =
  "relative pl-3 pr-2 py-3 text-center align-middle";

export const DOCUMENTO_TABLE_FILLER_HEAD_CELL_CLASS = "bg-[#F5F5F6] p-0";

export const DOCUMENTO_TABLE_FILLER_BODY_CELL_CLASS = "p-0";

/**
 * Larguras mínimas das colunas (table-fixed).
 * Coluna filler (sem conteúdo) absorve o espaço extra e mantém o ritmo entre as demais.
 */
export const DOCUMENTO_TABLE_COLUMN_WIDTH = {
  checkbox: 40,
  tipoDoc: 78,
  numero: 88,
  dataEmissao: 104,
  cnpj: 140,
  nomeEmissor: 196,
  cnpjDestinatario: 140,
  comentario: 48,
  valor: 96,
  etapaErp: 132,
  situacaoDfe: 124,
  aprovadores: 132,
  aprovNecessarias: 84,
} as const;

type DocumentoTableLayoutOptions = {
  showTipoDocumento: boolean;
  showComentario: boolean;
};

export function getDocumentoTableMinWidth({
  showTipoDocumento,
  showComentario,
}: DocumentoTableLayoutOptions): number {
  const columns = DOCUMENTO_TABLE_COLUMN_WIDTH;

  return (
    columns.checkbox +
    columns.numero +
    columns.dataEmissao +
    columns.cnpj +
    columns.nomeEmissor +
    columns.cnpjDestinatario +
    columns.valor +
    columns.etapaErp +
    columns.situacaoDfe +
    columns.aprovadores +
    columns.aprovNecessarias +
    (showTipoDocumento ? columns.tipoDoc : 0) +
    (showComentario ? columns.comentario : 0)
  );
}
