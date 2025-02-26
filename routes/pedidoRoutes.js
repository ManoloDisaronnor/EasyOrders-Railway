const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

router.get('/', pedidoController.getAllPedidos);
router.post('/altapedido', pedidoController.insertPedido);
router.get('/clientesgrafica', pedidoController.getDatosClientesGrafica);
router.delete('/eliminarpedido/:idPedido', pedidoController.deletePedido);
router.put('/modificarpedido/:idPedido', pedidoController.updatePedido);
router.post('/pedidoscliente/:idCliente', pedidoController.getPedidosCliente);

module.exports = router;