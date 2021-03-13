'use strict'

var producto = require("../modelos/producto.model");
var categoria = require("../modelos/categoria.model");
var stockProducto;

function registrarProducto(req, res) {
    var productoModel = producto();
    var params = req.body;
    var idCategoria = req.params.id;
    var nombreCategoria;

    if (req.user.rol != "ROL_ADMIN") {
        return res.status(500).send({ mensaje: "Solo el admin pueden crear el productp" })
    } else {
        if (params.nombre && params.stock) {
            if(params.stock <= 0){
                return res.status(500).send({mensaje: 'No puedes agregar un stock menor o igual a 0'})
            }
            categoria.findOne({_id: idCategoria}).exec((err, categoriaEncontrada)=>{
                if(err) return res.status(500).send({mensaje: 'Error en la peticion, talvez no existe la categoria'});
                if(!categoriaEncontrada) return res.status(500).send({mensaje: 'Error, talvez categoria no existe'})
                if(categoriaEncontrada && categoriaEncontrada.length === 0) return res.status(500).send({mensaje: 'La categoria no existe'});
                nombreCategoria = categoriaEncontrada.nombre;
        
                if(nombreCategoria === 'Default') return res.status(500).send({mensaje: 'No puedes agregar un producto a la categoria por Default'})
            
            productoModel.nombre = params.nombre;
            productoModel.stock = params.stock;
            productoModel.categoriaProducto = idCategoria;
            productoModel.ventas = 0;

            producto.find({ 
                $or: [
                    {nombre: productoModel.nombre},
                ]
            }).exec((err, productoEncontrada) => {
                    if (err) return res.status(500).send({ mensaje: "error en la peticion de producto" });
                    if (productoEncontrada && productoEncontrada.length >= 1) {
                        return res.status(500).send({ mensaje: "El producto ya existe " });
                    } else {
                        productoModel.save((err, productoGuardadada) => {
                            if (err) return res.status(500).send({ mensaje: "Error en la peticion del producto" });
                            if (productoGuardadada) {
                                res.status(200).send({ productoGuardadada })
                            } else {
                                res.status(404).send({ mensaje: "No se a podido guardar el producto" })
                            }
                        })
                    }
                }
            )
        })
        }else{
            return res.status(500).send({mensaje: 'Error en la peticion, posiblemte parametros incorrectos'});
        }
    }
}

function buscarNombreProducto(req, res) {
    var params = req.body;
    
    if(!params.nombre){
        return res.status(500).send({mensaje: 'Parametros incorrectoa'});
    }

    producto.findOne({ nombre: params.nombre},{_id:0, __v:0}).exec((err, encontrados) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion obtener el producto, talvez no existe el producto" });
        if(!encontrados) return res.status(500).send({mensaje: 'Error, no existe el producto'});
        return res.status(200).send(encontrados);
    })
}

function Producto(req, res) {
    producto.find({},{_id:0, __v:0}).exec((err, productoEncontrada)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion de obtener productos'});
        if(!productoEncontrada) return res.status(500).send({mensaje: 'Error en la consulta de productos o no tiene datos'});
        return res.status(200).send({productoEncontrada});
    })
}

function editarProducto(req, res) {
    var idProducto = req.params.id;
    var params = req.body;
    var productoModel = producto();

    delete params.stock;
    delete params.ventas;
    delete params.producto;

    if(!params.nombre){
        return res.status(500).send({mensaje: 'No hay ningun parametro correcto para editar'});
    }

    if (req.user.rol != "ROL_ADMIN")
        return res.status(500).send({ mensaje: "Solo el ADMIN puede modificar esto" })

    producto.find({ nombre: params.nombre })
        .exec((err, productoEncontrada) => {
            if (err) return res.status(500).send({ mensaje: "error en la peticion de producto" });
            if (productoEncontrada && productoEncontrada.length >= 1) {
                return res.status(500).send({ mensaje: "La producto ya existe " });
            }else{
                producto.findOne({ _id: idProducto}).exec((err, productoEncontrada) => {
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion obtener la producto, talvez no existe la producto" });
                    if (!productoEncontrada) return res.status(500).send({ mensaje: "Error en la peticion editar o no existe el producto" });
                        producto.findByIdAndUpdate(idProducto, params, { new: true }, (err, productoactualizada) => {
                            if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
                            if (!productoactualizada) return res.status(500).send({ mensaje: "No se ha podido editar  la producto" });
                            if (productoactualizada) {
                                return res.status(200).send({ productoactualizada });
                            }
                         }
                    )}
                )
            }
    })
}

function editarStock(req, res) {
    var idProducto = req.params.id;
    var params = req.body;
    var productoModel = producto();

    delete params.nombre;
    delete params.ventas;
    delete params.Categoriaproducto;

    if(!params.stock){
        return res.status(500).send({mensaje: 'No hay ningun parametro correcto para editar'});
    }

    if (req.user.rol != "ROL_ADMIN")
        return res.status(500).send({ mensaje: "Solo el ADMIN puede modificar esto" })

        if(params.stock <= '0'){
            return res.status(500).send({mensaje: 'No puedes poner 0 de stock o menos'})
        }

        producto.findOne({ _id: idProducto}).exec((err, productoEncontrado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion obtener la producto, talvez no existe la producto" });
            if (!productoEncontrado) return res.status(500).send({ mensaje: "Error en la peticion editar o el producto no existe" });
            parseInt(stockProducto = productoEncontrado.stock)

            var totalStock = stockProducto + parseInt(params.stock);
            producto.updateOne({_id: idProducto}, {
                $set: {
                    stock: totalStock,
                }}, {new: true}, (err, productoActualizado) =>{
                   if(err) return res.status(500).send({mensaje: 'Error al actualizar el producto'});
                    if(!productoActualizado) return res.status(500).send({mensaje: 'El producto no existe'});
                })  
            
                producto.findOne({ _id: idProducto}, {_id:0, categoriaProducto:0, ventas:0, __v:0}).exec((err, productosEncontrados) => {
                    return res.status(200).send({mensaje: 'El stock fue sumado al exsistente', productosEncontrados});
                })
    })
}

function eliminarProducto(req, res) {
    var idProducto = req.params.id;
    var params = req.body;

    if (req.user.rol != "ROL_ADMIN")
        return res.status(500).send({ mensaje: "Solo el admin puede elimnar" })

    producto.findOne({ _id: idProducto}).exec((err, productoEncontrada) => {
         if (err)
              return res.status(500).send({ mensaje: "Error en la peticion de elimnar el producto, posiblemte datos incorrectos" });
         if (!productoEncontrada)
              return res.status(500).send({ mensaje: "Error en la perticion, datos incorrectos o no existe el producto" });       
             producto.findByIdAndDelete(idProducto, (err, productoEliminado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
            if (!productoEliminado) return res.status(500).send({ mensaje: "No se ha podido eliminar la producto" });
            if (productoEliminado) {
                return res.status(200).send({productoEliminado});
            }
           })
     })
}

function buscarProductoCategoria(req, res) {
    var params = req.body;
    var idCategoria;
    
    if(req.user.rol != 'ROL_CLIENTE') 
        return res.status(500).send({mensaje: 'Solo el cliente puede ver esto'})
    
    if(!params.nombre)
        return res.status(500).send({mensaje: 'Parametros incorrectos'});

    categoria.findOne({nombre: params.nombre}).exec((err, categoriaEncontrada)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion de obtener productos'});
        if(!categoriaEncontrada) return res.status(500).send({mensaje: 'La categoria no existe'});
        idCategoria = categoriaEncontrada._id;

        producto.find({categoriaProducto: idCategoria},{_id:0, categoriaProducto:0, __v:0}).exec((err, productoEncontrado)=>{
            if(err) return res.status(500).send({mensaje: 'Error al buscar el producto'});
            if(!productoEncontrado) return res.status(500).send({mensaje: 'No hay ningun producto en esa categoria'});
            if(productoEncontrado && productoEncontrado.length === 0) return res.status(500).send({mensaje: 'No hay ningun producto en esa categoria'})
            return res.status(200).send({productoEncontrado});
        })
    })
}

function productosAgotados(req, res) {
    if(req.user.rol != 'ROL_ADMIN')
        return res.status(500).send({mensaje: 'Solo el ADMIN puede ver esto'})

    producto.find({stock: 0}, {_id:0, ventas:0, categoriaProducto:0, __v:0}).exec((err, productoEncontrados)=>{
        if(err) return res.status(500).send({mensaje: 'Error al buscar los productoa'});
        if(!productoEncontrados) return res.status(500).send({mensaje: 'No se pudo encontrar los productos'});
        if(productoEncontrados && productoEncontrados.length === 0){
            return res.status(500).send({mensaje: 'No hay ningun producto agotado'})}
        return res.status(200).send({productoEncontrados});
    })
}

function productosMasVendidos(req, res) {
    producto.find({ventas: {$gt:1}},
        {_id: 0, stock: 0, categoriaProducto:0, __v: 0}).sort({ventas: -1}).limit(3).exec((err, productosEncontrados)=>{
        if(err) return res.status(500).send({mensaje: 'Erro en buscar los productos'});
        if(!productosEncontrados) return res.status(500).send({mensaje: 'No hay ventas'});
        if(productosEncontrados && productosEncontrados.length === 0) return res.status(500).send({mensaje: 'No hay ventas sufucientes'})
        return res.status(200).send({productosEncontrados});
    })
}

module.exports = {
    registrarProducto,
    buscarNombreProducto,
    Producto,
    editarProducto,
    editarStock,
    eliminarProducto,
    buscarProductoCategoria,
    productosAgotados,
    productosMasVendidos
}