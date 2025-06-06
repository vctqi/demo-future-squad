const express = require('express');
const cnpjController = require('../controllers/cnpjController');

const router = express.Router();

// Rota para consulta de CNPJ
router.post('/cnpj', cnpjController.consultarCnpj);

module.exports = router;