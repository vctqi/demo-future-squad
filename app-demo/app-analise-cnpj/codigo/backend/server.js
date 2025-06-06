const express = require('express');
const cors = require('cors');
const path = require('path');
const { logger } = require('./utils/logger');
const cnpjRoutes = require('./routes/cnpjRoutes');
const { initDatabase } = require('./database/db');

// Inicializar o servidor Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Rotas da API
app.use('/api', cnpjRoutes);

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Inicializar o banco de dados
initDatabase()
  .then(() => {
    // Iniciar o servidor
    app.listen(PORT, () => {
      logger.info(`Aplicação iniciada na porta ${PORT}`);
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch(err => {
    logger.error(`Erro ao inicializar o banco de dados: ${err.message}`);
    console.error('Erro ao inicializar o banco de dados:', err);
  });

// Tratamento de erros
process.on('uncaughtException', (err) => {
  logger.error(`Exceção não tratada: ${err.message}`);
  console.error('Exceção não tratada:', err);
});

// Encerramento gracioso
process.on('SIGINT', () => {
  logger.info('Aplicação encerrada');
  console.log('Servidor encerrado');
  process.exit(0);
});