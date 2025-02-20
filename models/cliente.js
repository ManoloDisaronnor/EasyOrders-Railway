const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cliente', {
    id_cliente: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    usuario: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "UK_Cliente_usuario"
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    apellidos: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    correo: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "UK_Cliente_correo"
    },
    password: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    telefono: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: "UK_Cliente_telefono"
    },
    imagen: {
      type: DataTypes.BLOB,
      allowNull: true
    },
    direccion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    sexo: {
      type: DataTypes.ENUM('H','M','N'),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Cliente',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_cliente" },
        ]
      },
      {
        name: "UK_Cliente_telefono",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "telefono" },
        ]
      },
      {
        name: "UK_Cliente_usuario",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "usuario" },
        ]
      },
      {
        name: "UK_Cliente_correo",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "correo" },
        ]
      },
    ]
  });
};
