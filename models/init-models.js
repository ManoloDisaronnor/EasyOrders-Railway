var DataTypes = require("sequelize").DataTypes;
var _cliente = require("./cliente");
var _pedido = require("./pedido");

function initModels(sequelize) {
  var cliente = _cliente(sequelize, DataTypes);
  var pedido = _pedido(sequelize, DataTypes);

  pedido.belongsTo(cliente, { as: "id_cliente_Cliente", foreignKey: "id_cliente"});
  cliente.hasMany(pedido, { as: "Pedidos", foreignKey: "id_cliente"});

  return {
    cliente,
    pedido,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
