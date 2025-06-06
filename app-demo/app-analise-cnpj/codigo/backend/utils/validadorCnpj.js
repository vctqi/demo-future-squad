/**
 * Valida um CNPJ
 * @param {string} cnpj - CNPJ a ser validado
 * @returns {boolean} - Verdadeiro se o CNPJ for válido, falso caso contrário
 */
const validarCnpj = (cnpj) => {
  // Remover caracteres não numéricos
  const cnpjLimpo = cnpj.replace(/\D/g, '');
  
  // Verificar se tem 14 dígitos
  if (cnpjLimpo.length !== 14) {
    return false;
  }
  
  // Verificar se todos os dígitos são iguais (caso inválido)
  if (/^(\d)\1+$/.test(cnpjLimpo)) {
    return false;
  }
  
  // Algoritmo de validação do dígito verificador
  let tamanho = cnpjLimpo.length - 2;
  let numeros = cnpjLimpo.substring(0, tamanho);
  const digitos = cnpjLimpo.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  // Validação do primeiro dígito
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  
  if (resultado != digitos.charAt(0)) {
    return false;
  }
  
  // Validação do segundo dígito
  tamanho = tamanho + 1;
  numeros = cnpjLimpo.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  
  if (resultado != digitos.charAt(1)) {
    return false;
  }
  
  return true;
};

/**
 * Formata um CNPJ para exibição (XX.XXX.XXX/YYYY-ZZ)
 * @param {string} cnpj - CNPJ a ser formatado
 * @returns {string} - CNPJ formatado
 */
const formatarCnpj = (cnpj) => {
  const cnpjLimpo = cnpj.replace(/\D/g, '');
  
  if (cnpjLimpo.length !== 14) {
    return cnpj;
  }
  
  return cnpjLimpo.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
};

module.exports = {
  validarCnpj,
  formatarCnpj
};