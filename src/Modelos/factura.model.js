'use strict'

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var facturaSchema = Schema({
    usuario: {type: Schema.Types.ObjectId, ref: 'usuario'},

    compras: [{
        compraProducto: {type: Schema.Types.ObjectId, ref: 'producto'},
        nombre: String,
        cantidad: Number
    }]
});

module.exports = mongoose.model('factura', facturaSchema);