const Respuesta = require("../utils/respuesta.js");
// Recuperar función de inicialización de modelos
const initModels = require("../models/init-models.js").initModels;
// Crear la instancia de sequelize con la conexión a la base de datos
const sequelize = require("../config/sequelize.js");
// Importar bcrypt para hashear la contraseña del cliente antes de insertar en la base de datos
const bcrypt = require("bcrypt");
// Importar los operadores de sequelize para hacer mayor que menor que no igual que etc
const { Op } = require("sequelize");

const models = initModels(sequelize);
const Cliente = models.cliente;
const Pedido = models.pedido;

class ClienteController {
    async getAllClientes(req, res) {
        try {
            const clientes = await Cliente.findAll({
                attributes: { exclude: ['password'] },
            });
            // Para convertir la imagen a base64 para poder mostrarla en el frontend
            const clientesConImagen = clientes.map(cliente => {
                if (cliente.imagen) {
                    return {
                        ...cliente.dataValues,
                        imagen: cliente.imagen.toString('base64')
                    };
                } else {
                    return {
                        ...cliente.dataValues,
                        imagen: null
                    };
                }
            });
            return res.json(Respuesta.exito(clientesConImagen, "Clientes recuperados correctamente"));
        } catch (error) {
            return res.status(404).json(Respuesta.error(null, "Error al recuperar los clientes " + error, "CLIENTES_NO_RECUPERADOS"));
        }
    }

    async insertCliente(req, res) {
        const cliente = req.body;
        try {
            if (cliente.usuario === "" || cliente.nombre === "" || cliente.correo === "" || cliente.password === "" || cliente.sexo === "" || cliente.telefono === "") {
                return res.status(400).json(Respuesta.error(null, "Por favor, rellene al menos los campos nombre, nombre de usuario, correo, contraseña, teléfono y sexo", "FALTAN_DATOS"));
            } else {
                let clienteExistente = await Cliente.findOne({ where: { correo: cliente.correo } });
                if (clienteExistente) {
                    return res.status(409).json(Respuesta.error(null, "Ya existe ese correo vinculado a un cliente", "CORREO_EXISTENTE"));
                }
                clienteExistente = await Cliente.findOne({ where: { usuario: cliente.usuario } });
                if (clienteExistente) {
                    return res.status(409).json(Respuesta.error(null, "Ya existe un cliente con ese nombre de usuario", "USUARIO_EXISTENTE"));
                }
                clienteExistente = await Cliente.findOne({ where: { telefono: cliente.telefono } });
                if (clienteExistente) {
                    return res.status(409).json(Respuesta.error(null, "Ya existe ese teléfono vinculado a un cliente", "TELEFONO_EXISTENTE"));
                }

                if (cliente.imagen) {
                    cliente.imagen = Buffer.from(cliente.imagen, 'base64');
                }

                const password = cliente.password;
                cliente.password = await bcrypt.hash(password, 10);
                const idCliente = await Cliente.create(cliente);
                cliente.idCliente = idCliente;
                return res.status(201).json(Respuesta.exito(cliente, "Cliente insertado correctamente"));
            }
        } catch (error) {
            return res.status(500).json(Respuesta.error(null, "Error al insertar el cliente " + error, "CLIENTE_NO_INSERTADO"));
        }
    }

    async deleteCliente(req, res) {
        try {
            const { idCliente } = req.params;
            const data = await Cliente.destroy(
                {
                    where: {
                        id_cliente: idCliente
                    }
                }
            );
            return res.json(Respuesta.exito(data, "Cliente eliminado correctamente"));
        } catch (error) {
            return res.status(500).json(Respuesta.error(null, "Error al eliminar el cliente " + error, "CLIENTE_NO_ELIMINADO"));
        }
    }

    async modCliente(req, res) {
        try {
            const { idCliente } = req.params;
            let { usuario, nombre, apellidos, correo, telefono, imagen, direccion, sexo } = req.body;
            if (usuario === "" || nombre === "" || correo === "" || sexo === "") {
                return res.status(400).json(Respuesta.error(null, "Por favor, rellene al menos los campos nombre, nombre de usuario, correo, contraseña y sexo", "FALTAN_DATOS"));
            }

            let clienteExistente = await Cliente.findOne({ where: { correo, id_cliente: { [Op.ne]: idCliente } } });
            if (clienteExistente) {
                return res.status(409).json(Respuesta.error(null, "Ya existe ese correo vinculado a un cliente", "CORREO_EXISTENTE"));
            }
            clienteExistente = await Cliente.findOne({ where: { usuario, id_cliente: { [Op.ne]: idCliente } } });
            if (clienteExistente) {
                return res.status(409).json(Respuesta.error(null, "Ya existe un cliente con ese nombre de usuario", "USUARIO_EXISTENTE"));
            }
            clienteExistente = await Cliente.findOne({ where: { telefono, id_cliente: { [Op.ne]: idCliente } } });
            if (clienteExistente) {
                return res.status(409).json(Respuesta.error(null, "Ya existe ese teléfono vinculado a un cliente", "TELEFONO_EXISTENTE"));
            }

            if (imagen) {
                imagen = Buffer.from(imagen, 'base64');
            }
            const response = await Cliente.update(
                {
                    usuario: usuario,
                    nombre: nombre,
                    apellidos: apellidos,
                    correo: correo,
                    telefono: telefono,
                    imagen: imagen,
                    direccion: direccion,
                    sexo: sexo
                },
                {
                    where: {
                        id_cliente: idCliente
                    }
                }
            );
            return res.json(Respuesta.exito(response, "Cliente modificado correctamente"));

        } catch (error) {
            return res.status(500).json(Respuesta.error(null, "Error al modificar el cliente " + error, "CLIENTE_NO_MODIFICADO"));
        }
    }

    // ESTA FUNCION LA HE CREADO PARA RECOGER LOS CLIENTES PARA EL SELECT DE MODIFICAR PEDIDO, 
    // ESTO LO HAGO EN UNA FUNCION A PARTE PARA NO RECOGER LA IMAGEN Y TODOS LOS DEMAS ATRIBUTOS DE CLIENTE YA QUE SERIA UNA CARGA INNECESARIA
    async getAllClientesPedidos(req, res) {
        try {
            const clientes = await Cliente.findAll({
                attributes: ['id_cliente', 'nombre'],
            });
            return res.status(200).json(Respuesta.exito(clientes, "Clientes recuperados correctamente"));
        } catch (error) {
            return res.status(404).json(Respuesta.error(null, "Error al recuperar los clientes " + error, "CLIENTES_NO_RECUPERADOS"));
        }
    }

    async getCliente(req, res) {
        try {
            const { nombreUsuario } = req.params;
            const cliente = await Cliente.findOne({
                where: {
                    usuario: nombreUsuario
                },
                attributes: {
                    exclude: ['password']
                },
            });
            if (cliente) {
                const clienteConImagen = {
                    ...cliente.dataValues,
                    imagen: cliente.imagen.toString('base64')
                };
                return res.json(Respuesta.exito(clienteConImagen, "Cliente recuperado correctamente"));
            } else {
                return res.status(404).json(Respuesta.error(null, "No se ha encontrado ningún cliente con el nombre de usuario " + nombreUsuario, "CLIENTE_NO_ENCONTRADO"));
            }
        } catch (error) {
            return res.status(404).json(Respuesta.error(null, "Error al recuperar el cliente " + error, "CLIENTE_NO_RECUPERADO"));
        }

    }

}

module.exports = new ClienteController();