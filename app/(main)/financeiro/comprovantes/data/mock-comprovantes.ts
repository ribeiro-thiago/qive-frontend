export type ComprovanteOrigem = "Envio manual" | "Captura automática";
export type ComprovanteStatus = "Associado" | "Não associado";

export type ComprovanteRow = {
  id: string;
  dataPgto: string;
  valorTotal: number;
  nomeBeneficiario: string;
  cnpjBeneficiario: string;
  origem: ComprovanteOrigem;
  status: ComprovanteStatus;
  cnpjPagador: string;
  /** Nome exibido no filtro avançado "Pagador" */
  nomePagador: string;
  banco: string;
};

export const initialComprovantesRows: ComprovanteRow[] = [
  {
    id: "cmp-1",
    dataPgto: "12/09/2025",
    valorTotal: 725.72,
    nomeBeneficiario: "Sotreq Fidc Responsabilidade",
    cnpjBeneficiario: "52.100.879/0001-47",
    origem: "Envio manual",
    status: "Associado",
    cnpjPagador: "03.160.081/0001-85",
    nomePagador: "Pagadora Alpha SA",
    banco: "Itaú",
  },
  {
    id: "cmp-2",
    dataPgto: "05/08/2025",
    valorTotal: 12890.0,
    nomeBeneficiario: "Distribuidora Alfa LTDA",
    cnpjBeneficiario: "45.987.321/0001-09",
    origem: "Captura automática",
    status: "Não associado",
    cnpjPagador: "12.345.678/0001-90",
    nomePagador: "Qive Tecnologia LTDA - Matriz [SP]",
    banco: "Santander",
  },
  {
    id: "cmp-3",
    dataPgto: "22/07/2025",
    valorTotal: 310.5,
    nomeBeneficiario: "Serviços Beta ME",
    cnpjBeneficiario: "11.222.333/0001-44",
    origem: "Envio manual",
    status: "Não associado",
    cnpjPagador: "12.345.678/0002-71",
    nomePagador: "Qive Tecnologia LTDA - Filial 1 [SP]",
    banco: "Banco do Brasil",
  },
  {
    id: "cmp-4",
    dataPgto: "01/09/2025",
    valorTotal: 4520.0,
    nomeBeneficiario: "Logística Gama SA",
    cnpjBeneficiario: "33.444.555/0001-66",
    origem: "Captura automática",
    status: "Associado",
    cnpjPagador: "12.345.678/0001-90",
    nomePagador: "Qive Tecnologia LTDA - Matriz [SP]",
    banco: "Inter",
  },
];
