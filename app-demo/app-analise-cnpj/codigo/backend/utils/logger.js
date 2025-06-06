const winston = require('winston');
const path = require('path');

// Definir o formato do log
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level.toUpperCase()}] - ${info.message}`
  )
);

// Criar o logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Saída para console
    new winston.transports.Console(),
    // Saída para arquivo
    new winston.transports.File({
      filename: path.join(__dirname, '../../../logs/application.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

module.exports = { logger };