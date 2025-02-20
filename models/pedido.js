const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('pedido', {
    id_pedido: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    producto: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    fecha_pedido: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fecha_entrega: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    precio: {
      type: DataTypes.FLOAT(8,2),
      allowNull: false
    },
    unidades: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('Procesando','Pedido','Reparto','Entregado'),
      allowNull: false
    },
    id_cliente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Cliente',
        key: 'id_cliente'
      }
    }
  }, {
    sequelize,
    tableName: 'Pedido',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_pedido" },
        ]
      },
      {
        name: "FK1_id_Cliente",
        using: "BTREE",
        fields: [
          { name: "id_cliente" },
        ]
      },
    ]
  });
};
