const { logger } = require('../utils/logger');

/**
 * Serviço para análise de risco com base nos dados do CNPJ
 */
class AnaliseRiscoService {
  /**
   * Calcula o score de risco com base nos dados do CNPJ
   * @param {Object} dadosCnpj - Dados obtidos da API de CNPJ
   * @returns {Object} - Resultado da análise (score, classificação, critérios aplicados)
   */
  analisarRisco(dadosCnpj) {
    const cnpjParaLog = dadosCnpj.estabelecimento?.cnpj || dadosCnpj.cnpj_raiz || 'N/A';
    logger.debug(`Iniciando cálculo de score para CNPJ: ${cnpjParaLog}`);
    
    let score = 0;
    const criteriosAplicados = [];
    
    // Critério 1: Situação cadastral
    const situacaoCadastral = dadosCnpj.estabelecimento?.situacao_cadastral || '';
    if (situacaoCadastral.toUpperCase() === 'ATIVA') {
      score += 10;
      criteriosAplicados.push({
        criterio: 'Empresa ativa',
        pontuacao: 10
      });
      logger.debug(`Critério aplicado: Empresa ativa, pontuação: +10`);
    } else if (['INAPTA', 'SUSPENSA', 'BAIXADA'].includes(situacaoCadastral.toUpperCase())) {
      score -= 20;
      criteriosAplicados.push({
        criterio: 'Empresa inativa/suspensa',
        pontuacao: -20
      });
      logger.debug(`Critério aplicado: Empresa inativa/suspensa, pontuação: -20`);
    }
    
    // Critério 2: Tempo de operação
    const dataAbertura = dadosCnpj.estabelecimento?.data_inicio_atividade 
      ? new Date(dadosCnpj.estabelecimento.data_inicio_atividade) 
      : null;
    
    if (dataAbertura) {
      const hoje = new Date();
      const diferencaEmMilissegundos = hoje - dataAbertura;
      const diferencaEmAnos = diferencaEmMilissegundos / (1000 * 60 * 60 * 24 * 365.25);
      
      if (diferencaEmAnos > 3) {
        score += 10;
        criteriosAplicados.push({
          criterio: 'Mais de 3 anos de operação',
          pontuacao: 10
        });
        logger.debug(`Critério aplicado: Mais de 3 anos de operação, pontuação: +10`);
      } else if (diferencaEmAnos < 0.5) {  // Menos de 6 meses
        score -= 10;
        criteriosAplicados.push({
          criterio: 'Empresa aberta há menos de 6 meses',
          pontuacao: -10
        });
        logger.debug(`Critério aplicado: Empresa aberta há menos de 6 meses, pontuação: -10`);
      }
    }
    
    // Critério 3: CNAE
    const cnae = dadosCnpj.estabelecimento?.atividade_principal?.id || '';
    const descricaoCnae = dadosCnpj.estabelecimento?.atividade_principal?.descricao || '';
    
    // Lista de CNAEs de alto risco (exemplo)
    const cnaesAltoRisco = [
      '6491300', // Sociedades de fomento mercantil - factoring
      '6499901', // Clubes de investimento
      '6499902', // Sociedades de investimento
      '6499999', // Outras atividades de serviços financeiros
      '4120400', // Construção de edifícios
      '4299599'  // Outras obras de engenharia civil
    ];
    
    // Lista de CNAEs de baixo risco (exemplo)
    const cnaesBaixoRisco = [
      '8511200', // Educação infantil - creche
      '8512100', // Educação infantil - pré-escola
      '8513900', // Ensino fundamental
      '7210000', // Pesquisa e desenvolvimento em ciências físicas e naturais
      '8610101', // Atividades de atendimento hospitalar
      '8630599'  // Atividades de atenção ambulatorial
    ];
    
    if (cnaesAltoRisco.includes(cnae)) {
      score -= 10;
      criteriosAplicados.push({
        criterio: `CNAE de risco (${cnae} - ${descricaoCnae})`,
        pontuacao: -10
      });
      logger.debug(`Critério aplicado: CNAE de risco, pontuação: -10`);
    } else if (cnaesBaixoRisco.includes(cnae)) {
      score += 10;
      criteriosAplicados.push({
        criterio: `CNAE de baixo risco (${cnae} - ${descricaoCnae})`,
        pontuacao: 10
      });
      logger.debug(`Critério aplicado: CNAE de baixo risco, pontuação: +10`);
    }
    
    // Classificação de risco
    let classificacao;
    if (score >= 20) {
      classificacao = 'Baixo Risco';
    } else if (score >= 0) {
      classificacao = 'Médio Risco';
    } else {
      classificacao = 'Alto Risco';
    }
    
    logger.info(`Score final para CNPJ: ${cnpjParaLog}: ${score}, classificação: ${classificacao}`);
    
    return {
      score,
      classificacao,
      criteriosAplicados
    };
  }
}

module.exports = new AnaliseRiscoService();
