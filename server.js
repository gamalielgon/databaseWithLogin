const mongoose = require("mongoose");
const express = require("express");
const route = require("./routes/person.js"); //Ahora para tener un archivo server mas limpio se establece la ruta del archivo person el cual contendra una direccion a la cual se dirigira al iniciar el server


mongoose.Promise = global.Promise;
const app = express();
app.use("/assets", express.static(__dirname + "/public"));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(route); // Ejecutamos el enrutador


//usuario GamAdmin  Password Admin
mongoose.connect(
  `mongodb+srv://GamAdmin:Admin@taquitospastor.b6tgoqw.mongodb.net/`,
  /*Se ingresa el codigo de conexion del mongodb y se le remplaza el nombre de usuario y la contraseña*/ {
    useNewUrlParser: true,  
    useUnifiedTopology: true,
  }
);


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully"); //Al conectarse exitosamente enviara el anterior mensaje
});


//iniciar con "npx nodemon server"
app.listen(3000);