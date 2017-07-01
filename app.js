"use strict";
var FactDAO = require('./Integracion/FactoriaDAO');
var TUsuario = require('./Negocio/TUsuario');
var TPartida = require('./Negocio/TPartida');
var config = require("./Integracion/config");
var path = require('path');
var express = require('express');
var app = express(); //Llamamos a express() cuando queremos una app nueva.
var morgan = require("morgan"); //Morgan nos muestra las peticiones por consola.
var bodyParser = require("body-parser"); //Middleware que obtiene el cuerpo de la petición HTTP para interpretar su contenido.
var session = require("express-session");

//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_

/*==========
 Middleware
 ==========*/
//Configuración de sesiones.
var middlewareSession = session({
    saveUninitialized: false,
    secret: "mySecretSession",
    resave: false
});


/**
 * 
 * @param {type} request
 * @param {type} response
 * @param {type} next
 * @returns {undefined}
 */
function is_login(request, response, next) {
    if (request.session.usuario) {
        request.mi_llave = true;
        request.mi_usuario = request.session.usuario;
    } else {
        request.mi_llave = false;
        request.mi_usuario = "NO LOGIN";
    }
    //Saltamos al siguiente middleware.
    next();
}

//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_

/*==========
 CONFIG APP
 ==========*/

//Vamos a configurar el objeto aplicación mediante el método set() y así le indicamos que motor de plantillas vamos a utilizar.
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(middlewareSession);

//Configuración para ficheros estáticos.
var ficherosEstaticos = path.join(__dirname, "public");
app.use(express.static(ficherosEstaticos));

//Configuración de routers.
var Router_Usuarios = require("./Negocio/SAusuarios");
app.use("/usuarios", Router_Usuarios);
var Router_Partidas = require("./Negocio/SApartidas");
app.use("/partidas", Router_Partidas);
//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_


//Ejemplo de manejador de errores.
app.get("/usuarios.html", function(request, response, next) {
    next("Erroraco"); //Aquí debería de mandarse el objeto error.
});

//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_

// ======================
//         MAIN
// ======================
//
app.get("/", function(request, response) {
    response.redirect("/index.html");
});

app.get("/index.html", is_login, function(request, response) {
    response.status(200);
    response.render("index", { llave: request.mi_llave, nick: request.mi_usuario });
});


//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_

/** Middleware Error 404
 * 
 */
app.use(function(request, response, next) {
    response.status(404);
    response.render("error_404", { url: request.url });
});


/** middleware error.
 * 
 */
app.use(function(error, request, response, next) {
    response.status(500);
    response.render("error", {
        mensaje: error.message,
        pila: error.stack
    });
});

//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_

//Arrancamos el servidor.

app.listen(config.port, function() {
    console.log("Servidor arrancado en el puerto " + config.port);
});
