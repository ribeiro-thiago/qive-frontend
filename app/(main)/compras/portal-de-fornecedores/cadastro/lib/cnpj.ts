export function normalizeCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, "");
}

export function formatCnpjInput(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 14);
  return numbers
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatCpfInput(numbers: string): string {
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  }
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
}

export function formatCnpjOrCpfInput(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 14);

  if (numbers.length <= 11) {
    return formatCpfInput(numbers);
  }

  return formatCnpjInput(numbers);
}

export function formatCnpjOrCpf(value: string): string {
  const numbers = normalizeCnpj(value);
  if (numbers.length === 11) {
    return numbers.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  }
  if (numbers.length === 14) {
    return formatCnpjInput(numbers);
  }
  return formatCnpjOrCpfInput(value);
}

export function isCnpjComplete(cnpj: string): boolean {
  return normalizeCnpj(cnpj).length === 14;
}

function calcCnpjDigit(digits: number[], weights: number[]): number {
  const sum = digits.reduce((acc, digit, index) => acc + digit * weights[index], 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCpf(cpf: string): boolean {
  const digits = normalizeCnpj(cpf).split("").map(Number);
  if (digits.length !== 11 || digits.some(Number.isNaN)) return false;
  if (digits.every((digit) => digit === digits[0])) return false;

  const calcDigit = (slice: number[], factor: number) => {
    const sum = slice.reduce((acc, digit, index) => acc + digit * (factor - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const firstDigit = calcDigit(digits.slice(0, 9), 10);
  if (digits[9] !== firstDigit) return false;

  const secondDigit = calcDigit(digits.slice(0, 10), 11);
  return digits[10] === secondDigit;
}

export function isValidCnpj(cnpj: string): boolean {
  const digits = normalizeCnpj(cnpj).split("").map(Number);
  if (digits.length !== 14 || digits.some(Number.isNaN)) return false;
  if (digits.every((d) => d === digits[0])) return false;

  const firstCheck = calcCnpjDigit(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (digits[12] !== firstCheck) return false;

  const secondCheck = calcCnpjDigit(digits.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return digits[13] === secondCheck;
}

/** Placeholders usados em protótipos/mocks (sem dígitos verificadores válidos). */
export function isFictitiousTestCnpj(cnpj: string): boolean {
  const normalized = normalizeCnpj(cnpj);
  if (normalized.length !== 14) return false;
  // Padrão comum na tabela de demonstração: 00.000.000/0001-XX
  return /^000000000001\d{2}$/.test(normalized);
}

export function isValidCnpjOrCpf(value: string): boolean {
  const normalized = normalizeCnpj(value);
  if (normalized.length === 11) return isValidCpf(value);
  if (normalized.length === 14) return isValidCnpj(value);
  return false;
}

/** Aceita CNPJ real ou fictício completo (fluxo mock de cadastro). */
export function isAcceptableCnpj(cnpj: string): boolean {
  if (!isCnpjComplete(cnpj)) return false;
  return isValidCnpj(cnpj) || isFictitiousTestCnpj(cnpj);
}

export function cnpjMatches(a: string, b: string): boolean {
  return normalizeCnpj(a) === normalizeCnpj(b);
}
