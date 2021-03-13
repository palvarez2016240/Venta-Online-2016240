const mongoose = require("mongoose")
const app = require("./app")
var controladorAdmin = require("./src/Controladores/usuario.controlador");

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/dbVenta', { useNewUrlParser: true , useUnifiedTopology: true }).then(()=>{
    console.log('Bienvenido!');

    controladorAdmin.admin();

    app.listen(3000, function (){
        console.log("Venta online corriendo");
    })
}).catch(err => console.log(err))