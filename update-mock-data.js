const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/financeiro/gestao-de-pagamentos/data/mock-data.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Regex para encontrar linhas com lancadoEm que ainda não têm ordemCompra/centroCusto
const regex = /(lancadoEm: '(?:conferir|pagar|bloqueados|liquidados|cancelados)',)\n(?!\s+ordemCompra:)/g;

// Substituir adicionando as linhas de ordemCompra e centroCusto
content = content.replace(regex, '$1\n    ordemCompra: generateOrdemCompra(), centroCusto: generateCentroCusto(),\n');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Mock data atualizado com sucesso!');

