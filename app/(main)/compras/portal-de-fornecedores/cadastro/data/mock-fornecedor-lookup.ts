import {
  cnpjMatches,
  formatCnpjInput,
  isFictitiousTestCnpj,
  normalizeCnpj,
} from "../lib/cnpj";
import type { FornecedorCadastroLookup } from "../types";

/** CNPJ que simula falha na busca/cadastro */
export const CNPJ_SIMULAR_ERRO = "88.888.800/0188-55";

const REGISTRY: FornecedorCadastroLookup[] = [
  {
    cnpj: "03.160.081/0001-85",
    razaoSocial: "Empresa Exemplo LTDA",
    nomeFantasia: "Empresa Exemplo",
    dataAbertura: "15/03/2010",
    matrizFilial: "Matriz",
    situacaoCadastral: "Ativo",
    naturezaJuridica: "Sociedade Empresária Limitada",
    regimeTributario: "Simples Nacional",
    localizacao: "SP | São Paulo",
    telefone: "(11) 3500-1000",
    recorrencia: "Média",
  },
  {
    cnpj: "04.252.011/0001-10",
    razaoSocial: "Empresa Exemplo LTDA",
    nomeFantasia: "Empresa Exemplo",
    dataAbertura: "01/06/2015",
    matrizFilial: "Matriz",
    situacaoCadastral: "Ativo",
    naturezaJuridica: "Sociedade Empresária Limitada",
    regimeTributario: "Simples Nacional",
    localizacao: "SP | São Paulo",
    telefone: "(11) 4000-2000",
    recorrencia: "Alta",
  },
  {
    cnpj: "11.444.777/0001-61",
    razaoSocial: "Empresa Exemplo LTDA",
    nomeFantasia: "Empresa Exemplo",
    dataAbertura: "22/08/2018",
    matrizFilial: "Filial",
    situacaoCadastral: "Ativo",
    naturezaJuridica: "Sociedade Empresária Limitada",
    regimeTributario: "Normal",
    localizacao: "RJ | Rio de Janeiro",
    telefone: "(21) 3000-9000",
    recorrencia: "Baixa",
  },
];

export type FornecedorLookupResult =
  | { status: "found"; data: FornecedorCadastroLookup }
  | { status: "not_found" }
  | { status: "error" };

const LOOKUP_DELAY_MS = 1200;

function buildFictitiousLookup(cnpj: string): FornecedorCadastroLookup {
  const formatted = formatCnpjInput(normalizeCnpj(cnpj));
  return {
    cnpj: formatted,
    razaoSocial: "Empresa Exemplo LTDA",
    nomeFantasia: "Empresa Exemplo",
    dataAbertura: "01/01/2020",
    matrizFilial: "Matriz",
    situacaoCadastral: "Ativo",
    naturezaJuridica: "Sociedade Empresária Limitada",
    regimeTributario: "Simples Nacional",
    localizacao: "RJ | Rio de Janeiro",
    telefone: "(00) 00000-0000",
    recorrencia: "Média",
  };
}

export function lookupFornecedorByCnpj(cnpj: string): Promise<FornecedorLookupResult> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const normalized = normalizeCnpj(cnpj);

      if (normalized === normalizeCnpj(CNPJ_SIMULAR_ERRO)) {
        resolve({ status: "error" });
        return;
      }

      const found = REGISTRY.find((item) => cnpjMatches(item.cnpj, cnpj));
      if (found) {
        resolve({
          status: "found",
          data: { ...found, cnpj: formatCnpjInput(normalized) },
        });
        return;
      }

      if (isFictitiousTestCnpj(cnpj)) {
        resolve({ status: "found", data: buildFictitiousLookup(cnpj) });
        return;
      }

      resolve({ status: "not_found" });
    }, LOOKUP_DELAY_MS);
  });
}
