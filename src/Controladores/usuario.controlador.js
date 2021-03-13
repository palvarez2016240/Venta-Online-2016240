'use strict'

var usuario = require("../modelos/usuario.model");
var bcrypt = require('bcrypt-nodejs');
var jwt = require("../Servicios/jwt");
var factura = require("../modelos/factura.model");
var idUsuario;

function registrarUsuario(req, res) {
    var usuarioModel = new usuario();
    var params = req.body;

    if(params.nombre === 'ADMIN' && params.password === '123456'){
        return res.status(500).send({mensaje: 'El usuario ya existe'})
    }

    if(params.nombre && params.password){
        usuarioModel.nombre = params.nombre;
        usuarioModel.rol = 'ROL_CLIENTE'

        usuario.find({ 
            $or: [
                {nombre: usuarioModel.nombre},
            ]
        }).exec((err, usuarioEncontrado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion del usuario" });
            if (usuarioEncontrado && usuarioEncontrado.length >= 1) {
            return res.status(500).send({ mensaje: "El usuario ya existe " });
            } else {
                bcrypt.hash(params.password, null, null, (err, passwordEncriptada) => {
                usuarioModel.password = passwordEncriptada;

                usuarioModel.save((err, usuarioGuardado) => {
                if (err) return res.status(500).send({ mensaje: "Error en la peticion del usuario" });
                if (usuarioGuardado) {
                res.status(200).send({ usuarioGuardado })
                } else {
                res.status(404).send({ mensaje: "No se a podido guardar el usuario" })
                }
            })
         })
       }
     })
    }else{
        return res.status(500).send({mensaje: 'Error en la peticion, posiblemte datos incorrectos'});
    }
}

function loginUsuario(req, res) {
    var params = req.body;

    if(params.nombre && params.password){
    usuario.findOne({ nombre: params.nombre }, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'error en la peticion' });
        if(!usuarioEncontrado) return res.status(500).send({mensaje: 'El usuario no existe'})
        idUsuario = usuarioEncontrado._id;
        if (usuarioEncontrado) {
            factura.find({usuario: idUsuario},{_id:0, usuario:0, __v: 0}).exec((err, facturaEncontrada)=>{
                if(err) return res.status(500).send({mensaje: 'Error al buscar la factura'});
                if(!facturaEncontrada) return res.status(500).send({mensaje: 'Error al buscar la factura'});
               if(facturaEncontrada && facturaEncontrada.length === 0) facturaEncontrada = 'No hay compras realizadas';

            bcrypt.compare(params.password, usuarioEncontrado.password, (err, passVerificada) => {
                if (passVerificada) {
                if (params.getToken === 'true') {
                if(usuarioEncontrado.rol === 'ROL_CLIENTE'){
                    return res.status(200).send({
                        token: jwt.createToken(usuarioEncontrado), facturaEncontrada
                    })
                }else{
                    return res.status(200).send({
                    token: jwt.createToken(usuarioEncontrado)})
                }
            } else {
                usuarioEncontrado.password = undefined;
                return res.status(200).send({ usuarioEncontrado });
            }
            } else {
                return res.status(500).send({ mensaje: 'El cliente no se ha podido identificar, posiblemte contraseña incorrecta' });
            }
        })
    })
    }else {
        return res.status(500).send({ mensaje: 'Error al buscar el cliente no existe' });
    }
    })
}else{
    return res.status(500).send({mensaj: 'Parametro incompletos o incorrectos'});
}
}

function editarUsuario(req, res) {
    var idUsuario = req.params.id;
    var params = req.body;
    var usuarioModel = usuario();
    
    
    if(!params.nombre && !params.rol){
        return res.status(500).send({mensaje: 'No hay ningun parametro correcto para editar'});
    }

    if(req.user.sub != idUsuario){
        if (req.user.rol != "ROL_ADMIN")
            return res.status(500).send({ mensaje: "Solo el ADMIN o la misma se puede modificar"  })   
    }

    if(params.rol && params.rol != 'ROL_ADMIN' && params.rol != 'ROL_CLIENTE')
        return res.status(500).send({mensaje: 'El rol ingresado no es valido'})
        
    usuario.find({ nombre: params.nombre })
        .exec((err, usuarioEncontrado) => {
            if (err) return res.status(500).send({ mensaje: "error en la peticion de usuario" });
            if (usuarioEncontrado && usuarioEncontrado.length >= 1) {
                return res.status(500).send({ mensaje: "El usuario ya existe " });
            }else{
                usuario.findOne({ _id: idUsuario}).exec((err, usuarioEncontrado) => {
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion obtener la usuario, talvez no existe la usuario" });
                    if (!usuarioEncontrado) return res.status(500).send({ mensaje: "Error en la peticion, no existe el usuario" });
                    if(usuarioEncontrado.rol === 'ROL_ADMIN') return res.status(500).send({mensaje: 'El usuario no se puede editar porque es un ADMIN'})
                        usuario.findByIdAndUpdate(idUsuario, params, { new: true }, (err, usuarioactualizada) => {
                            if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
                            if (!usuarioactualizada) return res.status(500).send({ mensaje: "No se ha podido editar  la usuario" });
                            if (usuarioactualizada) {
                                return res.status(200).send({ usuarioactualizada });
                            }
                         }
                    )}
                )
            }
    })
}

function eliminarUsuario(req, res) {
    var idUsuario = req.params.id;
    var params = req.body;

    if(req.user.sub != idUsuario){
        if (req.user.rol != "ROL_ADMIN")
            return res.status(500).send({ mensaje: "Solo el admin o la misma se puede elimnar" })
    }

    usuario.findOne({ _id: idUsuario}).exec((err, usuarioEncontrado) => {
         if (err)
              return res.status(500).send({ mensaje: "Error en la peticion de elimnar la usuario, posiblemte datos incorrectos" });
         if (!usuarioEncontrado)
              return res.status(500).send({ mensaje: "Error en la perticion, el usuario no existe" });
        if(usuarioEncontrado.rol === 'ROL_ADMIN') return res.status(500).send({mensaje: 'El usuario no se puede eliminar porque es un ADMIN'})
            
            usuario.findByIdAndDelete(idUsuario, (err, usuarioEliminado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
            if (!usuarioEliminado) return res.status(500).send({ mensaje: "No se ha podido eliminar el usuario" });
            if (usuarioEliminado) {
                return res.status(200).send({usuarioEliminado});
            }
           }
        )
     })
}

function admin(req, res, codigo) {
    var usuarioModel = new usuario();

    usuario.findOne({nombre: 'ADMIN'}).exec((err, adminEncontrado)=>{
        if(!adminEncontrado){
            usuarioModel.nombre = 'ADMIN';
            usuarioModel.password = '123456';
            usuarioModel.rol = 'ROL_ADMIN'

        bcrypt.hash('123456', null, null, (err, passwordEncriptada) => {usuarioModel.password = passwordEncriptada;
    
        usuarioModel.save((err, usuarioGuardado) => {
            if(err) return res.status(500).send({mensaje: 'Error en la peticion de guardar admin'});
            if(usuarioGuardado){ 
            }else{res.status(404).send({mensaje: 'No se ha podido registrar el cliente'})
        }
        })
    })
        }        
    })
    
}

module.exports = {
    registrarUsuario,
    loginUsuario,
    editarUsuario,
    eliminarUsuario,
    admin
}