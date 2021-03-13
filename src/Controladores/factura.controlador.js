'use strict'

var factura = require("../modelos/factura.model");
var producto = require("../modelos/producto.model");
var facturaId;
var productoId;
var stockProducto = 0;
var venta = 0;
var totalStock = 0;
var totalVenta = 0;

function carritoCompras(req, res) {
    var idCliente = req.user.sub;
    var facturaModel = new factura();
    var params = req.body;
    var nombreProducto;
    
    if(req.user.rol != 'ROL_CLIENTE'){
        return res.status(500).send({mensaje: 'Solo el cliente puede agregar al carrito de compras'});
    }

    if(params.accion != 'comprar'){
        if(params.accion != 'agregar'){
            if(params.accion != 'pagar'){
                return res.status(500).send({mensaje: 'La accion no es valida solo puedes comprar / agregar / pagar'})
            }
        }
    }

    if(params.nombre && params.cantidad && params.accion){
        if(params.cantidad <= '0'){
            return res.status(500).send({mensaje: 'No puedes comprar 0 productos o menos'})
        }
        if(params.accion === 'pagar'){
            factura.findById(facturaId, (err, facturaEncontrada)=>{
                if(err) return res.status(500).send({mensaje: 'Error en la peticion'})
                if(!facturaEncontrada) return res.status(500).send({mensaje: 'Primero haga una compra antes de pagar'})
                facturaId = null;
                return res.status(200).send({mensaje: 'Compra exitosa!', facturaEncontrada})
            })
        }

        if(params.accion === 'comprar'){
            producto.findOne({nombre: params.nombre}).exec((err, productoEncontrado)=>{
                if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                if(!productoEncontrado) return res.status(500).send({mensaje: 'El producto no existe'});
                productoId = productoEncontrado._id;
                nombreProducto = productoEncontrado.nombre;
                parseInt(stockProducto = productoEncontrado.stock)
                parseInt(venta = productoEncontrado.ventas)

                if(stockProducto < params.cantidad || stockProducto === 0){
                    return res.status(500).send({mensaje: 'La cantidad que pide del producto es mayor al stock existente', stockProducto})
                }else{
                facturaModel.usuario = idCliente,
                    facturaModel.compras ={
                        compraProducto: productoId,
                        nombre: nombreProducto,
                        cantidad: params.cantidad
                    }
                
                facturaModel.save((err, facturaGuardada)=>{
                    if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                    if(!facturaGuardada) return res.status(500).send({mensaje: 'Error al guardar la factura'});
                    facturaId = facturaGuardada._id;
                    
                    totalStock = stockProducto - params.cantidad;
                    totalVenta = parseInt(venta) + parseInt(params.cantidad);
                    producto.update({_id: productoId}, {
                        $set: {
                            stock: totalStock,
                            ventas: totalVenta
                        }
                    }, {new: true}, (err, productoActualizado) =>{
                        if(err) return res.status(500).send({mensaje: 'Error al actualizar el producto'});
                        if(!productoActualizado) return res.status(500).send({mensaje: 'El producto no existe'});
                        if(facturaGuardada) return res.status(200).send({mensaje: 'Primer producto agregado al carrito',facturaGuardada})
                    })
                })
             }
            })
        }else if(params.accion === 'agregar'){
            producto.findOne({nombre: params.nombre}).exec((err, productoEncontrado)=>{
                if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                if(!productoEncontrado) return res.status(500).send({mensaje: 'El producto no existe'});
                productoId = productoEncontrado._id;
                nombreProducto = productoEncontrado.nombre;
                parseInt(stockProducto = productoEncontrado.stock);
                parseInt(venta = productoEncontrado.ventas);

                if(stockProducto < params.cantidad || stockProducto === 0){
                    return res.status(500).send({mensaje: 'La cantidad que pide del producto es mayor al stock existente', stockProducto});}

                factura.findByIdAndUpdate(facturaId, {
                    $push: {
                        compras: {
                            compraProducto: productoId,
                            nombre: nombreProducto,
                            cantidad: params.cantidad
                        }
                    }
                }, {new: true}, (err, compraAgregada)=>{
                    if(err)  return res.status(500).send({mensaje: 'Error en al peticion'});
                    if(!compraAgregada) return res.status(500).send({mensaje: 'Compra un producto antes de agregar otro'});
                
                    totalStock = stockProducto - params.cantidad;
                    totalVenta = parseInt(venta) + parseInt(params.cantidad);
                    producto.update({_id: productoId},{
                        $set: {
                            stock: totalStock,
                            ventas: totalVenta
                        }
                    },{new: true}, (err, productoActualizado)=>{
                        if(err) return res.status(500).send({mensaje:'No se actualizo el producto'});
                        if(!productoActualizado) return res.status(500).send({mensaje: 'El producto no existe'})
                        if (!compraAgregada) return res.status(200).send({mensaje: 'No se pudo agregar el producto',compraAgregada});
                        return res.status(200).send({mensaje: 'Producto agregado al carrito',compraAgregada});
                    })
                })
            })
        }
    }else{
        return res.status(500).send({mensaje: 'Parametro incorrectos o incompletos'});
    }
}

function facturaDetallada(req, res) {
    var idFactura = req.params.id;

    if(req.user.rol != 'ROL_CLIENTE')
        return res.status(500).send({mensaje: 'Solo los clientes pueden ver esto'});

    factura.findOne({_id: idFactura}).exec((err, facturaEncontrada)=>{
        if(err) return res.status(500).send({mensaje: 'Error al buscar la factura, talvez no existe'});
        if(!facturaEncontrada) return res.status(500).send({mensaje: 'La factura no existe'});
        if(req.user.sub != facturaEncontrada.usuario){
            return res.status(500).send({mensaje: 'La factura no te pertenece'});
        }
        return res.status(200).send({facturaEncontrada});
    })
}

function facturas(req, res) {
    var idCliente = req.params.id;

    if(req.user.rol != 'ROL_ADMIN')
        return res.status(500).send({mensaje: 'Solo el ADMIN puede ver todas las facturas'});

    factura.find({usuario: idCliente}).exec((err, facturaEncontrada)=>{
        if(err) return res.status(500).send({mensaje: 'El cliente no existe'});
        if(!facturaEncontrada) return res.status(500).send({mensaje: 'El cliente no tiene facturas'});
        if(facturaEncontrada && facturaEncontrada.length === 0){
            return res.status(500).send({mensaje: 'El cliente no ha hecho ninguna compra'})}
        return res.status(200).send({facturaEncontrada})
    })
}

function productosFactura(req, res) {
    var idFactura = req.params.id;
    
    if(req.user.rol != 'ROL_ADMIN')
        return res.status(500).send({mensaje: 'Solo el ADMIN puede ver esto'})
    
    factura.find({_id: idFactura},{_id:0, usuario:0, __v: 0}).exec((err, facturaEncontrada)=>{
        if(err) return res.status(500).send({mensaje: 'La factura no existe'});
        if(!facturaEncontrada) return res.status(500).send({mensaje: 'La factura no tiene productos'});
        return res.status(200).send({facturaEncontrada})
    })
}

module.exports = {
    carritoCompras,
    facturaDetallada,
    facturas,
    productosFactura
}