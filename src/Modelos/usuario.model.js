'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var usuarioSchema = Schema({
    nombre: String,
    rol: String,
    password: String
});

module.exports = mongoose.model('usuario', usuarioSchema);