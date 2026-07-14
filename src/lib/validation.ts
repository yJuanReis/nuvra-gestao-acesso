/**
 * Funções de validação para documentos e formatos brasileiros
 */

/**
 * Valida e formata CPF
 * @param value Valor a ser validado (apenas números)
 * @returns Objeto com validade e valor formatado
 */
export function validateCPF(value: string): { isValid: boolean; formatted: string } {
  // Remove todos os caracteres não numéricos
  const cleanValue = value.replace(/\D/g, '');
  
  if (cleanValue.length !== 11) {
    return { isValid: false, formatted: value };
  }

  // Verifica se todos os dígitos são iguais (caso inválido)
  if (/^(\d)\1{10}$/.test(cleanValue)) {
    return { isValid: false, formatted: value };
  }

  // Calcula o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanValue.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  const digit = remainder > 9 ? 0 : remainder;

  // Calcula o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanValue.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  const secondDigit = remainder > 9 ? 0 : remainder;

  const isValid = digit === parseInt(cleanValue.charAt(9)) && secondDigit === parseInt(cleanValue.charAt(10));
  
  // Formata para exibição: 123.456.789-09
  const formatted = cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

  return { isValid, formatted };
}

/**
 * Valida RG (formato genérico)
 * @param value Valor a ser validado
 * @returns Objeto com validade e valor formatado
 */
export function validateRG(value: string): { isValid: boolean; formatted: string } {
  // Remove caracteres especiais, mantendo apenas letras, números e espaços
  const cleanValue = value.replace(/[^a-zA-Z0-9\s]/g, '');
  
  if (cleanValue.length < 4) {
    return { isValid: false, formatted: value };
  }

  // Formatação simples: adiciona pontos a cada 3 dígitos para números
  const numericPart = cleanValue.replace(/\D/g, '');
  let formatted = value;

  if (numericPart.length >= 4) {
    // Formato: 12.345.678-9 (exemplo SP)
    formatted = numericPart.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
  }

  return { isValid: true, formatted };
}

/**
 * Valida e formata placas de veículos brasileiros
 * @param value Valor a ser validado
 * @returns Objeto com validade, tipo e valor formatado
 */
export function validatePlaca(value: string): { isValid: boolean; type: 'antiga' | 'mercosul' | null; formatted: string } {
  // Remove espaços e converte para maiúsculas
  const cleanValue = value.toUpperCase().replace(/\s/g, '');
  
  // Formato antigo: 3 letras + hífen + 4 números (ABC-1234)
  const antigaRegex = /^[A-Z]{3}-\d{4}$/;
  
  // Formato Mercosul: 3 letras + 1 número + 1 letra + 2 números (ABC-1D23)
  const mercosulRegex = /^[A-Z]{3}-\d[A-Z]\d{2}$/;

  if (antigaRegex.test(cleanValue)) {
    return { 
      isValid: true, 
      type: 'antiga', 
      formatted: cleanValue 
    };
  }
  
  if (mercosulRegex.test(cleanValue)) {
    return { 
      isValid: true, 
      type: 'mercosul', 
      formatted: cleanValue 
    };
  }

  // Tenta formatar se estiver incompleto
  const letters = cleanValue.replace(/[^A-Z]/g, '');
  const numbers = cleanValue.replace(/[^0-9]/g, '');
  const hyphen = cleanValue.includes('-') ? '-' : '';

  if (letters.length >= 3) {
    const formattedLetters = letters.substring(0, 3);
    const remaining = cleanValue.substring(3).replace(/[^A-Z0-9-]/g, '');
    
    // Se tem hífen, tenta formatar como placa
    if (hyphen) {
      const afterHyphen = cleanValue.split('-')[1] || '';
      if (afterHyphen.length >= 4) {
        // Formato antigo
        const formattedNumbers = afterHyphen.substring(0, 4);
        return {
          isValid: false,
          type: 'antiga',
          formatted: `${formattedLetters}-${formattedNumbers}`
        };
      } else if (afterHyphen.length >= 3) {
        // Formato Mercosul
        const formatted = afterHyphen.substring(0, 3);
        return {
          isValid: false,
          type: 'mercosul',
          formatted: `${formattedLetters}-${formatted}`
        };
      }
    }
  }

  return { isValid: false, type: null, formatted: cleanValue };
}

/**
 * Converte texto para maiúsculas e remove espaços extras
 * @param value Texto a ser processado
 * @returns Texto em maiúsculas com espaços normalizados
 */
export function formatName(value: string): string {
  return value.toUpperCase().replace(/\s+/g, ' ').trim();
}

/**
 * Formata número de telefone para exibição
 * @param value Valor a ser formatado (apenas números)
 * @returns Valor formatado para exibição
 */
export function formatPhone(value: string): string {
  const cleanValue = value.replace(/\D/g, '');
  
  if (cleanValue.length <= 2) {
    return cleanValue;
  } else if (cleanValue.length <= 6) {
    return cleanValue.replace(/(\d{2})(\d+)/, '($1) $2');
  } else if (cleanValue.length <= 10) {
    return cleanValue.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
  } else {
    return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
}

/**
 * Formata placa para exibição com hífen
 * @param value Valor a ser formatado (apenas letras e números)
 * @returns Valor formatado para exibição com hífen
 */
export function formatPlaca(value: string): string {
  const cleanValue = value.replace(/[^a-zA-Z0-9]/g, '');
  
  if (cleanValue.length >= 7) {
    // Formato antigo: ABC-1234
    return cleanValue.replace(/(\w{3})(\w{4})/, '$1-$2');
  } else if (cleanValue.length >= 6) {
    // Formato Mercosul: ABC-1D23
    return cleanValue.replace(/(\w{3})(\w{3})/, '$1-$2');
  }
  
  return cleanValue;
}

// Exporta o objeto validators para compatibilidade
export { validators } from './validation/validators';
// Exporta o objeto formatters para compatibilidade
export { formatters } from './validation/formatters';
