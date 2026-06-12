// Lista de aprovadores fictícios
const APPROVERS = [
  { nome: 'Carlos Eduardo Silva', email: 'carlos.silva@qive.com.br' },
  { nome: 'Ana Paula Ferreira', email: 'ana.ferreira@qive.com.br' },
  { nome: 'Roberto Mendes', email: 'roberto.mendes@qive.com.br' },
  { nome: 'Mariana Costa', email: 'mariana.costa@qive.com.br' },
  { nome: 'Fernando Almeida', email: 'fernando.almeida@qive.com.br' },
  { nome: 'Juliana Rodrigues', email: 'juliana.rodrigues@qive.com.br' },
  { nome: 'Ricardo Santos', email: 'ricardo.santos@qive.com.br' },
  { nome: 'Patricia Oliveira', email: 'patricia.oliveira@qive.com.br' },
];

/**
 * Retorna um aprovador aleatório da lista
 */
export function getRandomApprover() {
  const randomIndex = Math.floor(Math.random() * APPROVERS.length);
  return APPROVERS[randomIndex];
}

