require('dotenv').config({
    path: `.env.${process.env.NODE_ENV || 'development'}`
});
// Importar fichero de configuración con variables de entorno
const config = require("./config/config");
const path = require("path");
// Importar librería express --> web server
const express = require("express");
// Importar libreria CORS
const cors = require("cors");
// Importar gestores de rutas
const clienteRoutes = require("./routes/clienteRoutes");
const pedidoRoutes = require("./routes/pedidoRoutes");

const app = express();
// app.use(cors());
// He usado el limit, porque en mi servidor guardo las imagenes directamente en la base de datos, y si no pongo un límite, como las imagenes estan codificadas
// en base64, puede llegar la peticion a ocupar mucho espacio y Express por defecto tiene un límite de 1mb
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
})

app.use("/api/clientes", clienteRoutes);
app.use("/api/pedidos", pedidoRoutes);

if (process.env.NODE_ENV !== "test") {
    app.listen(config.port, () => {
        console.log(`Servidor escuchando en el puerto ${config.port}`);
    });
}

module.exports = app;