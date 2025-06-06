const { getDb } = require('./db');
const { logger } = require('../utils/logger');

/**
 * Salva uma consulta no banco de dados
 * @param {Object} consulta - Dados da consulta a serem salvos
 * @returns {Promise<number>} - ID da consulta salva
 */
const salvarConsulta = (consulta) => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    
    const {
      cnpj,
      razao_social,
      situacao_cadastral,
      data_abertura,
      cnae_principal,
      descricao_cnae,
      porte_empresa,
      municipio,
      uf,
      score,
      classificacao_risco,
      dados_completos,
      criterios
    } = consulta;
    
    // Converter objeto para JSON string
    const dadosCompletosStr = JSON.stringify(dados_completos);
    
    // Data atual para o registro da consulta
    const data_consulta = new Date().toISOString();
    
    db.run(
      `INSERT INTO consultas (
        cnpj, data_consulta, razao_social, situacao_cadastral, 
        data_abertura, cnae_principal, descricao_cnae, porte_empresa,
        municipio, uf, score, classificacao_risco, dados_completos
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cnpj, data_consulta, razao_social, situacao_cadastral,
        data_abertura, cnae_principal, descricao_cnae, porte_empresa,
        municipio, uf, score, classificacao_risco, dadosCompletosStr
      ],
      function(err) {
        if (err) {
          logger.error(`Erro ao salvar consulta: ${err.message}`);
          return reject(err);
        }
        
        const consultaId = this.lastID;
        
        // Se houver critérios, salvá-los também
        if (criterios && criterios.length > 0) {
          const stmt = db.prepare(
            'INSERT INTO criterios_aplicados (consulta_id, criterio, pontuacao) VALUES (?, ?, ?)'
          );
          
          criterios.forEach(criterio => {
            stmt.run(consultaId, criterio.criterio, criterio.pontuacao, (err) => {
              if (err) {
                logger.error(`Erro ao salvar critério: ${err.message}`);
                // Não rejeitar a promise, apenas logar o erro
              }
            });
          });
          
          stmt.finalize();
        }
        
        logger.info(`Consulta para CNPJ ${cnpj} salva com sucesso`);
        resolve(consultaId);
      }
    );
  });
};

/**
 * Busca uma consulta recente pelo CNPJ (últimas 24 horas)
 * @param {string} cnpj - CNPJ a ser consultado
 * @returns {Promise<Object|null>} - Dados da consulta ou null se não encontrada
 */
const buscarConsultaRecente = (cnpj) => {
  return new Promise((resolve, reject) => {
    const db = getDb();
    
    // Data de 24 horas atrás
    const vinteQuatroHorasAtras = new Date();
    vinteQuatroHorasAtras.setHours(vinteQuatroHorasAtras.getHours() - 24);
    const dataLimite = vinteQuatroHorasAtras.toISOString();
    
    db.get(
      `SELECT * FROM consultas 
       WHERE cnpj = ? AND data_consulta >= ? 
       ORDER BY data_consulta DESC LIMIT 1`,
      [cnpj, dataLimite],
      (err, row) => {
        if (err) {
          logger.error(`Erro ao buscar consulta recente: ${err.message}`);
          return reject(err);
        }
        
        if (!row) {
          logger.debug(`Cache não encontrado para CNPJ: ${cnpj}`);
          return resolve(null);
        }
        
        // Buscar critérios aplicados
        db.all(
          'SELECT criterio, pontuacao FROM criterios_aplicados WHERE consulta_id = ?',
          [row.id],
          (err, criterios) => {
            if (err) {
              logger.error(`Erro ao buscar critérios: ${err.message}`);
              return reject(err);
            }
            
            // Converter JSON string de volta para objeto
            try {
              row.dados_completos = JSON.parse(row.dados_completos);
            } catch (e) {
              logger.warn(`Erro ao parsear dados_completos: ${e.message}`);
              row.dados_completos = {};
            }
            
            row.criterios = criterios;
            logger.info(`Cache encontrado para CNPJ: ${cnpj}, data da consulta original: ${row.data_consulta}`);
            resolve(row);
          }
        );
      }
    );
  });
};

module.exports = {
  salvarConsulta,
  buscarConsultaRecente
};