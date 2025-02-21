require('dotenv').config({
    path: `.env.${process.env.NODE_ENV || 'development'}`
});

// Importar fichero de configuración con variables de entorno
const config = require("./config/config");
const path = require("path");
const express = require("express");
const cors = require("cors");

// Importar gestores de rutas
const clienteRoutes = require("./routes/clienteRoutes");
const pedidoRoutes = require("./routes/pedidoRoutes");

const app = express();

// Habilitar CORS en modo desarrollo
if (process.env.NODE_ENV === "development") {
    app.use(cors());
}

// **Middleware para parsear JSON y datos de formularios**
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Definir rutas
app.use("/api/clientes", clienteRoutes);
app.use("/api/pedidos", pedidoRoutes);

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Iniciar servidor si no estamos en modo test
if (process.env.NODE_ENV !== "test") {
    app.listen(config.port, () => {
        console.log(`Servidor escuchando en el puerto ${config.port}`);
    });
}

module.exports = app;