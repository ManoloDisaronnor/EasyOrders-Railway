const request = require("supertest");
const app = require("../index");

describe("Pruebas para los endpoints de pedidos", () => {
    let testPedidoId;
    // Tests para POST /api/pedidos/altapedido
    describe("POST /api/pedidos/altapedido", () => {
        it("Debería crear un nuevo pedido correctamente", async () => {
            const pedidoData = {
                producto: "productoTest",
                fecha_pedido: "2023-01-01",
                fecha_entrega: "2023-01-02",
                precio: 100,
                unidades: 1,
                estado: "Entregado",
                id_cliente: 1
            };

            const response = await request(app)
                .post("/api/pedidos/altapedido")
                .send(pedidoData);

            testPedidoId = response.body.datos.id_pedido.id_pedido;

            expect(response.statusCode).toBe(201);
            expect(response.body.ok).toBe(true);
            expect(response.body.datos).toMatchObject(pedidoData);
        });

        it("Debería fallar si faltan campos obligatorios", async () => {
            const invalidData = {
                producto: "",
                fecha_pedido: null,
                unidades: 0,
                estado: "",
                id_cliente: ""
            };

            const response = await request(app)
                .post("/api/pedidos/altapedido")
                .send(invalidData);

            expect(response.statusCode).toBe(400);
            expect(response.body.codError).toBe("FALTAN_DATOS");
        });

        it("Debería fallar con estado incorrecto y fecha de entrega", async () => {
            const invalidData = {
                producto: "test",
                fecha_pedido: "2023-01-01",
                fecha_entrega: "2023-01-02",
                unidades: 1,
                estado: "Procesando",
                id_cliente: 1
            };

            const response = await request(app)
                .post("/api/pedidos/altapedido")
                .send(invalidData);

            expect(response.statusCode).toBe(400);
            expect(response.body.codError).toBe("ESTADO_INCORRECTO");
        });
    });

    // Test para GET /api/pedidos
    describe("GET /api/pedidos/", () => {
        it("Debería obtener todos los pedidos con status 200", async () => {
            const response = await request(app).get("/api/pedidos/");
            expect(response.statusCode).toBe(200);
            expect(response.body.ok).toBe(true);
            expect(response.body.datos).toBeInstanceOf(Array);
        });
    });

    // Test para DELETE /api/pedidos/eliminarpedido/:id
    describe("DELETE /api/pedidos/eliminarpedido/:id", () => {
        it("Debería eliminar un pedido existente", async () => {
            const response = await request(app)
                .delete(`/api/pedidos/eliminarpedido/${testPedidoId}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.ok).toBe(true);
        });

        it("Debería fallar al eliminar un pedido inexistente", async () => {
            const response = await request(app)
                .delete("/api/pedidos/eliminarpedido/9999");

            expect(response.statusCode).toBe(404);
            expect(response.body.ok).toBe(false);
        });
    });

    // Tests para PUT /api/pedidos/modificarpedido/:id
    describe("PUT /api/pedidos/modificarpedido/:id", () => {
        let updatePedidoId;

    beforeAll(async () => {
        // Crear un pedido para pruebas de actualización
        const pedidoData = {
            producto: "productoUpdateTest",
            fecha_pedido: "2023-01-01",
            fecha_entrega: null,
            precio: 100,
            unidades: 1,
            estado: "Procesando",
            id_cliente: 1
        };

        const response = await request(app)
            .post("/api/pedidos/altapedido")
            .send(pedidoData);

        updatePedidoId = response.body.datos.id_pedido.id_pedido; // Asignar aquí
        console.log("updatePedidoId: ", updatePedidoId);
    });

    afterAll(async () => {
        await request(app)
            .delete(`/api/pedidos/eliminarpedido/${updatePedidoId}`);
    });

        it("Debería actualizar un pedido correctamente", async () => {
            const updatedData = {
                producto: "productoActualizado",
                fecha_pedido: "2023-01-01",
                fecha_entrega: null,
                precio: 200,
                unidades: 2,
                estado: "Reparto",
                id_cliente: 1
            };

            const response = await request(app)
                .put(`/api/pedidos/modificarpedido/${updatePedidoId}`)
                .send(updatedData);

            expect(response.statusCode).toBe(200);
            expect(response.body.ok).toBe(true);
        });

        it("Debería fallar al actualizar pedido entregado", async () => {
            // Marcar el pedido como entregado
            await request(app)
                .put(`/api/pedidos/modificarpedido/${updatePedidoId}`)
                .send({ estado: "Entregado" });

            const response = await request(app)
                .put(`/api/pedidos/modificarpedido/${updatePedidoId}`)
                .send({ producto: "Nuevo producto" });

            expect(response.statusCode).toBe(400);
            expect(response.body.codError).toBe("PEDIDO_ENTREGADO");
        });
    });

    // Test para POST /api/pedidos/pedidoscliente/:id
    describe("POST /api/pedidos/pedidoscliente/:id", () => {
        it("Debería obtener pedidos de un cliente específico", async () => {
            const response = await request(app)
                .post("/api/pedidos/pedidoscliente/1");

            expect(response.statusCode).toBe(200);
            expect(response.body.ok).toBe(true);
            expect(response.body.datos).toBeInstanceOf(Array);
        });
    });
});