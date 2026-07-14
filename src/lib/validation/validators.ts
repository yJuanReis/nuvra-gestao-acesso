/**
 * Funções de validação para diferentes tipos de campos
 */

export const validators = {
  /**
   * Valida CPF usando algoritmo de dígitos verificadores
   */
  cpf: (value: string): boolean => {
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais (caso inválido)
    if (/^(\d)\1{10}$/.test(cleanValue)) return false;

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

    return digit === parseInt(cleanValue.charAt(9)) && secondDigit === parseInt(cleanValue.charAt(10));
  },

  /**
   * Valida RG (formato genérico)
   * Considera válido se tiver entre 8 e 15 dígitos
   */
  rg: (value: string): boolean => {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue.length >= 8 && cleanValue.length <= 15;
  },

  /**
   * Valida telefone
   * Considera válido se tiver entre 10 e 11 dígitos
   */
  phone: (value: string): boolean => {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue.length >= 10 && cleanValue.length <= 11;
  },

  /**
   * Valida placa de veículo
   */
  placa: (value: string): boolean => {
    const cleanValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Formato antigo: 3 letras + 4 números (ABC1234)
    const antigaRegex = /^[A-Z]{3}\d{4}$/;
    
    // Formato Mercosul: 3 letras + 1 número + 1 letra + 2 números (ABC1D23)
    const mercosulRegex = /^[A-Z]{3}\d[A-Z]\d{2}$/;

    return antigaRegex.test(cleanValue) || mercosulRegex.test(cleanValue);
  },

  /**
   * Valida observação
   * Rejeita strings vazias, apenas espaços em branco, apenas símbolos ou caracteres inválidos
   * Aceita apenas se contiver pelo menos 1 caractere alfanumérico real (letras ou números)
   */
  observacao: (value: string): boolean => {
    if (!value || typeof value !== 'string') return false;
    
    // Remove espaços em branco no início e fim
    const trimmed = value.trim();
    
    // Verifica se está vazio após remover espaços
    if (trimmed.length === 0) return false;
    
    // Verifica se contém pelo menos 1 caractere alfanumérico
    // Isso rejeita strings que contêm apenas símbolos, pontuação, caracteres especiais ou apenas espaços internos
    return /[a-zA-Z0-9]/.test(trimmed);
  }
};