const mongoose = require("mongoose");
let PersonSchema = new mongoose.Schema({
  nombre: String,
  edad: Number,
  tipoSangre: String,
  nss: String,
  cargo: String,
  cel: Number,
}); // Dentro de mongodb crea una coleccion en la cual permitira al usuario registar un nuevo objeto el cual tiene cuatro llaves las cuales son nombre, edad, tipoSangre, nss y al ejecutar el la base de datos de mongo permitira observar los objetos de la coleccion en la pagina que se encuentra en el puerto 3000


module.exports = mongoose.model("Person", PersonSchema);