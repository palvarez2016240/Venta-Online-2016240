'use strict'

var categoria = require("../modelos/categoria.model");
var producto = require("../modelos/producto.model");
var idDefault;

function registrarCategoria(req, res) {
    var categoriaModel = categoria();
    var params = req.body;

    if (req.user.rol != "ROL_ADMIN") {
        return res.status(500).send({ mensaje: "Solo el admin pueden crear la categoria" })
    } else {
        if (params.nombre) {
            categoriaModel.nombre = params.nombre;
            categoriaModel.rol = 'ROL_CATEGORIA';

            categoria.find({ nombre: categoriaModel.nombre })
                .exec((err, categoriaEncontrada) => {
                    if (err) return res.status(500).send({ mensaje: "error en la peticion de categoria" });
                    if (categoriaEncontrada && categoriaEncontrada.length >= 1) {
                        return res.status(500).send({ mensaje: "La categoria ya existe " });
                    } else {
                        categoriaModel.save((err, categoriaGuardadada) => {
                            if (err) return res.status(500).send({ mensaje: "Error en la peticion de la categoria" });
                            if (categoriaGuardadada) {
                                res.status(200).send({categoriaGuardadada})
                            } else {
                                res.status(404).send({ mensaje: "No se a podido guardar la categoria" })
                            }
                        }
                     )
                    }
                }
            )
            categoriaDefault();
        }else{
            return res.status(500).send({mensaje: 'Error en la peticion, posiblemte datos incorrectos'});
        }
    }
}

function categorias(req, res) {
    categoria.find({},{_id:0, rol:0, __v:0}).exec((err, categoriaEncontrada)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion de obtener categoria'});
        if(!categoriaEncontrada) return res.status(500).send({mensaje: 'Error en la consulta de categoria o no tiene datos'});
        return res.status(200).send({categoriaEncontrada});
    })
}

function editarCategoria(req, res) {
    var idCategoria = req.params.id;
    var params = req.body;
    var categoriaModel = categoria();

    delete params.rol;

    if(!params.nombre){
        return res.status(500).send({mensaje: 'No hay ningun parametro correcto para editar'});
    }

    if (req.user.rol != "ROL_ADMIN")
        return res.status(500).send({ mensaje: "Solo el ADMIN puede modificar esto" })

    categoria.find({ nombre: params.nombre })
        .exec((err, categoriaEncontrada) => {
            if (err) return res.status(500).send({ mensaje: "error en la peticion de categoria" });
            if (categoriaEncontrada && categoriaEncontrada.length >= 1) {
                return res.status(500).send({ mensaje: "La categoria ya existe " });
            }else{
                categoria.findOne({ _id: idCategoria}).exec((err, categoriaEncontrada) => {
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion obtener la categoria, talvez no existe la categoria" });
                    if (!categoriaEncontrada) return res.status(500).send({ mensaje: "Error en la peticion editar, la categoria no existe" });
                    if(categoriaEncontrada.nombre === 'Default') return res.status(500).send({mensaje: 'No puedes editar la categoria Default'})
                        categoria.findByIdAndUpdate(idCategoria, params, { new: true }, (err, categoriaactualizada) => {
                            if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
                            if (!categoriaactualizada) return res.status(500).send({ mensaje: "No se ha podido editar  la categoria" });
                            if (categoriaactualizada) {
                                return res.status(200).send({ categoriaactualizada });
                            }
                         }
                    )}
                )
            }
    })
}

function eliminarCategoria(req, res) {
    var categoriaModel = categoria();
    var idCategoria = req.params.id;
    var params = req.body;

    buscarId();

    if (req.user.rol != "ROL_ADMIN")
        return res.status(500).send({ mensaje: "Solo el admin puede elimnar" })
    
    categoria.findOne({ _id: idCategoria}).exec((err, categoriaEncontrada) => {
         if (err)
              return res.status(500).send({ mensaje: "Error en la peticion de elimnar la categoira, posiblemte datos incorrectos" });
    
         if (!categoriaEncontrada)
              return res.status(500).send({ mensaje: "Error en la perticion, datos incorrectos o no existe la categoria " });
        if(categoriaEncontrada.nombre === 'Default') return res.status(500).send({mensaje: 'No puedes eliminar la categoria Default'})

        producto.updateMany({categoriaProducto: idCategoria}, {$set:{categoriaProducto: idDefault}},{multi:true}, (err,productoEditado)=>{
        if(err) return res.status(500).send({mensaje: 'Error al poner los productos en Default'});
        if(!productoEditado) return res.status(500).send({mensaje: 'No hay datos'});
        })

        categoria.findByIdAndDelete(idCategoria, (err, categoriaEliminado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
        if (!categoriaEliminado) return res.status(500).send({ mensaje: "No se ha podido eliminar la categoria" });
        if (categoriaEliminado) {
            return res.status(200).send({categoriaEliminado});
        }
       })
     })
}

function buscarId(req, res) {
    categoria.findOne({ nombre: 'Default'}).exec((err, categoriaEncontrado) => {
        idDefault = categoriaEncontrado._id;
    })
}

function categoriaDefault(req, res) {
    var categoriaModel = new categoria();

    categoria.findOne({ nombre: 'Default'}).exec((err, categoriaEncontrado) => {
        if (!categoriaEncontrado){
            categoriaModel.nombre = 'Default';
            categoriaModel.rol = 'ROL_CATEGORIA';

            categoriaModel.save((err, categoriaGuardadada) => {
            })
        }
    })
}

module.exports = {
    registrarCategoria,
    categorias,
    editarCategoria,
    eliminarCategoria
}