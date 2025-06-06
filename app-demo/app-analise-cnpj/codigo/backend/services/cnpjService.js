const axios = require('axios');
const { logger } = require('../utils/logger');

/**
 * Adaptador para a API pública de CNPJ
 */
class CnpjService {
  constructor() {
    this.baseUrl = 'https://publica.cnpj.ws/cnpj';
  }

  /**
   * Consulta os dados de um CNPJ na API pública
   * @param {string} cnpj - CNPJ a ser consultado (apenas números)
   * @returns {Promise<Object>} - Dados do CNPJ consultado
   */
  async consultarCnpj(cnpj) {
    // Remover caracteres não numéricos
    const cnpjNumerico = cnpj.replace(/\D/g, '');
    
    if (cnpjNumerico.length !== 14) {
      logger.error(`CNPJ inválido: ${cnpj}, deve ter 14 dígitos`);
      throw new Error('CNPJ inválido: deve ter 14 dígitos');
    }
    
    try {
      logger.info(`Iniciando consulta do CNPJ: ${cnpj}`);
      
      // Realizar a consulta à API
      const response = await axios.get(`${this.baseUrl}/${cnpjNumerico}`);
      
      logger.info(`Resposta recebida para CNPJ: ${cnpj}, status: ${response.status}`);
      
      return response.data;
    } catch (error) {
      if (error.response) {
        // A requisição foi feita e o servidor respondeu com um código de status diferente de 2xx
        logger.error(`Erro na consulta do CNPJ: ${cnpj}, status: ${error.response.status}, mensagem: ${error.response.data.message || JSON.stringify(error.response.data)}`);
        
        if (error.response.status === 404) {
          throw new Error('CNPJ não encontrado');
        } else if (error.response.status === 429) {
          throw new Error('Limite de requisições excedido. Tente novamente mais tarde.');
        }
        
        throw new Error(`Erro na consulta: ${error.response.data.message || 'Erro no servidor'}`);
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta
        logger.error(`Sem resposta na consulta do CNPJ: ${cnpj}, erro: ${error.message}`);
        throw new Error('Não foi possível conectar ao servidor da API. Verifique sua conexão.');
      } else {
        // Algo aconteceu na configuração da requisição que disparou um erro
        logger.error(`Erro na configuração da consulta do CNPJ: ${cnpj}, erro: ${error.message}`);
        throw new Error(`Erro ao preparar a consulta: ${error.message}`);
      }
    }
  }
}

module.exports = new CnpjService();