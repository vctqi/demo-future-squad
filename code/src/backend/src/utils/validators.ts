/**
 * Validates a CNPJ (Brazilian company identifier)
 * @param cnpj CNPJ to validate
 * @returns True if valid, false otherwise
 */
export function validateCNPJ(cnpj: string): boolean {
  // Remove non-numeric characters
  cnpj = cnpj.replace(/[^\d]/g, '');

  // CNPJ must have 14 digits
  if (cnpj.length !== 14) return false;

  // Check for known invalid CNPJs
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  // Calculate first verification digit
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let digit = 11 - (sum % 11);
  const firstDigit = digit < 10 ? digit : 0;

  // Calculate second verification digit
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  digit = 11 - (sum % 11);
  const secondDigit = digit < 10 ? digit : 0;

  // Check verification digits
  return parseInt(cnpj[12]) === firstDigit && parseInt(cnpj[13]) === secondDigit;
}

/**
 * Validates a CPF (Brazilian individual identifier)
 * @param cpf CPF to validate
 * @returns True if valid, false otherwise
 */
export function validateCPF(cpf: string): boolean {
  // Remove non-numeric characters
  cpf = cpf.replace(/[^\d]/g, '');

  // CPF must have 11 digits
  if (cpf.length !== 11) return false;

  // Check for known invalid CPFs
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Calculate first verification digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  const firstDigit = digit < 10 ? digit : 0;

  // Calculate second verification digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i);
  }
  digit = 11 - (sum % 11);
  const secondDigit = digit < 10 ? digit : 0;

  // Check verification digits
  return parseInt(cpf[9]) === firstDigit && parseInt(cpf[10]) === secondDigit;
}

/**
 * Validates a Brazilian CEP (postal code)
 * @param cep CEP to validate
 * @returns True if valid, false otherwise
 */
export function validateCEP(cep: string): boolean {
  // Remove non-numeric characters
  cep = cep.replace(/[^\d]/g, '');

  // CEP must have 8 digits
  if (cep.length !== 8) return false;

  // CEP cannot be all zeros
  if (/^0{8}$/.test(cep)) return false;

  return true;
}

/**
 * Validates a phone number
 * @param phone Phone number to validate
 * @returns True if valid, false otherwise
 */
export function validatePhone(phone: string): boolean {
  // Remove non-numeric characters
  phone = phone.replace(/[^\d]/g, '');

  // Phone must have at least 10 digits
  if (phone.length < 10) return false;

  // Phone cannot be all zeros
  if (/^0+$/.test(phone)) return false;

  return true;
}

/**
 * Validates an email address
 * @param email Email to validate
 * @returns True if valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a URL
 * @param url URL to validate
 * @returns True if valid, false otherwise
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}