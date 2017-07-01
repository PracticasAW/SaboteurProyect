"use strict";
var FactDAO = require('../Integracion/FactoriaDAO');
var TUsuario = require('./TUsuario');
var path = require('path');
var fs = require('fs');
var express = require('express');
var bodyParser = require("body-parser"); //Middleware que obtiene el cuerpo de la petición HTTP para interpretar su contenido.
var session = require("express-session");
var multer = require('multer'); //Modulo para subir ficheros 

//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_

/*==========
 Middleware
 ==========*/


/** Configuración de sesiones.
 * 
 * @type type
 */
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

var miRouter = express.Router();

miRouter.use(bodyParser.urlencoded({ extended: false }));
miRouter.use(middlewareSession);

//Configuración para ficheros estáticos.
var ficherosEstaticos = path.join(__dirname, "../public");
miRouter.use(express.static(ficherosEstaticos));

//Configuración de integracción.
var FactoriaDAO = new FactDAO();
var DAOUsuario = FactoriaDAO.creaDAOUsuario();

//Configuración de multer (subida de ficheros)
var multerFactory = multer({ storage: multer.memoryStorage() });


//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_


/** Ejemplo de manejador de errores.
 * 
 */
miRouter.get("/usuarios.html", function(request, response, next) {
    next("Erroraco"); //Aquí debería de mandarse el objeto error.
});

//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_

//*****************************************************************
//*****************************USUARIO*****************************
////***************************************************************


/** Petición que nos redirige a la ventana principal al acceder a la raiz.
 * 
 */
miRouter.get("/", is_login, function(request, response) {
    response.status(200);
    response.redirect("../index.html"); //OJO! LLamar a ventana principal de usuario.
});

// ======================
// APARTADO LOGIN USUARIO
// ======================


/** Petición ventana login usuario.
 * 
 */
miRouter.get("/login_usuario.html", is_login, function(request, response) {
    response.status(200);
    response.render("login_usuario", { llave: request.mi_llave, nick: request.mi_usuario, mensaje: "" });
});




/** Función encargada de comprobar que las credenciales del login introducidos por el jugador son correctos y logearle en el sistema si son correctos.
 * 
 */
miRouter.post("/comprobar_login.html", is_login, function(request, response) {
    console.log("Usuario introducido: " + request.body.usuario);
    console.log("Password introducida: " + request.body.password);
    DAOUsuario.login(request.body.usuario, request.body.password, function(error, respuesta) {
        if (error) {
            response.status(200);
            response.render("login_usuario", { llave: request.mi_llave, nick: request.mi_usuario, mensaje: error.message });
        } else {
            request.session.usuario = respuesta.nick;
            request.session.id_usuario = respuesta.id;
            response.redirect("../partidas/bienvenida.html#inicio");
        }
    });
});



// ========================
// APARTADO UNLOGIN USUARIO
// ========================


/** Función que deslogea a un jugador establecido del sistema.
 * 
 */
miRouter.get("/unlogin.html", is_login, function(request, response) {
    //Eliminamos la variable de sesion.
    if (request.session) {
        request.session.destroy();
    }
    response.redirect("../index.html");
});




// =========================
// APARTADO REGISTRO USUARIO
// =========================

/** Petición de la ventana 'crear un nuevo jugador'.
 * 
 */
miRouter.get("/nuevo_usuario.html", is_login, function(request, response) {
    response.status(200);
    response.render("nuevo_usuario", { llave: request.mi_llave, nick: request.mi_usuario, mensaje: "" });
});




/** Función encargada de registrar un nuevo jugador en el sistema.
 * 
 */
miRouter.post("/registrar_usuario.html", is_login, multerFactory.single("foto"), function(request, response) {
    console.log(request.body);
    var foto = null;
    //Comprobamos si existe ya un usuario que el nick que nos pasa.
    DAOUsuario.buscarUsuarioByNick(request.body.usuario, function(error, respuesta) {
        if (error) {
            response.render("nuevo_usuario", { llave: request.mi_llave, nick: request.mi_usuario, mensaje: error.message });
        } else {
            if (respuesta === undefined) {

                if (request.file) {
                    foto = request.file.buffer;
                }

                var usuarioNuevo = new TUsuario(undefined, request.body.usuario, request.body.password, request.body.nombre, request.body.sexo, foto, request.body.fecha_nacimiento);
                DAOUsuario.crearUsuario(usuarioNuevo, function(error, respuesta_2) {
                    if (error) {
                        response.render("nuevo_usuario", { llave: request.mi_llave, nick: request.mi_usuario, mensaje: error.message });
                    } else {
                        request.session.usuario = request.body.usuario;
                        request.session.id_usuario = respuesta_2;
                        response.redirect("../partidas/bienvenida.html#inicio");
                    }
                });
            } else {
                response.status(200);
                response.render("nuevo_usuario", { llave: request.mi_llave, nick: request.mi_usuario, mensaje: "Este usuario ya está registrado" });
            }

        }
    });
});

/**
 * 
 */
miRouter.get("/imagen/:nick", function(request, response) {

    var nombreFichero = "";
    var urlFichero = "";

    console.log("  Buscando imagen en BBDD...");

    console.log(":nick --> " + request.params.nick);
    DAOUsuario.buscarUsuarioByNick(request.params.nick, function(err, usuario) {
        if (err) {
            console.log("ERROR al buscar usuario en la BBDD");
            console.log(err);
            //next(err);
        } else {

            if (usuario === undefined) {
                console.log("usuario no encontrado");
                response.status(404);
                response.end("Not found");

            } else {
                DAOUsuario.buscarFotoByNick(usuario.nick, function(err, foto) {
                    if (err) {
                        console.log("ERROR al buscar foto en la BBDD");
                        console.log(err);
                        //next(err);
                    } else {

                        if (foto) {
                            response.end(foto);

                        } else {

                            if (usuario.sexo === "HOMBRE") {
                                nombreFichero = "login_hombre.png";
                            } else {
                                nombreFichero = "login_mujer.png";
                            }

                            urlFichero = path.join("public/images/icon_login/", nombreFichero);

                            console.log("  Renderizando foto...");
                            console.log(urlFichero);

                            fs.readFile(urlFichero, function(err, contenido) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    response.end(contenido);
                                }
                            });
                        }
                    }
                });
            }
        }
    });
});


module.exports = miRouter;
