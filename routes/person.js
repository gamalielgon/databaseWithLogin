const express = require("express");
const router = express.Router();
//Ejecutamos una extencion de express donde enviara como enrutar al archivo server.js
const session = require("express-session");
let Person = require("../models/person");
let Veggies = require("../models/veggies");
const ejs = require('ejs');
var logged = false;
var userS = null;

const app = express();

// Configurar middleware para analizar las solicitudes JSON y codificar las URL
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

// pass = "!s983a7VL"
// admin = "8&EEN!cBTbazuZoA"
const users = [
  {username: "Admin", hashedPassword: "6c5d300dab34d566022ef043a8d69580", permission: true},
  {username: "User", hashedPassword: "0cc99c87ff74dc80630547673ad4be06", permission: false},
];

// Middleware para verificar la autenticación del usuario
function requireLogin(req, res, next) {
  if (logged) {
    // El usuario ha iniciado sesión correctamente
    next();
  } else {
    // El usuario no ha iniciado sesión, redirigir al formulario de inicio de sesión
    res.redirect('/login');
  }
}

router.get("/", function (req, res) {
  if (logged) {
    // El usuario ha iniciado sesión correctamente
    res.render('main', { userS })
  } else {
    // El usuario no ha iniciado sesión, redirigir al formulario de inicio de sesión
    res.redirect('/login');
  }

}); //Se crea una ruta raiz para cuando ingrese al localhost y esta ejecuta el index.ejs

// Ruta para mostrar el formulario de inicio de sesión
router.get("/login", function (req, res) {
  
  res.render("login");
});

// Ruta para manejar el envío del formulario de inicio de sesión
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Buscar al usuario en la base de datos
  const user = users.find(user => user.username === username);

  if (!user) {
    // Usuario no encontrado
    return res.render('login', console.log("usuarioMalo"));
  } else if (password !== user.hashedPassword) {
    // Contraseña incorrecta
    console.log(password + " != " + user.hashedPassword);
    return res.render('login', console.log('Credenciales inválidas'));
  } else {
    // Inicio de sesión exitoso
    //res.render('success', { username });
    userS = user
    logged = true;
    res.redirect('/');//
  }
});

// Ruta para listar personas
router.get("/listPerson", requireLogin, (req, res, next) => {
  if (userS!==null){
    Person.find(function (err, person) {
    if (err) return next(err);
    //res.json(person); Ahora en lugar de renderizar el json de person
    res.render("personIndex", { person, userS }); //Ejecutara el archivo 'personIndex' y tambien le envia el json
    });
  } else {
    res.redirect("/login");
  }

});//Se crea la ruta para ver el listo de registros en la coleccion

router.get("/listVeggie", requireLogin, (req, res, next) => {
  if (userS!==null){
    Veggies.find(function (err, veggie) {
    if (err) return next(err);
    res.render("veggieIndex", { veggie, userS }); 
    });
  } else {
    res.redirect("/login");
  }

});

router.get("/addPerson", requireLogin, function (req, res) {
  if(userS.permission) {
  res.render("person");
  } else {
    res.redirect("/login");
  }
}); //Se crea el render con el objetivo poder ver el formulario donde podremos enviar los datos

router.post("/addPerson", requireLogin, function (req, res) {
  if(userS.permission){
    const myPerson = new Person({
    nombre: req.body.nombre,
    edad: req.body.edad,
    tipoSangre: req.body.tipoSangre,
    nss: req.body.nss,
    cargo: req.body.cargo,
    cel: req.body.cel,
  }); //Se creo una nueva identidad para que permita agregar a un nuevo objeto en el coleccion de MongoDB
  myPerson.save();
  res.redirect("/listPerson");
  } else {
    res.redirect("/login");
  }
  
});

router.get("/addVeggie", requireLogin, function (req, res) {
  if(userS.permission) {
  res.render("veggieAdd");
  } else {
    res.redirect("/login");
  }
}); //Se crea el render con el objetivo poder ver el formulario donde podremos enviar los datos

// Se crea una ruta a la cual va a poder acceder el servidor para poder observar la colecion
router.post("/addVeggie", requireLogin, function (req, res) {
  if(userS.permission){
    const myVeggies = new Veggies({
    nombreV: req.body.nombreV,
    cantidad: req.body.cantidad,
    proveedor: req.body.proveedor,
  }); //Se creo una nueva identidad para que permita agregar a un nuevo objeto en el coleccion de MongoDB
  myVeggies.save();
  res.redirect("/listVeggie");
  } else {
    res.redirect("/login");
  }
  
});

//DELETE PERSON - findByIdAndRemove
router.get("/deletePerson/:id", requireLogin, function (req, res, next) {
  if(userS.permission){
    Person.findByIdAndRemove(req.params.id, req.body, function (err, post) {
      if (err) return next(err); // Se crea la funcion la cual encontrara y eliminara el objeto deseado
      res.redirect("/listPerson"); // Se recarga la pagina para actualizarse
    });
  } else {
    res.redirect("/login");
  }
});

router.get("/deleteVeggie/:id", requireLogin, function (req, res, next) {
  if(userS.permission){
    Veggies.findByIdAndRemove(req.params.id, req.body, function (err, post) {
      if (err) return next(err); // Se crea la funcion la cual encontrara y eliminara el objeto deseado
      res.redirect("/listVeggie"); // Se recarga la pagina para actualizarse
    });
  } else {
    res.redirect("/login");
  }
});

//SEARCH PERSONS
router.get('/search', requireLogin, (req, res, next) => {
  if(userS!=null){
     const searchTerm = req.query.term;
    Person.find({ nombre: { $regex: searchTerm, $options: 'i' } }, (err, persons) => {
    if (err) return next(err);
    res.render('personIndex', { person: persons, userS });
  });
  } else {
    res.redirect("/login");
  }
});

//SEARCH PERSONS
router.get('/veggieSearch', requireLogin, (req, res, next) => {
  if(userS!=null){
     const searchTerm = req.query.term;
    Veggies.find({ nombreV: { $regex: searchTerm, $options: 'i' } }, (err, veggies) => {
    if (err) return next(err);
    res.render('veggieIndex', { veggie: veggies, userS });
  });
  } else {
    res.redirect("/login");
  }
});


//EDIT PERSON - findById
router.get("/findById/:id", function (req, res, next) {
  if(userS.permission){
    Person.findById(req.params.id, function (err, person) {
      if (err) return next(err); // Se crea la funcion la cual encontrara y se redirigira a la pagina de edicion
      res.render("personUpdate", { person }); //Renderiza la pagina de edicion
    });
  } else {
    res.redirect("/login");
  }
});

router.post("/updatePerson", function (req, res, next) {
  if(userS.permission){
    Person.findByIdAndUpdate(
    req.body.objId,
    {
      nombre: req.body.nombre,
      edad: req.body.edad,
      tipoSangre: req.body.tipoSangre,
      nss: req.body.nss,
      cargo: req.body.cargo,
      cel: req.body.cel,
    }, //Actualiza la base de datos con lo editado en la pagina
    function (err, post) {
      if (err) return next(err);
      res.redirect("/listPerson");
    }
  ); //Se redirige a la pagina de la tabla actualizada
  } else {
    res.redirect("/login");
  }
  
});

router.get("/findByIdVeggie/:id", function (req, res, next) {
  if (userS.permission) {
    Veggies.findById(req.params.id, function (err, veggie) {
      if (err) return next(err);
      res.render("veggieUpdate", { veggie });
    });
  } else {
    res.redirect("/login");
  }
});

router.post("/updateVeggie", function (req, res, next) {
  if (userS.permission) {
    Veggies.findByIdAndUpdate(
      req.body.objId,
      {
        nombreV: req.body.nombreV,
        cantidad: req.body.cantidad,
        proveedor: req.body.proveedor,
      }, //Actualiza la base de datos con lo editado en la pagina
      function (err, post) {
        if (err) return next(err);
        res.redirect("/listVeggie");
      }
    ); //Se redirige a la pagina de la tabla actualizada
    } else {
      res.redirect("/login");
    }
    
});







//***** */

router.post('/logout', (req, res) => {
  // Perform the necessary actions to log out the user and update the variable
  // For example, if you have a variable called `loggedInUser`, you can update it like this:
  logged= false;
  userS = null;
  // You can also perform any other necessary logout actions here

  // Send a response indicating the variable update was successful
  res.redirect('/login');
});


module.exports = router;