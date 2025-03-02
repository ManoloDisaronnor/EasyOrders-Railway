const Respuesta = require("../utils/respuesta.js");
// Recuperar función de inicialización de modelos
const initModels = require("../models/init-models.js").initModels;
// Crear la instancia de sequelize con la conexión a la base de datos
const sequelize = require("../config/sequelize.js");

const models = initModels(sequelize);
const Pedido = models.pedido;
const Cliente = models.cliente;

class PedidoController {
    async getAllPedidos(req, res) {
        try {
            const pedidos = await Pedido.findAll({
                include: [{
                    model: Cliente,
                    as: "id_cliente_Cliente",
                    required: false,
                    attributes: ['id_cliente', 'nombre']
                }]
            });
            return res.status(200).json(Respuesta.exito(pedidos, "Pedidos recuperados correctamente"));
        } catch (error) {
            return res.status(404).json(Respuesta.error(null, "Error al recuperar los pedidos " + error, "PEDIDOS_NO_RECUPERADOS"));
        }
    }

    async getDatosClientesGrafica(req, res) {
        try {
            const clientes = await Pedido.findAll({
                attributes: [
                    'id_cliente',
                    [sequelize.fn('COUNT', sequelize.col('id_pedido')), 'num_pedidos']
                ],
                include: [{
                    model: Cliente,
                    as: 'id_cliente_Cliente',
                    attributes: ['usuario', 'nombre', 'apellidos', 'correo', 'direccion', 'telefono', 'imagen', 'sexo']
                }],
                group: ['id_cliente'],
                raw: true
            });
            const clientesConImagen = clientes.map(cliente => {
                // Accedemos a la imagen usando la notación de corchetes (por el raw: true)
                const imagenBuffer = cliente['id_cliente_Cliente.imagen'];
                
                // Creamos un nuevo objeto con la estructura deseada
                return {
                    id_cliente: cliente.id_cliente,
                    num_pedidos: cliente.num_pedidos,
                    id_cliente_Cliente: {
                        usuario: cliente['id_cliente_Cliente.usuario'],
                        nombre: cliente['id_cliente_Cliente.nombre'],
                        apellidos: cliente['id_cliente_Cliente.apellidos'],
                        correo: cliente['id_cliente_Cliente.correo'],
                        direccion: cliente['id_cliente_Cliente.direccion'],
                        telefono: cliente['id_cliente_Cliente.telefono'],
                        imagen: imagenBuffer ? imagenBuffer.toString('base64') : null, // Conversión directa
                        sexo: cliente['id_cliente_Cliente.sexo']
                    }
                };
            });
            
            return res.json(Respuesta.exito(clientesConImagen, "Clientes recuperados correctamente"));
        } catch (error) {
            return res.status(404).json(Respuesta.error(null, "Error al recuperar los datos de los clientes para la gráfica " + error, "DATOS_CLIENTES_GRAFICA_NO_RECUPERADOS"));
        }
    }

    async insertPedido(req, res) {
        const pedido = req.body;
        try {
            if (pedido.producto === "" || pedido.unidades === 0 || pedido.estado === "" || pedido.id_cliente === "" || pedido.fecha_pedido === null) {
                return res.status(400).json(Respuesta.error(null, "Por favor, rellene todos los campos antes de guardar el pedido", "FALTAN_DATOS"));
            }

            if (pedido.estado === "Procesando" || pedido.estado === "Pedido" || pedido.estado === "Reparto") {
                if (pedido.fecha_entrega !== null) {
                    return res.status(400).json(Respuesta.error(null, "No puede seleccionar una fecha si el producto no ha sido entregado. Por favor, cambie el estado a entregado o quite la fecha de entrega", "ESTADO_INCORRECTO"));
                }
            }

            if (new Date(pedido.fecha_pedido) > new Date()) {
                return res.status(400).json(Respuesta.error(null, "No puedes crear un pedido en el futuro... (La fecha de pedido debe ser igual o anterior al dia de hoy)", "FECHA_INCORRECTA"));
            }

            if (pedido.fecha_pedido >= pedido.fecha_entrega) {
                return res.status(400).json(Respuesta.error(null, "La fecha de pedido no puede ser mayor o igual que la fecha de entrega", "FECHA_INCORRECTA"));
            }

            const idPedido = await Pedido.create(pedido);
            pedido.id_pedido = idPedido;
            return res.status(201).json(Respuesta.exito(pedido, "Pedido creado correctamente"));
        } catch (error) {
            return res.status(500).json(Respuesta.error(null, "Error al crear el pedido " + error, "PEDIDO_NO_INSERTADO"));
        }
    }

    async deletePedido(req, res) {
        const { idPedido } = req.params;
        try {
            const data = await Pedido.destroy({
                where: {
                    id_pedido: idPedido
                }
            });
    
            if (data === 0) {
                return res.status(404).json(Respuesta.error(null, `No se encontró el pedido con ID ${idPedido}`, "PEDIDO_NO_ENCONTRADO"));
            }
    
            return res.json(Respuesta.exito(data, "Pedido eliminado correctamente"));
        } catch (error) {
            return res.status(500).json(Respuesta.error(null, `Error al eliminar el pedido ${idPedido}: ${error}`, "ERROR_ELIMINAR_PEDIDO"));
        }
    }

    async updatePedido(req, res) {
        const { idPedido } = req.params;
        try {
            // Comprobacio previa a modificar el pedido para saber si ese pedido tenia el estado Entregado (si lo tenia que no deje modificarlo y devuelva un error)
            // Esto se hace porque no se puede modificar un pedido que ya ha sido entregado
            const pedidoEntregado = await Pedido.findByPk(idPedido);
            if (pedidoEntregado.estado === "Entregado") {
                return res.status(400).json(Respuesta.error(null, "El pedido ya ha sido entregado, no se puede modificar", "PEDIDO_ENTREGADO"));
            }

            // Recupero el pedido modificado
            const pedido = req.body;

            if (pedido.producto === "" || pedido.unidades === 0 || pedido.estado === "" || pedido.id_cliente === "" || pedido.fecha_pedido === null) {
                return res.status(400).json(Respuesta.error(null, "Por favor, rellene todos los campos antes de guardar el pedido", "FALTAN_DATOS"));
            }

            if (pedido.estado === "Procesando" || pedido.estado === "Pedido" || pedido.estado === "Reparto") {
                if (pedido.fecha_entrega !== null) {
                    return res.status(400).json(Respuesta.error(null, "No puede seleccionar una fecha si el producto no ha sido entregado. Por favor, cambie el estado a entregado o quite la fecha de entrega", "ESTADO_INCORRECTO"));
                }
            }

            if (new Date(pedido.fecha_pedido) > new Date()) {
                return res.status(400).json(Respuesta.error(null, "No puedes crear un pedido en el futuro... (La fecha de pedido debe ser igual o anterior al dia de hoy)", "FECHA_INCORRECTA"));
            }

            if (pedido.fecha_pedido >= pedido.fecha_entrega) {
                return res.status(400).json(Respuesta.error(null, "La fecha de pedido no puede ser mayor o igual que la fecha de entrega", "FECHA_INCORRECTA"));
            }

            const reponse = await Pedido.update(
                {
                    producto: pedido.producto,
                    fecha_pedido: pedido.fecha_pedido,
                    fecha_entrega: pedido.fecha_entrega,
                    precio: pedido.precio,
                    unidades: pedido.unidades,
                    estado: pedido.estado,
                    id_cliente: pedido.id_cliente,
                },
                {
                    where: {
                        id_pedido: idPedido
                    }
                }
            )
            return res.status(200).json(Respuesta.exito(reponse, "Pedido actualizado correctamente"));
        } catch (error) {
            return res.status(500).json(Respuesta.error(null, "Error al actualizar el pedido " + idPedido + " " + error, "PEDIDO_NO_ACTUALIZADO"));
        }

    }

    async getPedidosCliente(req, res) {
        const { idCliente } = req.params;
        try {

            if (idCliente === "" || idCliente === null) {
                return res.status(400).json(Respuesta.error(null, "Por favor, indique el id del cliente para recuperar los pedidos", "FALTAN_DATOS"));
            }

            const response = await Pedido.findAll({
                where: {
                    id_cliente: idCliente
                }
            });

            return res.status(200).json(Respuesta.exito(response, "Pedidos recuperados correctamente"));

        } catch (error) {
            return res.status(500).json(Respuesta.error(null, "Error al recuperar los pedidos del cliente " + idCliente + " " + error, "PEDIDOS_NO_RECUPERADOS"));
        }
    }
}

module.exports = new PedidoController();