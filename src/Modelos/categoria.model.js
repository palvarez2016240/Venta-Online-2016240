'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var categoriaSchema = Schema({
    nombre: String,
    rol: String
});

module.exports = mongoose.model('categoria', categoriaSchema);