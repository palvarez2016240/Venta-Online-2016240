'use strict'

var express = require("express");
var md_autorizacion = require("../Middlewares/authenticated");
var usuarioControlador = require("../Controladores/usuario.controlador");
var categoriaControlador = require("../Controladores/categoria.controlador");
var productoControlador = require("../Controladores/producto.controlador");
var facturaControlador = require("../Controladores/factura.controlador");

//RUTAS
var api = express.Router();
api.post('/registrarUsuario', usuarioControlador.registrarUsuario);
api.post('/loginUsuario', usuarioControlador.loginUsuario);
api.put('/editarUsuario/:id', md_autorizacion.ensureAuth, usuarioControlador.editarUsuario);
api.put('/eliminarUsuario/:id', md_autorizacion.ensureAuth, usuarioControlador.eliminarUsuario);
api.post('/registrarCategoria', md_autorizacion.ensureAuth, categoriaControlador.registrarCategoria);
api.get('/categorias', categoriaControlador.categorias);
api.put('/editarCategoria/:id', md_autorizacion.ensureAuth, categoriaControlador.editarCategoria);
api.put('/eliminarCategoria/:id', md_autorizacion.ensureAuth, categoriaControlador.eliminarCategoria);
api.post('/registrarProducto/:id', md_autorizacion.ensureAuth, productoControlador.registrarProducto);
api.get('/buscarNombreProducto', productoControlador.buscarNombreProducto);
api.get('/producto', productoControlador.Producto);
api.put('/editarProducto/:id', md_autorizacion.ensureAuth, productoControlador.editarProducto);
api.put('/editarStock/:id', md_autorizacion.ensureAuth, productoControlador.editarStock);
api.put('/eliminarProducto/:id', md_autorizacion.ensureAuth,productoControlador.eliminarProducto);
api.get('/buscarProductoCategoria', md_autorizacion.ensureAuth, productoControlador.buscarProductoCategoria);
api.put('/carritoCompras', md_autorizacion.ensureAuth, facturaControlador.carritoCompras);
api.get('/facturaDetallada/:id', md_autorizacion.ensureAuth, facturaControlador.facturaDetallada);
api.get('/facturas/:id', md_autorizacion.ensureAuth, facturaControlador.facturas);
api.get('/productosAgotados', md_autorizacion.ensureAuth, productoControlador.productosAgotados);
api.get('/productoFactura/:id', md_autorizacion.ensureAuth, facturaControlador.productosFactura);
api.get('/productosMasVendidos', productoControlador.productosMasVendidos);

module.exports = api;