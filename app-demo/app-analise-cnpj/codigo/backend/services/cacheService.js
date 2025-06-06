const consultaRepository = require('../database/consultaRepository');
const { logger } = require('../utils/logger');

/**
 * Serviço para gerenciamento de cache de consultas
 */
class CacheService {
  /**
   * Verifica se há uma consulta recente para o CNPJ informado
   * @param {string} cnpj - CNPJ a ser verificado
   * @returns {Promise<Object|null>} - Dados da consulta em cache ou null se não houver
   */
  async verificarCache(cnpj) {
    try {
      logger.info(`Consultando cache para CNPJ: ${cnpj}`);
      
      // Buscar no repositório
      const consultaCache = await consultaRepository.buscarConsultaRecente(cnpj);
      
      return consultaCache;
    } catch (error) {
      logger.error(`Erro ao verificar cache: ${error.message}`);
      return null; // Em caso de erro, prosseguir sem cache
    }
  }

  /**
   * Salva uma consulta no cache
   * @param {Object} dadosConsulta - Dados da consulta a serem salvos
   * @returns {Promise<number>} - ID da consulta salva
   */
  async salvarCache(dadosConsulta) {
    try {
      return await consultaRepository.salvarConsulta(dadosConsulta);
    } catch (error) {
      logger.error(`Erro ao salvar cache: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new CacheService();