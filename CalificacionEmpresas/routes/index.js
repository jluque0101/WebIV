var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var assert = require("assert");
/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('index', { title: 'Express' });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello, World!' });
});

/* GET Alumnos. */
router.get('/alumnos', function(req, res) {
    var db = req.db;
    var collection = db.get('alumnos');
    var collection2 = db.get('empresa');

    assert(collection, "Coleccion alumnos");
    assert(collection2, "Coleccion empresas");

    collection.find({},{},function(e,docs){

      collection2.find({}, { sort : { "puntuacion" : -1 }},
        function (err, emp){
          console.log(emp);
          res.render('alumnos', {
              "alumnos" : docs,
              "empresas" : emp,
              "usuario" : req.session.usuario
          });
      });
    });

    console.log("Acceso a BD correcto");

});

/* GET Nuevo alumno. */
router.get('/nuevoalumno', function(req, res) {
    var db = req.db;
    var collection = db.get('empresa');
    collection.find({},{},function(e,docs){
        res.render('nuevoalumno', {
            "title" : "Nuevo Alumno",
            "empresa" : docs
        });
    });
});

/* GET Nueva empresa. */
router.get('/nuevaempresa', function(req, res) {
    res.render('nuevaempresa', {
        "title" : "Nueva empresa"
    });
});

/* POST nueva empresa */
router.post('/nuevaempresa', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var nombreEmpresa = req.body.nombre;

    // Set our collection
    var collection = db.get('empresa');

    // Submit to the DB
    collection.insert({
        "nombre" : nombreEmpresa,
        "puntuacion" : 0
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.redirect("alumnos");

        }
    });
});

/* POST to Add User Service */
router.post('/nuevoalumno', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var nombreAlumno = req.body.nombre;
    var passAlumno = req.body.password;
    var empresaAlumno = req.body.listaempresas;
    var idEmpresa = new ObjectID(empresaAlumno);

    // Set our collection
    var collection = db.get('alumnos');

    // Submit to the DB
    collection.insert({
        "nombre" : nombreAlumno,
        "password" : passAlumno,
        "empresa" : idEmpresa
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            req.session.alumno=nombreAlumno;
            res.redirect("alumnos");

        }
    });
});

/* GET to votar */
router.get('/votar', function(req, res) {
    if(req.session.usuario){
      var db = req.db;

      var collection = db.get('alumnos');

      res.render('votar', { usuario: req.session.usuario})
    }else{
      res.render('votar');
    }
});

router.post('/votar', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    var collection = db.get('empresa');

    // Set our collection
    var idEmpresa = new ObjectID(req.session.empresa);

    // console.log(idEmpresa);
    //
    // console.log(req.body.voto);
    //
    // collection.update(
    //   { "_id" : idEmpresa }, { $inc : { "puntuacion" : req.body.voto } },
    //     function(e,empresa){
    //       console.log(empresa);
    // });

    console.log(req.body.voto);
    console.log(req.session.empresa);

    var nota = req.body.voto;

    collection.update({ "_id" : idEmpresa},
      { "$inc" : { "puntuacion" : Number(nota) } },
      function(err,data){
      if (err){
          console.log(err);
      }else{
          console.log("score succeded");
          res.redirect("alumnos");
      }
  });


});

/* GET to login */
router.get('/login', function(req, res) {
    if(req.session.usuario)
      res.render('login', { title: 'Logout', usuario: req.session.usuario})
    else
      res.render('login', { title: 'Login' });
});

/* POST Sign in */
router.post('/login', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    var collection = db.get('alumnos');

    // Get our form values. These rely on the "name" attributes
    var nombreAlumnoIntroducido = req.body.nombre;
    var passAlumnoIntroducida = req.body.password;

    // Set our collection
    collection.findOne({ "nombre" : nombreAlumnoIntroducido,
      "password" : passAlumnoIntroducida }, function(e,alumno){

        if(alumno == null){
          res.render('login', { title: 'Login' });
        }else{
          if(alumno.nombre == nombreAlumnoIntroducido && alumno.password == passAlumnoIntroducida){
            req.session.usuario = nombreAlumnoIntroducido;
            req.session.empresa = alumno.empresa;
            res.redirect("alumnos");
          }
        }
    });

    // Submit to the DB


});

router.post('/logout', function(req, res) {

    // Set our internal DB variable

    req.session.destroy();
    res.redirect("alumnos");

    // Submit to the DB


});


module.exports = router;
