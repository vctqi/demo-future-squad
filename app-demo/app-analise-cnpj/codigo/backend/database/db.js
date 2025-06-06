const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { logger } = require('../utils/logger');

const dbPath = path.join(__dirname, 'analisador-risco.db');
let db = null;

/**
 * Inicializa o banco de dados e cria as tabelas necessárias se não existirem
 */
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logger.error(`Erro na conexão com o banco de dados: ${err.message}`);
        return reject(err);
      }
      
      logger.info('Conexão com o banco de dados estabelecida');
      
      // Criar tabelas se não existirem
      db.serialize(() => {
        // Tabela de consultas
        db.run(`CREATE TABLE IF NOT EXISTS consultas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cnpj TEXT NOT NULL,
          data_consulta DATETIME NOT NULL,
          razao_social TEXT,
          situacao_cadastral TEXT,
          data_abertura DATE,
          cnae_principal TEXT,
          descricao_cnae TEXT,
          porte_empresa TEXT,
          municipio TEXT,
          uf TEXT,
          score INTEGER NOT NULL,
          classificacao_risco TEXT NOT NULL,
          dados_completos TEXT
        )`, (err) => {
          if (err) {
            logger.error(`Erro ao criar tabela consultas: ${err.message}`);
            return reject(err);
          }
          
          // Tabela de critérios aplicados
          db.run(`CREATE TABLE IF NOT EXISTS criterios_aplicados (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            consulta_id INTEGER NOT NULL,
            criterio TEXT NOT NULL,
            pontuacao INTEGER NOT NULL,
            FOREIGN KEY (consulta_id) REFERENCES consultas(id)
          )`, (err) => {
            if (err) {
              logger.error(`Erro ao criar tabela criterios_aplicados: ${err.message}`);
              return reject(err);
            }
            
            logger.info('Tabelas criadas ou já existentes');
            resolve();
          });
        });
      });
    });
  });
};

/**
 * Retorna a instância do banco de dados
 */
const getDb = () => {
  if (!db) {
    throw new Error('Banco de dados não inicializado. Chame initDatabase() primeiro.');
  }
  return db;
};

/**
 * Fecha a conexão com o banco de dados
 */
const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          logger.error(`Erro ao fechar o banco de dados: ${err.message}`);
          return reject(err);
        }
        logger.info('Conexão com o banco de dados fechada');
        db = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
};

module.exports = {
  initDatabase,
  getDb,
  closeDatabase
};