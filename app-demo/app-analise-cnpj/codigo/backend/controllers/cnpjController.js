const cnpjService = require('../services/cnpjService');
const analiseRiscoService = require('../services/analiseRiscoService');
const cacheService = require('../services/cacheService');
const { validarCnpj, formatarCnpj } = require('../utils/validadorCnpj');
const { logger } = require('../utils/logger');

/**
 * Controlador para operações relacionadas a CNPJ
 */
class CnpjController {
  /**
   * Consulta um CNPJ e retorna análise de risco
   * @param {Object} req - Requisição HTTP
   * @param {Object} res - Resposta HTTP
   */
  async consultarCnpj(req, res) {
    try {
      const { cnpj } = req.body;
      
      if (!cnpj) {
        return res.status(400).json({ erro: 'CNPJ não informado' });
      }
      
      // Remover caracteres não numéricos
      const cnpjNumerico = cnpj.replace(/\D/g, '');
      
      // Validar CNPJ
      if (!validarCnpj(cnpjNumerico)) {
        logger.error(`Erro na validação do CNPJ: ${cnpj}, CNPJ inválido`);
        return res.status(400).json({ erro: 'CNPJ inválido' });
      }
      
      // Verificar cache
      const consultaCache = await cacheService.verificarCache(cnpjNumerico);
      
      if (consultaCache) {
        return res.status(200).json({
          ...consultaCache,
          fromCache: true
        });
      }
      
      // Consultar API
      const dadosCnpj = await cnpjService.consultarCnpj(cnpjNumerico);
      
      // Extrair informações relevantes
      const dadosProcessados = {
        cnpj: cnpjNumerico,
        razao_social: dadosCnpj.razao_social,
        situacao_cadastral: dadosCnpj.estabelecimento?.situacao_cadastral,
        data_abertura: dadosCnpj.estabelecimento?.data_inicio_atividade,
        cnae_principal: dadosCnpj.estabelecimento?.atividade_principal?.id, // Corrected path
        descricao_cnae: dadosCnpj.estabelecimento?.atividade_principal?.descricao, // Corrected path
        porte_empresa: dadosCnpj.porte?.descricao,
        municipio: dadosCnpj.estabelecimento?.cidade?.nome,
        uf: dadosCnpj.estabelecimento?.estado?.sigla
      };
      
      // Analisar risco
      // Pass the raw dadosCnpj so analiseRiscoService can use its corrected paths
      const analiseRisco = analiseRiscoService.analisarRisco(dadosCnpj); 
      
      // Montar resposta
      const resultado = {
        ...dadosProcessados,
        cnpj_formatado: formatarCnpj(cnpjNumerico),
        score: analiseRisco.score,
        classificacao_risco: analiseRisco.classificacao,
        criterios: analiseRisco.criteriosAplicados,
        dados_completos: dadosCnpj,
        fromCache: false
      };
      
      // Salvar no cache
      await cacheService.salvarCache({
        ...dadosProcessados,
        score: analiseRisco.score,
        classificacao_risco: analiseRisco.classificacao,
        dados_completos: dadosCnpj,
        criterios: analiseRisco.criteriosAplicados
      });
      
      return res.status(200).json(resultado);
    } catch (error) {
      logger.error(`Erro na consulta de CNPJ: ${error.message}`);
      
      // Mensagens amigáveis para erros conhecidos
      if (error.message === 'CNPJ não encontrado') {
        return res.status(404).json({ erro: 'CNPJ não encontrado na base de dados' });
      } else if (error.message.includes('Limite de requisições')) {
        return res.status(429).json({ erro: error.message });
      }
      
      return res.status(500).json({ erro: 'Erro ao processar a consulta', detalhes: error.message });
    }
  }
}

module.exports = new CnpjController();
