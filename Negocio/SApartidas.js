"use strict";
var FactDAO = require('../Integracion/FactoriaDAO');
var TPartida = require('./TPartida');
var TComentario = require('./TComentario');
var ReglasJuego = require("./ReglasJuego");
var path = require('path');
var express = require('express');
var bodyParser = require("body-parser"); //Middleware que obtiene el cuerpo de la petición HTTP para interpretar su contenido.
var cookieParser = require("cookie-parser"); //Middleware que obtiene el cuerpo de la petición HTTP para interpretar su contenido.
var session = require("express-session");

//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_

/*==========
 Middleware insert
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


/** Middleware que comprueba si un usuario está logeado o no.
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
miRouter.use(cookieParser());
miRouter.use(middlewareSession);

//Configuración para ficheros estáticos.
var ficherosEstaticos = path.join(__dirname, "../public");
miRouter.use(express.static(ficherosEstaticos));

//Configuración de integracción.
var FactoriaDAO = new FactDAO();
var DAOPartida = FactoriaDAO.creaDAOPartida();
var DAOTablero = FactoriaDAO.creaDAOTablero();
var DAOUsuario = FactoriaDAO.creaDAOUsuario();
var DAOComentarios = FactoriaDAO.creaDAOComentarios();



//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_


/** Ejemplo de manejador de errores.
 * 
 */
miRouter.get("/usuarios.html", function(request, response, next) {
    next("Erroraco"); //Aquí debería de mandarse el objeto error.
});



//_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_


/** Función get que nos redireccionar a la ventana indicada si accedemos a la raiz del proyecto.
 * 
 */
miRouter.get("/", function(request, response) {
    response.status(200);
    response.redirect("./bienvenida.html#inicio");
});




// =========================
// APARTADO REGISTRO PARTIDA
// =========================


/** Petición de ventana nueva partida
 * 
 */
miRouter.get("/nueva_partida.html", is_login, function(request, response) {
    response.status(200);
    response.render("nueva_partida", { llave: request.mi_llave, nick: request.mi_usuario, llave_mensaje: "ok", mensaje: "" });
});


/** Registra una partida en la BBDD
 * 
 */
miRouter.post("/registrar_partida.html", is_login, function(request, response) {
    //Comprobamos si existe ya un usuario que el nick que nos pasa.
    DAOPartida.buscarPartidaByNombre(request.body.nombre_partida, function(error, respuesta) {
        if (error) {
            //response.render("registrar_partida", { llave: request.mi_llave, nick: request.mi_usuario, mensaje: error.message });
        } else {
            if (respuesta === undefined) {
                var partidaNueva = new TPartida(undefined, request.body.nombre_partida, undefined, null, request.session.id_usuario, 0, request.body.num_jugadores, null, null, undefined, 1, request.session.usuario);

                DAOPartida.crearPartida(partidaNueva, function(error, respuesta_2) {
                    if (error) {
                        response.render("nueva_partida", { llave: request.mi_llave, nick: request.mi_usuario, llave_mensaje: "error", mensaje: error.message });
                    } else {
                        response.render("nueva_partida", { llave: request.mi_llave, nick: request.mi_usuario, llave_mensaje: "ok", mensaje: "Partida creada correctamente." });
                    }
                });
            } else {
                response.render("nueva_partida", { llave: request.mi_llave, nick: request.mi_usuario, llave_mensaje: "warning", mensaje: "Nombre de partida ya utilizado." });
            }

        }
    });
});
//***************************************************************



// ========================
// APARTADO UNIRSE PARTIDA
// ========================


/**  El :RESP lo utilizo para diferenciar si se abre la ventana por primera vez para mostrar las partidas a las que 
 * un usuario se puede unir o si es un evento que se ha producido dentro de esta ventana, como por ejemplo, dar
 * el ok cuando se ha unido a una partida. Esto lo he hecho así para que pueda mostrar mensajes en la misma ventana.
 *
 * _init = Abro la ventana por primera vez.
 * _ok = Me viene un mensaje confirmación.
 * Otra cosa = un error.
 * 
 */
miRouter.get("/unirse_partida:resp.html", is_login, function(request, response) {
    //Comprobamos si está logeado.
    if (request.mi_llave) {
        //Consultamos las partidas disponibles.
        DAOPartida.buscarPartidasDisponiblesParaUsuario(request.session.id_usuario, function(error, respuesta) {
            if (error) {
                response.render("unirse", { llave: request.mi_llave, nick: request.mi_usuario, partidas: respuesta, llave_mensaje: "error", mensaje: error.message });
            } else {
                if (request.params.resp === "_init") {
                    response.render("unirse", { llave: request.mi_llave, nick: request.mi_usuario, partidas: respuesta, llave_mensaje: "ok", mensaje: "" });
                } else if (request.params.resp === "_ok") {
                    response.render("unirse", { llave: request.mi_llave, nick: request.mi_usuario, partidas: respuesta, llave_mensaje: "ok", mensaje: "Bravo, te has unido a la partida con éxito." });
                } else {
                    response.render("unirse", { llave: request.mi_llave, nick: request.mi_usuario, partidas: respuesta, llave_mensaje: "error", mensaje: "Error al unirse a partida" });
                }
            }
        });
    } else {
        response.redirect("../usuarios/login_usuario.html");
    }
});




/** Registra la unión de un jugador a una partida dada.
 * 
 */
miRouter.get("/reg_union/:id", is_login, function(request, response) {

    //Realizamos el registro del usuario en la partida.

    DAOPartida.buscarPartidaByID(request.params.id, function(error, partida) {
        if (error) {
            console.log("error al buscar partida: " + error);
            response.redirect("../unirse_partida_error.html");
        } else {

            if (partida.num_jugadores_ativos < partida.num_jugadores_Max) {

                DAOPartida.añadirJugadorAPartida(partida.id, request.session.id_usuario, function(errorAñadir, respuesta) {
                    if (errorAñadir) {
                        console.log("Error al añadir jug: " + errorAñadir);
                        response.redirect("../unirse_partida_error.html");
                    } else {

                        //Numero maximo de jugadores alcanzado
                        if (partida.num_jugadores_ativos + 1 === partida.num_jugadores_Max) {

                            iniciarPartida(partida.id, function(ok) {

                                if (ok) {
                                    response.redirect("../unirse_partida_ok.html");
                                } else {
                                    console.log("Error al iniar partida");
                                    response.redirect("../unirse_partida_error.html");
                                }

                            });
                        } else {
                            console.log("no se alcanzo el maximo");
                            response.redirect("../unirse_partida_ok.html");
                        }
                    }
                });

            } else {
                console.log("Error hay mas jugadores de los debidos");
                response.redirect("../unirse_partida_error.html");
            }
        }
    });
});




/** Desune a un jugador de una partida dada.
 * 
 */
miRouter.get("/desunir_:id", is_login, function(request, response) {

    //Realizamos el registro del usuario en la partida.

    DAOPartida.buscarPartidaByID(request.params.id, function(error, partida) {
        if (error) {
            console.log("error al buscar partida" + error);
            response.redirect("./bienvenida.html#inicio");
        } else {

            DAOPartida.desunirJugadorAPartida(partida.id, request.session.id_usuario, function(errorDesunir, respuesta) {
                if (errorDesunir) {
                    console.log("Error al desunir" + errorDesunir);
                } else {
                    response.redirect("./bienvenida.html#inicio");

                }
            });
        }
    });
});




// ========================
// APARTADO BIENVENIDA
// ========================


/** Middleware para la obtencion de las partidas abiertas del usuario
 * 
 * *************************************************************************************************************************************************
 *      terminar
 *      
 * ************************************************************************************************************************************************** 
 * @param {type} request Objeto HTTP request
 * @param {type} response Objeto HTTP response
 * @param {type} next Siguente middleware
 */
function buscarPartidasCreadas(request, response, next) {
    if (request.mi_llave) {
        DAOPartida.buscarPartidasCreadasPorUsuario(request.session.id_usuario, function(error, partidasCreadas) {
            if (error) {
                response.cookie("mensaje_partida", "ERROR al buscar las partidas creadas.", { maxAge: 86400000 });

            } else {

                if (partidasCreadas === undefined) {
                    request.partidasCreadas = undefined;
                } else {
                    request.partidasCreadas = partidasCreadas;
                }
                //Saltamos al siguiente middleware.
                next();
            }
        });
    } else {
        response.redirect("../usuarios/login_usuario.html");
    }
}



/** Middleware para la obtencion de las partidas activas del usuario
 *  
 * @param {type} request Objeto HTTP request
 * @param {type} response Objeto HTTP response
 * @param {type} next Siguente middleware
 */
function buscarPartidasActivas(request, response, next) {
    if (request.mi_llave) {
        DAOPartida.buscarPartidasActivas(request.session.id_usuario, function(error, mis_partidasActivas) {
            if (error) {
                response.cookie("mensaje_partida", "ERROR al buscar las partidas activas.", { maxAge: 86400000 });
            } else {

                if (mis_partidasActivas === undefined) {
                    request.partidasActivas = [];
                } else {

                    //Creamos el array de partidas en el request
                    request.partidasActivas = [];

                    //Para cada partida de la bbdd buscamos el nick del poseedor del turno y se añade al array del request
                    mis_partidasActivas.forEach(function(p) {
                        DAOPartida.buscarTurnoPartidaByID(p.id, function(error, nickTurno) {
                            if (error) {
                                response.cookie("mensaje_partida", "ERROR al buscar el turno de la partida " + p.nombre + ".", { maxAge: 86400000 });
                            } else {
                                //añadirmos el nick del turno a la partida
                                p.turno = nickTurno;

                                //añadimos la partida al array del request
                                request.partidasActivas.push(p);
                            };


                        });
                    });
                }
                //Saltamos al siguiente middleware.
                next();
            };
        });
    } else {
        response.redirect("../usuarios/login_usuario.html");
    }
}





/** Middleware para la obtencion de las partidas terminadas del usuario
 * 
 * @param {type} request Objeto HTTP request
 * @param {type} response Objeto HTTP response
 * @param {type} next Siguente middleware
 */
function buscarPartidasTerminadas(request, response, next) {

    var parPartidaTerminadaRolJugador = null;
    var arrayParesPartidasTerminadas = [];

    if (request.mi_llave) {
        DAOPartida.buscarPartidasTerminadas(request.session.id_usuario, function(error, partidasTerminadas) {
            if (error) {
                response.cookie("mensaje_partida", "ERROR al buscar las partidas terminadas.", { maxAge: 86400000 });
            } else {

                if (partidasTerminadas === undefined) {
                    request.partidasTerminadas = [];
                } else {

                    partidasTerminadas.forEach(function(p) {
                        DAOPartida.buscarRollJugador(p.id, request.session.id_usuario, function(error, rol) {
                            if (error) {
                                console.log(error);
                            } else {
                                parPartidaTerminadaRolJugador = { partidaTerminada: p, rolJugador: rol };
                                arrayParesPartidasTerminadas.push(parPartidaTerminadaRolJugador);
                            }
                        });


                    });

                    request.arrayParesPartidasTerminadas = arrayParesPartidasTerminadas;
                }
            }

            //Saltamos al siguiente middleware.
            next();
        });
    } else {
        response.redirect("../usuarios/login_usuario.html");
    }
}


/** Middleware para la obtencion de las partidas terminadas del usuario
 * 
 * @param {type} request Objeto HTTP request
 * @param {type} response Objeto HTTP response
 * @param {type} next Siguente middleware
 */
function buscarPartidasEnEspera(request, response, next) {
    if (request.mi_llave) {
        DAOPartida.buscarPartidasDeJugadorEnEspera(request.session.id_usuario, function(error, partidasEnEspera) {
            if (error) {
                response.cookie("mensaje_partida", "ERROR al buscar las partidas en espera.", { maxAge: 86400000 });
            } else {
                console.log("middleware buscarPartidas termiandas");
                console.log(partidasEnEspera);
                if (partidasEnEspera === undefined) {
                    request.partidasEnEspera = [];
                } else {
                    request.partidasEnEspera = partidasEnEspera;
                }
            }

            //Saltamos al siguiente middleware.
            next();
        });
    } else {
        response.redirect("../usuarios/login_usuario.html");
    }
}



/** Buscar información de un usuario dado.
 * 
 * @param {type} request
 * @param {type} response
 * @param {type} next
 * @returns {undefined}
 */
function buscarInfoUsuario(request, response, next) {
    if (request.mi_llave) {
        DAOUsuario.buscarUsuarioByID(request.session.id_usuario, function(error, usuario) {
            if (error) {
                response.cookie("mensaje_partida", "ERROR al buscar la información del usuario.", { maxAge: 86400000 });
            } else {

                if (usuario === undefined) {
                    request.usuario = undefined;
                } else {
                    request.usuario = {
                        id: usuario.id,
                        nick: usuario.nick,
                        sexo: usuario.sexo
                    };
                }
            }

            //Saltamos al siguiente middleware.
            next();
        });
    } else {
        response.redirect("../usuarios/login_usuario.html");
    }
}


/** Petición de la ventana de bienvenida.
 * 
 */
miRouter.get("/bienvenida.html", is_login, buscarPartidasCreadas, buscarPartidasActivas, buscarPartidasTerminadas, buscarPartidasEnEspera, buscarInfoUsuario, function(request, response) {
    var clase = "";
    var mensaje = "";

    if (request.mi_llave) {
        response.status(200);
        //Eliminamos la cookie de selección de carta.
        response.clearCookie("sel_carta");
        response.clearCookie("id_partida");
        response.clearCookie("mensaje_partida");

        if (request.cookies.mensaje_partida !== undefined) {
            mensaje = request.cookies.mensaje_partida;
            response.clearCookie("mensaje_partida");
            clase = "mensaje_partida_error";
        }

        console.log("EN MIROUTER.GET (/BIENVENIDA.HTML)");
        response.render("welcome", {
            llave: request.mi_llave,
            user: { nick: request.session.usuario, sexo: request.usuario.sexo },
            partidasCreadas: request.partidasCreadas,
            partidasActivas: request.partidasActivas,
            arrayParesPartidasTerminadas: request.arrayParesPartidasTerminadas,
            partidasEnEspera: request.partidasEnEspera,
            mensaje: mensaje,
            clase: clase
        });

    } else {
        response.redirect("../usuarios/login_usuario.html");
    }

});



// ========================
// APARTADO JUGAR PARTIDA
// ========================

/** Petición de la ventana donde se juegan las partidas.
 * 
 */
miRouter.get("/jugarpartida_:id_partida.html", is_login, cargarComentarios, function(request, response) {
    response.status(200);
    //Varaibles para control de errores
    var mensaje = "";
    var clase = "mensaje_partida";
    if (request.mi_llave) {
        //Guardamos en una cookie el valor de la partida.
        response.cookie("id_partida", Number(request.params.id_partida), { maxAge: 86400000 });
        DAOPartida.buscarPartidaByID(request.params.id_partida, function(error, datos_partida) {
            if (error) {
                mensaje = "ERROR: Al buscar la partida";
                clase = "mensaje_partida_error";
            } else {
                //Comprobamos que se ha localizado una partida.
                if (datos_partida === undefined) {
                    mensaje = "ERROR: Partida no encontrada";
                    clase = "mensaje_partida_error";
                } else {
                    //nombre_partida: datos_partida.nombre;
                    DAOPartida.buscarCreadorByID(request.params.id_partida, function(error, creador) {
                        if (error) {
                            mensaje = "ERROR: Al buscar el creador de la partida";
                            clase = "mensaje_partida_error";
                        } else {
                            //creadaby: creador;
                            DAOPartida.buscarRollJugador(request.params.id_partida, request.session.id_usuario, function(error, mi_roll) {
                                if (error) {
                                    mensaje = "ERROR: Al buscar el roll del jugador";
                                    clase = "mensaje_partida_error";
                                } else {
                                    DAOPartida.buscarPicoJugador(request.params.id_partida, request.session.id_usuario, function(error, mi_estado_pico) {
                                        if (error) {
                                            mensaje = "ERROR: Al buscar el estado del pico del jugador";
                                            clase = "mensaje_partida_error";
                                        } else {
                                            DAOPartida.buscarJugadoresPartida(request.params.id_partida, function(error, jugadores) {
                                                if (error) {
                                                    mensaje = "ERROR: Al buscar los jugadores";
                                                    clase = "mensaje_partida_error";
                                                } else {
                                                    //players: jugadores;
                                                    DAOPartida.buscarTurnoPartidaByID(request.params.id_partida, function(error, nickTurno) {
                                                        if (error) {
                                                            mensaje = "ERROR: Al buscar el nick del turno";
                                                            clase = "mensaje_partida_error";
                                                        } else {
                                                            DAOTablero.cargarFichasDeJugador(request.session.id_usuario, request.params.id_partida, function(error, cartas) {
                                                                if (error) {
                                                                    mensaje = "ERROR: Al buscar las cartas del usuario";
                                                                    clase = "mensaje_partida_error";
                                                                } else {
                                                                    DAOTablero.cargarFichasTablero(request.params.id_partida, function(error, cartas_tablero) {
                                                                        if (error) {
                                                                            mensaje = "ERROR: Al buscar las cartas del tablero";
                                                                            clase = "mensaje_partida_error";
                                                                        } else {
                                                                            /*console.log("Datos que voy a mandar:");
                                                                             console.log("Nombre partida: " + datos_partida.nombre);
                                                                             console.log("Nick del turno: " + nickTurno);
                                                                             console.log("Jugador jugando: " + request.session.usuario);
                                                                             console.log("Nick del creador: " + creador); 
                                                                             console.log("Jugadores: " + jugadores[0].nick);
                                                                             console.log("Movimientos restantes: " + datos_partida.mov_restantes);
                                                                             console.log("Roll del jugador: " + mi_roll)
                                                                             console.log("Cartas del tablero: " + cartas_tablero);*/

                                                                            //Control de mensajes.

                                                                            if (request.cookies.mensaje_partida !== undefined) {
                                                                                mensaje = request.cookies.mensaje_partida;
                                                                                response.clearCookie("mensaje_partida");
                                                                                clase = "mensaje_partida_error";
                                                                            } else if (datos_partida.estado === "TERMINADA") {
                                                                                mensaje = "LA PARTIDA ESTÁ TERMINADA";
                                                                            } else if (cartas[request.cookies.sel_carta - 1] === "Lupa") {
                                                                                mensaje = "Selecciona una de las cartas que parpadea o descártala.";
                                                                            } else if (cartas[request.cookies.sel_carta - 1] === "PicoRoto") {
                                                                                mensaje = "Selecciona un jugador para romperle el pico.";
                                                                            } else if (cartas[request.cookies.sel_carta - 1] === "PicoArreglado") {
                                                                                mensaje = "Selecciona un jugador para repararle el pico.";
                                                                            } else if (nickTurno !== request.session.usuario) {
                                                                                mensaje = "No es tu turno";
                                                                            } else if (request.cookies.sel_carta === undefined) {
                                                                                mensaje = "Selecciona una de tus cartas";
                                                                            } else {
                                                                                mensaje = "Selecciona un hueco libre en el tablero o descarta";
                                                                            }

                                                                            if (request.cookies.sel_carta) {
                                                                                response.render("partida", {
                                                                                    llave: request.mi_llave,
                                                                                    nick: request.mi_usuario,
                                                                                    nombre_partida: datos_partida.nombre,
                                                                                    creadaby: creador,
                                                                                    players: jugadores,
                                                                                    turno_de: nickTurno,
                                                                                    turnos_rest: datos_partida.mov_restantes,
                                                                                    nickJugador: request.session.usuario,
                                                                                    roll: mi_roll,
                                                                                    cartas_user: cartas,
                                                                                    cartas_tablero: cartas_tablero,
                                                                                    sel_carta: request.cookies.sel_carta,
                                                                                    estado: datos_partida.estado,
                                                                                    mensaje: mensaje,
                                                                                    clase: clase,
                                                                                    estado_pico: mi_estado_pico,
                                                                                    arrayComentarios: request.arrayComentarios
                                                                                });
                                                                            } else {
                                                                                response.render("partida", {
                                                                                    llave: request.mi_llave,
                                                                                    nick: request.mi_usuario,
                                                                                    nombre_partida: datos_partida.nombre,
                                                                                    creadaby: creador,
                                                                                    players: jugadores,
                                                                                    turno_de: nickTurno,
                                                                                    turnos_rest: datos_partida.mov_restantes,
                                                                                    nickJugador: request.session.usuario,
                                                                                    roll: mi_roll,
                                                                                    cartas_user: cartas,
                                                                                    cartas_tablero: cartas_tablero,
                                                                                    sel_carta: -1,
                                                                                    estado: datos_partida.estado,
                                                                                    mensaje: mensaje,
                                                                                    clase: clase,
                                                                                    estado_pico: mi_estado_pico,
                                                                                    arrayComentarios: request.arrayComentarios
                                                                                });
                                                                            }
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        });
    } else {
        response.redirect("../usuarios/login_usuario.html");
    }
});



/** Middleware para la obtencion de los cometarios de la partida
 * @param {type} request Objeto HTTP request
 * @param {type} response Objeto HTTP response
 * @param {type} next Siguente middleware
 */
function cargarComentarios(request, response, next) {
    if (request.mi_llave) {
        console.log("Partida pedida: " + Number(request.params.id_partida));
        DAOComentarios.buscarComentariosDePartida(Number(request.params.id_partida), function(err, arrayComentarios) {
            if (err) {
                console.log("error al cargar los comentario: " + err);
                response.cookie("mensaje_partida", "ERROR al cargar los comentarios de la partida.", { maxAge: 86400000 });
            } else {
                //console.log(arrayComentarios);
                if (arrayComentarios === undefined) {
                    request.arrayComentarios = undefined;
                } else {
                    request.arrayComentarios = arrayComentarios;
                }
                //Saltamos al siguiente middleware.
                next();
            }
        });

    } else {
        response.redirect("../usuarios/login_usuario.html");
    }
}




/** Función que guarda la carta seleccionada en las cookies del sistema.
 * 
 */
miRouter.get("/select_card:sel_carta?:sel_carta_real?:estado_pico?", function(request, response) {

    var pico_estado = request.query.estado_pico;

    response.cookie("sel_carta", Number(request.query.sel_carta), { maxAge: 86400000 });
    if (isNaN()) {
        response.cookie("sel_carta_real", request.query.sel_carta_real, { maxAge: 86400000 });
    } else {
        response.cookie("sel_carta_real", Number(request.query.sel_carta_real), { maxAge: 86400000 });
    }
    if (request.query.sel_carta_real === "PicoArreglado" || request.query.sel_carta_real === "PicoRoto") {
        response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#jugadores");
    } else if (pico_estado === "ok") {
        //response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#texto_tus_cartas");        
        response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
    } else {
        response.clearCookie("sel_carta");
        response.clearCookie("sel_carta_real");
        response.cookie("mensaje_partida", "No puede seleccionar esa carta. Tu pico está roto.", { maxAge: 86400000 });
        response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
    }
});



/** Función encargada de realizar el descarte de una carta seleccionada por un jugador.
 * 
 */
miRouter.get("/descartar", function(request, response) {
    //Comprobamos que tengo disponible en la cookie guardada la carta que queremos descartar y el id de la partida
    if (request.cookies.id_partida && request.cookies.sel_carta_real) {
        //Bajamos un movimiento.
        DAOPartida.reducirMovimiento(request.cookies.id_partida, function(error, resp_red_mov) {
            if (error) {
                console.log("Error al reducir el movimiento: " + error);
            } else {
                if (resp_red_mov) {
                    //Cambiamos el turno de partida.
                    DAOPartida.cambiarTurnoPartida(request.cookies.id_partida, request.session.id_usuario, function(error, respuesta) {
                        //Actualizamos esa carta con una nueva.
                        var carta_para_cambio = generarNumeroRandom(1, ReglasJuego.numeroCartasBaraja + 1);
                        var carta_para_cambio = ReglasJuego.cartas[carta_para_cambio];
                        DAOTablero.actualizarCarta(request.cookies.id_partida, request.session.id_usuario, request.cookies.sel_carta_real, carta_para_cambio, function(error, cambiada) {
                            if (cambiada) {
                                //Eliminamos las cookies de selección.
                                response.clearCookie("sel_carta");
                                response.clearCookie("sel_carta_real");
                                response.clearCookie("mensaje_partida");
                                response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                            } else {
                                console.log("Error al descartar una carta. No es posible actualizar la carta.");
                            }
                        });
                    });
                }
            }
        });
    } else {
        console.log("Error al descartar una carta");
    }
});



/** Realiza la busqueda de la ficha 'start' desde una dada.
 * 
 * @param {type} id_partida
 * @param {type} marcadas
 * @param {type} pos_X_Sig
 * @param {type} pos_Y_Sig
 * @param {type} encontrado
 * @param {type} dir
 * @param {type} callback
 * @returns {undefined}
 */
function backtrack(id_partida, marcadas, pos_X_Sig, pos_Y_Sig, encontrado, dir, callback) {

    DAOTablero.buscarFicha(id_partida, pos_X_Sig, pos_Y_Sig, function(err, ficha) {


        if (err) {
            console.log("error buscarFicha: {x:" + pos_X_Sig + ", y: " + pos_Y_Sig + "}");
        } else {
            if (dir === "N" && Number(generarBinario(ficha).substr(3, 1)) === 0) {
                callback(null, false);
            } else if (dir === "S" && Number(generarBinario(ficha).substr(1, 1)) === 0) {
                callback(null, false);
            } else if (dir === "E" && Number(generarBinario(ficha).substr(0, 1)) === 0) {
                callback(null, false);
            } else if (dir === "O" && Number(generarBinario(ficha).substr(2, 1)) === 0) {
                callback(null, false);
            } else if (ficha === "Start") {
                callback(null, true);
            } else if (ficha === undefined) {
                callback(null, false);
            } else if (marcadas[pos_X_Sig][pos_Y_Sig]) {
                callback(null, false);
            } else {
                //marcamos
                marcadas[pos_X_Sig][pos_Y_Sig] = true;


                backtrack(id_partida, marcadas, pos_X_Sig, Number(pos_Y_Sig) - 1, encontrado, "N", function(err, encontrado) {
                    if (err) {
                        console.log("error callback NORTE: {x:" + pos_X_Sig + ", y: " + (Number(pos_Y_Sig - 1)) + "}");
                    } else {

                        if (encontrado) {
                            callback(null, encontrado);
                        } else {
                            //buscamos SUR
                            backtrack(id_partida, marcadas, pos_X_Sig, Number(pos_Y_Sig) + 1, encontrado, "S", function(err, encontrado) {
                                if (err) {
                                    console.log("error callback SUR: {x:" + pos_X_Sig + ", y: " + (Number(pos_Y_Sig + 1)) + "}");
                                } else {
                                    if (encontrado) {
                                        callback(null, encontrado);
                                    } else {

                                        //buscamos ESTE
                                        backtrack(id_partida, marcadas, Number(pos_X_Sig) + 1, pos_Y_Sig, encontrado, "E", function(err, encontrado) {
                                            if (err) {
                                                console.log("error callback ESTE: {x:" + (Number(pos_X_Sig) + 1) + ", y: " + pos_Y_Sig + "}");
                                            } else {
                                                if (encontrado) {
                                                    callback(null, encontrado);
                                                } else {
                                                    //buscamos OESTE
                                                    backtrack(id_partida, marcadas, Number(pos_X_Sig) - 1, pos_Y_Sig, encontrado, "O", function(err, encontrado) {
                                                        if (err) {
                                                            console.log("error callback SUR: {x:" + (Number(pos_X_Sig - 1)) + ", y: " + pos_Y_Sig + "}");
                                                        } else {
                                                            if (encontrado) {
                                                                callback(null, encontrado);
                                                            } else {

                                                                callback(null, false);

                                                            }

                                                        }

                                                    });

                                                }

                                            }

                                        });
                                    }

                                }

                            });

                        }

                    }

                });

            }

        }
    });
}




/** Insertar una carta en el tablero en la posicion x y.
 * 
 */
miRouter.get("/insert_card_:posicion_y?:posicion_x?", function(request, response) {
    //Comprobamos que tenemos disponibles las dos cookies.
    if (request.cookies.sel_carta && request.cookies.id_partida && request.cookies.sel_carta_real) {
        /*var posicion_y = String(request.params.posicion).substr(0, 1);
         var posicion_x = String(request.params.posicion).substr(1, 1);*/

        var posicion_y = request.query.posicion_y;
        var posicion_x = request.query.posicion_x;

        //Variables para hacer el backtracking.
        var marcadas = new Array(7);
        for (var i = 0; i < 7; i++) {
            marcadas[i] = new Array(7);
            for (var j = 0; j < 7; j++) {
                marcadas[i][j] = false;
            }
        }
        marcadas[posicion_x][posicion_y] = true;
        var encontrado_norte = false;
        var encontrado_sur = false;
        var encontrado_este = false;
        var encontrado_oeste = false;

        var gold_encontrada = false;

        var num_carta = 0;
        var compatible = false;
        var DNK = undefined;

        //En el caso de que sea una lupa solo comprobamos si es sobre una DNK y si es así la delatamos.
        if (request.cookies.sel_carta_real === "Lupa") {
            //Comprobamos que intenta acceder a una ficha de tipo DNK.
            DAOTablero.buscarFicha(request.cookies.id_partida, posicion_x, posicion_y, function(error, respuesta) {
                if (error) {
                    response.cookie("mensaje_partida", "Error al buscar la carta para comprobar DNK. " + error.message, { maxAge: 86400000 });
                    response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                } else {
                    if (respuesta === "DNK") {
                        //Procedemos a mostrar la carta.
                        DAOTablero.actualizarDNK(request.cookies.id_partida, posicion_x, posicion_y, function(error, respuesta_act) {
                            DAOPartida.reducirMovimiento(request.cookies.id_partida, function(error, resp_red_mov) {
                                if (error) {
                                    response.cookie("mensaje_partida", "Error al reducir el numero de movimientos." + error.message, { maxAge: 86400000 });
                                    response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                } else {
                                    if (resp_red_mov) {
                                        //Cambiamos el turno de partida.
                                        DAOPartida.cambiarTurnoPartida(request.cookies.id_partida, request.session.id_usuario, function(error, respuesta) {
                                            if (respuesta) {
                                                //Actualizamos la carta que hemos puesto.
                                                var carta_para_cambio = generarNumeroRandom(1, ReglasJuego.numeroCartasBaraja + 1);
                                                var carta_para_cambio = ReglasJuego.cartas[carta_para_cambio];
                                                DAOTablero.actualizarCarta(request.cookies.id_partida, request.session.id_usuario, request.cookies.sel_carta_real, carta_para_cambio, function(error, respuesta_bd) {
                                                    if (error) {
                                                        response.cookie("mensaje_partida", "Error al actualizar la carta del usuario" + error.message, { maxAge: 86400000 });
                                                        response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                    } else {
                                                        //Eliminamos la cookie de seleccion.
                                                        response.clearCookie("sel_carta");
                                                        response.clearCookie("sel_carta_real");
                                                        response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }
                            });
                        });
                    } else {
                        response.cookie("mensaje_partida", "Esa carta no es válida. Selecciona una que parpardee " + error.message, { maxAge: 86400000 });
                        response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                    }
                }
            });
        } else if (request.cookies.sel_carta_real === "Bomba") {
            //Comprobamos que intenta acceder a una ficha de tipo DNK.
            DAOTablero.buscarFicha(request.cookies.id_partida, posicion_x, posicion_y, function(error, respuesta) {
                if (error) {
                    response.cookie("mensaje_partida", "Error al buscar la carta para comprobar DNK. " + error.message, { maxAge: 86400000 });
                    response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                } else {
                    if (Number(respuesta) <= 15) {
                        //Procedemos a eliminar la carta
                        DAOTablero.eliminarCartaDelTablero(request.cookies.id_partida, posicion_x, posicion_y, function(error, respuesta_act) {
                            if (error) {
                                response.cookie("mensaje_partida", "Error al eliminar la carta del tablero" + error.message, { maxAge: 86400000 });
                                response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                            } else {
                                DAOPartida.reducirMovimiento(request.cookies.id_partida, function(error, resp_red_mov) {
                                    if (error) {
                                        response.cookie("mensaje_partida", "Error al reducir el numero de movimientos." + error.message, { maxAge: 86400000 });
                                        response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                    } else {
                                        if (resp_red_mov) {
                                            //Cambiamos el turno de partida.
                                            DAOPartida.cambiarTurnoPartida(request.cookies.id_partida, request.session.id_usuario, function(error, respuesta) {
                                                if (respuesta) {
                                                    //Actualizamos la carta que hemos puesto.
                                                    var carta_para_cambio = generarNumeroRandom(1, ReglasJuego.numeroCartasBaraja + 1);
                                                    var carta_para_cambio = ReglasJuego.cartas[carta_para_cambio];
                                                    DAOTablero.actualizarCarta(request.cookies.id_partida, request.session.id_usuario, request.cookies.sel_carta_real, carta_para_cambio, function(error, respuesta_bd) {
                                                        if (error) {
                                                            response.cookie("mensaje_partida", "Error al actualizar la carta del usuario" + error.message, { maxAge: 86400000 });
                                                            response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                        } else {
                                                            //Eliminamos la cookie de seleccion.
                                                            response.clearCookie("sel_carta");
                                                            response.clearCookie("sel_carta_real");
                                                            response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    } else {
                        response.cookie("mensaje_partida", "Esa carta no es válida. Selecciona una que parpardee " + error.message, { maxAge: 86400000 });
                        response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                    }
                }
            });
        } else {
            //Buscamos en el norte.
            DAOTablero.buscarFicha(request.cookies.id_partida, posicion_x, Number(posicion_y) - 1, function(error, respuesta_norte) {
                if (error) {
                    response.cookie("mensaje_partida", "Error al buscar la carta norte. " + error.message, { maxAge: 86400000 });
                    response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                } else {

                    //Comprobamos si encontramos la casilla Start.
                    if (respuesta_norte === 'Start') {
                        respuesta_norte = "15";
                    }

                    //Compruebo si nos encontramos un DNK.
                    if (respuesta_norte === 'DNK') {
                        respuesta_norte = "15";
                        DNK = "norte";
                    }
                    //Compruebo si nos encontramos un NoGold
                    if (respuesta_norte === 'NoGold') {
                        respuesta_norte = "15";
                    }
                    //Compruebo si nos encontramos un Gold
                    if (respuesta_norte === 'Gold') {
                        respuesta_norte = "15";
                        gold_encontrada = true;
                    }

                    //Compruebo si es una carta compatible
                    if (respuesta_norte === undefined || (generarBinario(respuesta_norte).substr(3, 1) === generarBinario(request.cookies.sel_carta_real).substr(1, 1))) {
                        //Sigo buscando las demás posiciones.
                        DAOTablero.buscarFicha(request.cookies.id_partida, posicion_x, Number(posicion_y) + 1, function(error, respuesta_sur) {
                            if (error) {
                                response.cookie("mensaje_partida", "Error al buscar la carta sur. " + error.message, { maxAge: 86400000 });
                                response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                            } else {
                                //Comprobamos si encontramos la casilla Start.
                                if (respuesta_sur === 'Start') {
                                    respuesta_sur = "15";
                                }

                                //Compruebo si nos encontramos un DNK.
                                if (respuesta_sur === 'DNK') {
                                    respuesta_sur = "15";
                                    DNK = "sur";
                                }
                                //Compruebo si nos encontramos un NoGold
                                if (respuesta_sur === 'NoGold') {
                                    respuesta_sur = "15";
                                }
                                //Compruebo si nos encontramos un Gold
                                if (respuesta_sur === 'Gold') {
                                    respuesta_sur = "15";
                                    gold_encontrada = true;
                                }
                                //Compruebo si es una carta compatible
                                if (respuesta_sur === undefined || (generarBinario(respuesta_sur).substr(1, 1) === generarBinario(request.cookies.sel_carta_real).substr(3, 1))) {
                                    DAOTablero.buscarFicha(request.cookies.id_partida, Number(posicion_x) + 1, posicion_y, function(error, respuesta_este) {
                                        if (error) {
                                            response.cookie("mensaje_partida", "Error al buscar la carta este. " + error.message, { maxAge: 86400000 });
                                            response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                        } else {
                                            //Comprobamos si encontramos la casilla Start.
                                            if (respuesta_este === 'Start') {
                                                respuesta_este = "15";
                                            }

                                            //Compruebo si nos encontramos un DNK.
                                            if (respuesta_este === 'DNK') {
                                                respuesta_este = "15";
                                                DNK = "este";
                                            }
                                            //Compruebo si nos encontramos un NoGold
                                            if (respuesta_este === 'NoGold') {
                                                respuesta_este = "15";
                                            }
                                            //Compruebo si nos encontramos un Gold
                                            if (respuesta_este === 'Gold') {
                                                respuesta_este = "15";
                                                gold_encontrada = true;
                                            }

                                            //Compruebo si es una carta compatible
                                            if (respuesta_este === undefined || (generarBinario(respuesta_este).substr(0, 1) === generarBinario(request.cookies.sel_carta_real).substr(2, 1))) {
                                                DAOTablero.buscarFicha(request.cookies.id_partida, Number(posicion_x) - 1, posicion_y, function(error, respuesta_oeste) {
                                                    if (error) {
                                                        response.cookie("mensaje_partida", "Error al buscar la carta oeste. " + error.message, { maxAge: 86400000 });
                                                        response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                    } else {
                                                        //Comprobamos si encontramos la casilla Start.
                                                        if (respuesta_oeste === 'Start') {
                                                            respuesta_oeste = "15";
                                                        }

                                                        //Compruebo si nos encontramos un DNK.
                                                        if (respuesta_oeste === 'DNK') {
                                                            respuesta_oeste = "15";
                                                            DNK = "oeste";
                                                        }
                                                        //Compruebo si nos encontramos un NoGold
                                                        if (respuesta_oeste === 'NoGold') {
                                                            respuesta_oeste = "15";
                                                        }
                                                        //Compruebo si nos encontramos un Gold
                                                        if (respuesta_oeste === 'Gold') {
                                                            respuesta_oeste = "15";
                                                            gold_encontrada = true;
                                                        }

                                                        //Compruebo si es una carta compatible
                                                        if (respuesta_oeste === undefined || (generarBinario(respuesta_oeste).substr(2, 1) === generarBinario(request.cookies.sel_carta_real).substr(0, 1))) {
                                                            //Ya hemos comprobado que todas nuestras cartas de alrededor son compatibles.
                                                            //Ahora vamos a comprobar que no todas son vacias.
                                                            if (respuesta_norte === undefined && respuesta_sur === undefined && respuesta_este === undefined && respuesta_oeste === undefined) {
                                                                response.cookie("mensaje_partida", "Posicion invalida.", { maxAge: 86400000 });
                                                                response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                            } else {
                                                                //Realizamos el backtracking para comprobar si llegamos a la salida correctamente.
                                                                //Lo realizamos por el norte.
                                                                backtrack(request.cookies.id_partida, marcadas, posicion_x, Number(posicion_y) - 1, encontrado_norte, "N", function(err, encontrado_norte) {
                                                                    if (err) {
                                                                        console.log(err);
                                                                    } else {
                                                                        //Lo realizamos por el sur.
                                                                        backtrack(request.cookies.id_partida, marcadas, posicion_x, Number(posicion_y) + 1, encontrado_sur, "S", function(err, encontrado_sur) {
                                                                            if (err) {
                                                                                console.log(err);
                                                                            } else {
                                                                                //Lo realizamos por el este.
                                                                                backtrack(request.cookies.id_partida, marcadas, Number(posicion_x) + 1, posicion_y, encontrado_este, "E", function(err, encontrado_este) {
                                                                                    if (err) {
                                                                                        console.log(err);
                                                                                    } else {
                                                                                        //Lo realizamos por el oeste.
                                                                                        backtrack(request.cookies.id_partida, marcadas, Number(posicion_x) - 1, posicion_y, encontrado_oeste, "O", function(err, encontrado_oeste) {
                                                                                            if (err) {
                                                                                                console.log(err);
                                                                                            } else {
                                                                                                //Comprobamos si existe al menos un camino que llegue hasta la salida.
                                                                                                if ((Number(generarBinario(request.cookies.sel_carta_real).substr(1, 1)) === 1 && encontrado_norte) ||
                                                                                                    (Number(generarBinario(request.cookies.sel_carta_real).substr(3, 1)) === 1 && encontrado_sur) ||
                                                                                                    (Number(generarBinario(request.cookies.sel_carta_real).substr(2, 1)) === 1 && encontrado_este) ||
                                                                                                    (Number(generarBinario(request.cookies.sel_carta_real).substr(0, 1)) === 1 && encontrado_oeste)
                                                                                                ) {
                                                                                                    DAOTablero.ponerFichaEnTablero(request.cookies.id_partida, request.session.id_usuario, request.cookies.sel_carta_real, posicion_x, posicion_y, 0, function(error, respuesta) {
                                                                                                        if (error) {
                                                                                                            response.cookie("mensaje_partida", "Error al poner la ficha en tablero. " + error.message, { maxAge: 86400000 });
                                                                                                            response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                                                                        } else {
                                                                                                            DAOPartida.reducirMovimiento(request.cookies.id_partida, function(error, resp_red_mov) {
                                                                                                                if (error) {
                                                                                                                    response.cookie("mensaje_partida", "Error al reducir el numero de movimientos." + error.message, { maxAge: 86400000 });
                                                                                                                    response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                                                                                } else {
                                                                                                                    if (resp_red_mov) {
                                                                                                                        //Cambiamos el turno de partida.
                                                                                                                        DAOPartida.cambiarTurnoPartida(request.cookies.id_partida, request.session.id_usuario, function(error, respuesta) {
                                                                                                                            if (respuesta) {
                                                                                                                                //Actualizamos la carta que hemos puesto.
                                                                                                                                var carta_para_cambio = generarNumeroRandom(1, ReglasJuego.numeroCartasBaraja + 1);
                                                                                                                                var carta_para_cambio = ReglasJuego.cartas[carta_para_cambio];
                                                                                                                                DAOTablero.actualizarCarta(request.cookies.id_partida, request.session.id_usuario, request.cookies.sel_carta_real, carta_para_cambio, function(error, respuesta_bd) {
                                                                                                                                    if (error) {
                                                                                                                                        response.cookie("mensaje_partida", "Error al actualizar la carta del usuario" + error.message, { maxAge: 86400000 });
                                                                                                                                        response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                                                                                                    } else {
                                                                                                                                        //Eliminamos la cookie de seleccion.
                                                                                                                                        response.clearCookie("sel_carta");
                                                                                                                                        response.clearCookie("sel_carta_real");
                                                                                                                                        response.clearCookie("mensaje_partida");
                                                                                                                                        //Comprueba si alguna de alrededor es una DKN
                                                                                                                                        if (DNK !== undefined) {
                                                                                                                                            //Actualizamos la carta DNK.
                                                                                                                                            if (DNK === "norte") {
                                                                                                                                                posicion_y = Number(posicion_y) - 1;
                                                                                                                                            } else if (DNK === "sur") {
                                                                                                                                                posicion_y = Number(posicion_y) + 1;
                                                                                                                                            } else if (DNK === "este") {
                                                                                                                                                posicion_x = Number(posicion_x) + 1;
                                                                                                                                            } else if (DNK === "oeste") {
                                                                                                                                                posicion_x = Number(posicion_x) - 1;
                                                                                                                                            }
                                                                                                                                            console.log("antes de actualizarDNK");
                                                                                                                                            DAOTablero.actualizarDNK(request.cookies.id_partida, posicion_x, posicion_y, function(error, num_actualiza) {
                                                                                                                                                if (error) {
                                                                                                                                                    response.cookie("mensaje_partida", "Error al actualizar la carta DNK" + error.message, { maxAge: 86400000 });
                                                                                                                                                    response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                                                                                                                } else {
                                                                                                                                                    //En el caso de que nos devuelva un 2 será el final de la partida.
                                                                                                                                                    if (num_actualiza === 2) {
                                                                                                                                                        DAOPartida.finalizarPartida(request.cookies.id_partida, request.session.id_usuario, "pepita", function(error, res_fin) {
                                                                                                                                                            if (error) {
                                                                                                                                                                response.cookie("mensaje_partida", "Error al finalizar la partida." + error.message, { maxAge: 86400000 });
                                                                                                                                                                response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                                                                                                                            } else {
                                                                                                                                                                if (!res_fin) {
                                                                                                                                                                    response.cookie("mensaje_partida", "Error al actualizar el estado de partida a terminada" + error.message, { maxAge: 86400000 });
                                                                                                                                                                    response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                                                                                                                                } else {
                                                                                                                                                                    response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                                                                                                                                }
                                                                                                                                                            }
                                                                                                                                                        });
                                                                                                                                                    } else if (num_actualiza === 1) {
                                                                                                                                                        DAOPartida.movimientosRestantes(request.cookies.id_partida, function(error, mov_restantes) {
                                                                                                                                                            if (error) {
                                                                                                                                                                response.cookie("mensaje_partida", "Error al actualizar el numero de movimientos restantes" + error.message, { maxAge: 86400000 });
                                                                                                                                                                response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                                                                                                                            } else {
                                                                                                                                                                console.log("en ifelse rama 1, no error");
                                                                                                                                                                if (mov_restantes === 0) {
                                                                                                                                                                    DAOPartida.finalizarPartida(request.cookies.id_partida, request.session.id_usuario, "no_pepita", function(error, res_fin) {
                                                                                                                                                                        if (!res_fin) {
                                                                                                                                                                            response.cookie("mensaje_partida", "Error al actualizar el estado de partida a terminada." + error.message, { maxAge: 86400000 });
                                                                                                                                                                            response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                                                                                                                                        } else {
                                                                                                                                                                            console.log();
                                                                                                                                                                            response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                                                                                                                                        }
                                                                                                                                                                    });
                                                                                                                                                                } else {
                                                                                                                                                                    response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                                                                                                                                }
                                                                                                                                                            }
                                                                                                                                                        });
                                                                                                                                                    } else if (num_actualiza === 0) {
                                                                                                                                                        response.cookie("mensaje_partida", "Error al actualizar la carta DNK." + error.message, { maxAge: 86400000 });
                                                                                                                                                        response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                                                                                                                    }
                                                                                                                                                }
                                                                                                                                            });
                                                                                                                                        } else {
                                                                                                                                            DAOPartida.movimientosRestantes(request.cookies.id_partida, function(error, mov_restantes) {
                                                                                                                                                if (mov_restantes === 0 || gold_encontrada) {
                                                                                                                                                    var tipo_fin = "no_pepita";
                                                                                                                                                    if (mov_restantes !== 0) {
                                                                                                                                                        tipo_fin = "pepita";
                                                                                                                                                    }
                                                                                                                                                    DAOPartida.finalizarPartida(request.cookies.id_partida, request.session.id_usuario, tipo_fin, function(error, res_fin) {
                                                                                                                                                        if (!res_fin) {
                                                                                                                                                            response.cookie("mensaje_partida", "Error al actualizar el estado de partida a terminada." + error.message, { maxAge: 86400000 });
                                                                                                                                                            response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                                                                                                                        } else {
                                                                                                                                                            response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                                                                                                                        }
                                                                                                                                                    });
                                                                                                                                                } else {
                                                                                                                                                    response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                                                                                                                }
                                                                                                                                            });
                                                                                                                                        }
                                                                                                                                    }
                                                                                                                                });
                                                                                                                            } else {
                                                                                                                                response.cookie("mensaje_partida", "Error al cambiar turno de partida." + error.message, { maxAge: 86400000 });
                                                                                                                                response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                                                                                            }
                                                                                                                        });
                                                                                                                    } else {
                                                                                                                        response.cookie("mensaje_partida", "No se ha podido reducir los movimientos restantes." + error.message, { maxAge: 86400000 });
                                                                                                                        response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                                                                                    }
                                                                                                                }
                                                                                                            });
                                                                                                        }
                                                                                                    });
                                                                                                } else {
                                                                                                    response.cookie("mensaje_partida", "Compatible pero no llego a salida", { maxAge: 86400000 });
                                                                                                    response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                                                                }
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                });
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        } else {
                                                            response.cookie("mensaje_partida", "Posición incorrecta, carta oeste incompatible", { maxAge: 86400000 });
                                                            response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                                        }
                                                    }
                                                });
                                            } else {
                                                response.cookie("mensaje_partida", "Posición incorrecta, carta este incompatible.", { maxAge: 86400000 });
                                                response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                            }
                                        }
                                    });
                                } else {
                                    response.cookie("mensaje_partida", "Posición incorrecta, carta sur incompatible.", { maxAge: 86400000 });
                                    response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                }
                            }
                        });

                    } else {
                        response.cookie("mensaje_partida", "Posición incorrecta, carta norte incompatible.", { maxAge: 86400000 });
                        response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                    }
                }
            });
        }
    }
});


/** Modificar una carta en el tablero en la posicion x y.
 * 
 */
miRouter.get("/modificarPico_:estado_pico?:id_jugador?", function(request, response) {
    //Comprobamos que tenemos disponibles las dos cookies.
    if (request.cookies.sel_carta && request.cookies.id_partida && request.cookies.sel_carta_real) {

        var estado_pico = request.query.estado_pico;
        var id_jugador = request.query.id_jugador;

        console.log("Estado a cambiar reconocido: " + estado_pico);
        console.log("Jugador id reconocido: " + id_jugador);
        //Rompemos el pico del jugador seleccionado.
        DAOPartida.modificarPico(request.cookies.id_partida, id_jugador, estado_pico, function(error, res_modi) {
            if (!error) {
                DAOPartida.reducirMovimiento(request.cookies.id_partida, function(error, resp_red_mov) {
                    if (error) {
                        response.cookie("mensaje_partida", "Error al reducir el numero de movimientos." + error.message, { maxAge: 86400000 });
                        response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                    } else {
                        if (resp_red_mov) {
                            //Cambiamos el turno de partida.
                            DAOPartida.cambiarTurnoPartida(request.cookies.id_partida, request.session.id_usuario, function(error, respuesta) {
                                if (respuesta) {
                                    //Actualizamos la carta que hemos puesto.
                                    var carta_para_cambio = generarNumeroRandom(1, ReglasJuego.numeroCartasBaraja + 1);
                                    var carta_para_cambio = ReglasJuego.cartas[carta_para_cambio];
                                    DAOTablero.actualizarCarta(request.cookies.id_partida, request.session.id_usuario, request.cookies.sel_carta_real, carta_para_cambio, function(error, respuesta_bd) {
                                        if (error) {
                                            response.cookie("mensaje_partida", "Error al actualizar la carta del usuario" + error.message, { maxAge: 86400000 });
                                            response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                        } else {
                                            //Eliminamos la cookie de seleccion.
                                            response.clearCookie("sel_carta");
                                            response.clearCookie("sel_carta_real");
                                            if (estado_pico === "ok") {
                                                response.cookie("mensaje_partida", "Pico reparado con éxito.", { maxAge: 86400000 });
                                            } else {
                                                response.cookie("mensaje_partida", "Pico roto con éxito.", { maxAge: 86400000 });
                                            }
                                            response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#turnos_restantes");
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            } else {
                response.cookie("mensaje_partida", "Error al romper el pico del jugador.", { maxAge: 86400000 });
                response.redirect("./jugarpartida_" + request.cookies.id_partida + ".html#jugadores");
            }
        });
    }
});


//**********************************************************************************************
//**********************************************************************************************
//                                  Iniciar partida
//**********************************************************************************************
//**********************************************************************************************


/** Cierra la partida para que no se puedan unir mas jugadores a la misma.
 * 
 */
miRouter.get("/cerrar_partida_:id_partida.html", is_login, function(request, response) {


    if (request.mi_llave) {
        DAOPartida.buscarPartidaByID(request.params.id_partida, function(error, partida) {
            if (error) {
                response.cookie("mensaje_partida", "ERROR al buscar la partida.", { maxAge: 86400000 });
                response.redirect("./bienvenida.html#inicio");
            } else {

                if (partida.num_jugadores_ativos >= ReglasJuego.minJugadoresPartida) {

                    iniciarPartida(request.params.id_partida, function(ok) {

                        if (ok) {
                            response.redirect("./jugarpartida_" + request.params.id_partida + ".html");
                        } else {
                            response.cookie("mensaje_partida", "ERROR al iniciar la partida.", { maxAge: 86400000 });
                            response.redirect("./bienvenida.html#inicio");
                        }
                    });
                } else {
                    response.cookie("mensaje_partida", "ERROR: no se puede cerrar esa partida.", { maxAge: 86400000 });
                    response.redirect("./bienvenida.html#inicio");
                }
            }
        });

    } else {
        response.redirect("../usuarios/login_usuario.html");
    }

});




/** Realiza el inicio de una partida establecida.
 * 
 * @param {type} idPartida
 * @param {type} callback
 * @returns {nm$_SApartidas.iniciarPartida}
 */
function iniciarPartida(idPartida, callback) {
    if (callback === undefined)
        callback = function() {};


    DAOPartida.buscarPartidaByID(idPartida, function(error, partida) {
        if (error) {
            console.log("error al buscar partida: " + error);
        } else {

            DAOPartida.activarPartida(idPartida, function(error, activarOK) {
                if (error) {
                    console.log("error al activar la partida: " + error);
                } else {
                    if (activarOK) {
                        //Reparto de roles
                        repartoDeRoles(partida, function(repartoRolOK) {
                            if (!repartoRolOK) {
                                console.log("error al asignar roles");
                            } else {

                                //Se reparten las cartas a cada jugador en funcion de las reglas de juego
                                repartoDeCartas(partida, function(repartoCartasOK) {
                                    if (!repartoCartasOK) {
                                        console.log("error al repartir cartas");
                                    } else {

                                        //Se selecciona el numero de turnos para la partida y se elige de quien es el primer turno
                                        repartoDeTurnos(partida, function(repartoTurnoOK) {
                                            if (!repartoTurnoOK) {
                                                console.log("error al repartir turnos");
                                            } else {

                                                inicializarTablero(partida, function(inicioTablerOK) {
                                                    if (!inicioTablerOK) {
                                                        console.log("error al inicializar el tablero");
                                                    } else {

                                                        callback(inicioTablerOK);

                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        //Error al activar partida
                    }
                }

            });
        }

    });

}



/** Función encargada del realizar el reparto de roles a cada jugador de la partida en funcion de las reglas del juego
 * 
 * @param {TPartida} TPartida
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {Boolean} True si todo correcto
 *                    FALSE si hay error
 */
function repartoDeRoles(partida, callback) {

    if (callback === undefined)
        callback = function() {};
    //Se selecciona el numero de jugadores de cada rol para la partida en funcion de las reglas del juego
    var numSabot = ReglasJuego.repartoRoles[partida.num_jugadores_ativos][0];
    var numBuscadores = ReglasJuego.repartoRoles[partida.num_jugadores_ativos][1];
    var sabot = true;

    var idJugador = -1;
    var rol = "";
    var todoOK = true;

    partida.jugadores.forEach(function(j) {
        idJugador = j;

        if (sabot && (numSabot > 0)) {
            rol = "SABOTEADOR";
            numSabot--;
            sabot = !sabot;
        } else {
            rol = "BUSCADOR";
            numBuscadores--;
            sabot = !sabot;
        }
        DAOPartida.asignarRolAJugador(partida.id, idJugador, rol, function(err, insertOK) {
            todoOK = todoOK && insertOK;
        });

    });

    callback(todoOK);


};


/** Función que realiza el reparto de las cartas a los jugadores.
 * 
 * @param {TPartida} partida

 * @param {type} callback
 * @returns {nm$_SApartidas.repartoDeCartas}
 */
function repartoDeCartas(partida, callback) {

    if (callback === undefined)
        callback = function() {};

    // consultamos en numero de cartas que tendrá cada mano de cartas del usuario
    var numCartas = ReglasJuego.numCartasPorJugador[partida.num_jugadores_ativos];
    var carta = -1;
    var todoOK = true;

    partida.jugadores.forEach(function(j) {

        for (var i = 0; i < numCartas; i++) {
            carta = generarNumeroRandom(1, ReglasJuego.numeroCartasBaraja + 1);
            DAOPartida.insertarCartasJugador(j, partida.id, carta, function(err, insertOK) {
                todoOK = todoOK && insertOK;
            });
        }
    });

    callback(todoOK);

};



/** Función que realiza el reparto de los turnos de un partida.
 * 
 * @param {TPartida} partida
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {Boolean} True si todo correcto
 *                    FALSE si hay error
 */
function repartoDeTurnos(partida, callback) {

    if (callback === undefined)
        callback = function() {};

    var numTurnosPartida = ReglasJuego.numTurnos[partida.num_jugadores_ativos]; //Numero de turnos de la partida en funcion del numero de jugadores
    var numRand = generarNumeroRandom(0, partida.num_jugadores_ativos); //Numero aleatorio entero entre 0 y numero de jugadores de la partida
    var idJugadorTurno = partida.jugadores[numRand]; // Elegimos el id corrspondiente al numero aleatorio


    DAOPartida.inicializarTurnos(partida.id, idJugadorTurno, numTurnosPartida, function(err, insertOK) {
        callback(insertOK);
    });
};


/** Función que inicializa el tablero de una partida.
 * 
 * @param {type} partida
 * @param {type} callback
 * @returns {nm$_SApartidas.inicializarTablero}
 */
function inicializarTablero(partida, callback) {
    if (callback === undefined)
        callback = function() {};


    var cartasInicio = ReglasJuego.cartasInicioTablero;
    var todoOK = true;
    var numPepita = generarNumeroRandom(0, ReglasJuego.numCasillasFinales);
    var cont = 0;


    cartasInicio.forEach(function(c) {

        if (c.numCarta === "DNK" && numPepita === cont) {

            DAOTablero.ponerFichaEnTablero(partida.id, 0, c.numCarta, c.coor_X, c.coor_Y, 1, function(err, insertOK) {
                if (err) {
                    todoOK = todoOK && false;
                } else {

                    todoOK = todoOK && insertOK;
                }
            });
            cont++;


        } else if (c.numCarta === "DNK") {
            DAOTablero.ponerFichaEnTablero(partida.id, 0, c.numCarta, c.coor_X, c.coor_Y, 0, function(err, insertOK) {
                if (err) {
                    todoOK = todoOK && false;
                } else {
                    todoOK = todoOK && insertOK;
                }

            });
            cont++;
        } else {
            DAOTablero.ponerFichaEnTablero(partida.id, 0, c.numCarta, c.coor_X, c.coor_Y, 0, function(err, insertOK) {
                if (err) {
                    todoOK = todoOK && false;
                } else {
                    todoOK = todoOK && insertOK;
                }
            });
        }


    });

    callback(todoOK);

}



//**********************************************************************************************
//**********************************************************************************************
//                                  Funciones COMENTARIOS
//**********************************************************************************************
//**********************************************************************************************



miRouter.post("/registrar_comentario_:id_partida.html", is_login, function(request, response) {
    //Comprobamos si existe ya un usuario que el nick que nos pasa.

    if (request.mi_llave) {
        console.log("comentario intro: ");
        console.log("'" + request.body.comentario + "'");


        DAOPartida.buscarPartidaByNombre(request.params.id_partida, function(err, partida) {
            if (err) {
                response.cookie("mensaje_partida", "ERROR al registrar el comentario.", { maxAge: 86400000 });
                response.redirect("./jugarpartida_" + partida.id + ".html");
            } else {
                if (request.body.comentario !== "") {
                    var miTComent = new TComentario(-1, partida.id, request.session.id_usuario, null, null, undefined, request.body.comentario);
                    console.log("insertando comentario...");
                    DAOComentarios.insertarComentario(miTComent, function(error, result) {

                        if (error) {
                            response.cookie("mensaje_partida", "ERROR al registrar el comentario.", { maxAge: 86400000 });
                            response.redirect("./jugarpartida_" + partida.id + ".html");
                        } else {
                            response.redirect("./jugarpartida_" + partida.id + ".html");
                        }
                    });
                } else {
                    console.log("comentario vacio");
                    response.cookie("mensaje_partida", "ERROR: comentario vacio.", { maxAge: 86400000 });
                    response.redirect("./jugarpartida_" + partida.id + ".html");
                }
            }
        });

    } else {
        response.redirect("../usuarios/login_usuario.html");
    }


});





//**********************************************************************************************
//**********************************************************************************************
//                                  Funciones Auxiliares
//**********************************************************************************************
//**********************************************************************************************


/** Funcion que genera un numero aleatorio y retorna la base
 *      rango [Min, Max)
 *      
 * @param {Number} min limite inferior del rango
 * @param {Number} max limite superior del rango
 * @returns {Number} numero aleatorio
 */
function generarNumeroRandom(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}


/** Funcion que convierte un numero a binario de 4 dígitos.
 *      
 * @param {Number} numero a convertir
 * @returns {Number} numero binario
 */
function generarBinario(mi_numero) {
    if (mi_numero === undefined) {
        mi_numero = 0;
    }
    var mi_num = Number(mi_numero).toString(2);
    for (var i = mi_num.length; i < 4; i++) {
        mi_num = "0" + mi_num;
    }
    return mi_num;
}



module.exports = miRouter;
