'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var productoSchema = Schema({
    nombre: String,
    stock: Number,
    ventas: Number,
    categoriaProducto: {type: Schema.ObjectId, ref: 'categoria'}
});

module.exports = mongoose.model('producto', productoSchema);