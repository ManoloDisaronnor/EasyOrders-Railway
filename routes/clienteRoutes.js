const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

router.get('/', clienteController.getAllClientes);
router.get('/clientespedido', clienteController.getAllClientesPedidos);
router.post('/buscarcliente/:nombreUsuario', clienteController.getCliente);
router.post('/altacliente', clienteController.insertCliente);
router.delete('/eliminarcliente/:idCliente', clienteController.deleteCliente);
router.put('/modificarcliente/:idCliente', clienteController.modCliente);

module.exports = router;