"use strict";
/**
 * prueba de comentario JSDoc en cabezara fichero
 * 
 * @type Module mysql|Module mysql
 */

var mysql = require("mysql");
var dateFormat = require("dateformat");
var TPartida = require('../Negocio/TPartida');

/** @constructor Constructora del Objeto DAO del Módulo Partidas
 * 
 * @param {String} host Host BBDD
 * @param {String} usuario Usuario de conexion a la BBDD
 * @param {String} password Contraseña de conexion a la BBDD
 * @param {String} nombreBD Nombre de la BBDD
 * 
 * @returns {nm$_DAOPartida.DAOPartida}
 */
function DAOPartida(host, usuario, password, nombreBD) {
    this.host = host;
    this.usuario = usuario;
    this.password = password;
    this.nombreBD = nombreBD;
}

/** Crea una conexion con la BBDD usando los datos inicializados en la constructora del objeto
 * 
 * @returns {Connection} Objeto conexion a la BBDD
 */
DAOPartida.prototype.crearConexion = function() {
    return mysql.createConnection({
        host: this.host,
        user: this.usuario,
        password: this.password,
        database: this.nombreBD
    });
};

//========================================================
//----------------------BUSQUEDAS-------------------------
//========================================================

/** Busca una partida por ID en la BBDD
 * 
 * @param {Number} id_partida ID de la partida
 a buscar
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {TPartida} Partida buscada por ID con los datos de la BBDD 
 */
DAOPartida.prototype.buscarPartidaByID = function(id_partida, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "SELECT *, (select count(jug.id_partida) from jugadores as jug where jug.id_partida=p.id) as num_jugadores_activos FROM partidas as p WHERE p.id = ?";

            var params = [id_partida];

            conexion.query(sql, params, function(err, result) {
                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al buscar la partida: " + err), undefined);
                } else {
                    if (result.length > 0) {

                        //Buscamos los ID de los jugadores de la partida
                        var sql = "SELECT id_jugador FROM jugadores WHERE id_partida = ?";

                        var params = [id_partida];

                        conexion.query(sql, params, function(err, rows) {
                            conexion.end();
                            if (err) {
                                //Error al ejecutar la query
                                callback(new Error("Error al buscar la partida: " + err), undefined);
                            } else {

                                if (result.length > 0) {
                                    //Añadimos el resultado de la BBDD al array de jugadores
                                    var jugadores = [];
                                    rows.forEach(function(j) {
                                        jugadores.push(j.id_jugador);
                                    });

                                    //Creamos un objeto partida con todos los datos
                                    var partida = new TPartida(result[0].id, result[0].nombre, dateFormat(result[0].fecha_creacion, "dd/mm/yyyy"),
                                        result[0].turno, result[0].creador, result[0].num_jugadores_activos, result[0].num_jugadores_maximos,
                                        result[0].ganador, result[0].estado, result[0].mov_restantes, jugadores, undefined);

                                    callback(null, partida);
                                } else {

                                    callback(null, undefined);
                                }
                            }
                        });

                    } else {
                        callback(null, undefined);
                    }
                }
            });
        }
    });
};




/** Busca una partida por nombre en la BBDD
 * 
 * @param {Number} id_partida ID de la partida a buscar
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {TPartida} Partida buscada por ID con los datos de la BBDD 
 */
DAOPartida.prototype.buscarPartidaByNombre = function(nombre_partida, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "SELECT * FROM partidas WHERE nombre = ?";

            var params = [nombre_partida];

            conexion.query(sql, params, function(err, rows) {
                conexion.end();
                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al buscar la partida: " + err), undefined);
                } else {
                    if (rows.length > 0)
                        callback(null, rows[0]);
                    else
                        callback(null, undefined);
                }
            });
        }
    });
};





/** Busca el nick de un creador de una partida en la BBDD
 * 
 * @param {Number} id_partida ID de la partida a buscar
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {TPartida} Nick del creador de la partida.
 */
DAOPartida.prototype.buscarCreadorByID = function(id_partida, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "SELECT u.nick as nickCreador FROM partidas" + " p join jugadores j on p.id=j.id_partida join usuarios u on p.creador=u.id" + " WHERE p.id= ? group by p.id";

            var params = [id_partida];

            conexion.query(sql, params, function(err, rows) {
                conexion.end();
                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al buscar la partida: " + err), undefined);
                } else {
                    if (rows.length > 0)
                        callback(null, rows[0].nickCreador);
                    else
                        callback(null, undefined);
                }
            });
        }
    });
};






/** Busca el roll de un jugador de una partida dada en la BBDD
 * 
 * @param {Number} id_partida ID de la partida a buscar
 * @param {Number} id_jugador ID del jugador a buscar
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {string} roll del jugador de la partida.
 */
DAOPartida.prototype.buscarRollJugador = function(id_partida, id_jugador, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "SELECT roll FROM jugadores WHERE id_partida=? AND id_jugador=?";

            var params = [id_partida, id_jugador];

            conexion.query(sql, params, function(err, rows) {
                conexion.end();
                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al buscar la partida: " + err), undefined);
                } else {
                    if (rows.length > 0)
                        callback(null, rows[0].roll);
                    else
                        callback(null, undefined);
                }
            });
        }
    });
};

/** Busca el pico de un jugador de una partida dada en la BBDD
 * 
 * @param {Number} id_partida ID de la partida a buscar
 * @param {Number} id_jugador ID del jugador a buscar
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {string} estado del pico del jugador de la partida.
 */
DAOPartida.prototype.buscarPicoJugador = function(id_partida, id_jugador, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "SELECT pico FROM jugadores WHERE id_partida=? AND id_jugador=?";

            var params = [id_partida, id_jugador];

            conexion.query(sql, params, function(err, rows) {
                conexion.end();
                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al buscar la partida: " + err), undefined);
                } else {
                    if (rows.length > 0)
                        callback(null, rows[0].pico);
                    else
                        callback(null, undefined);
                }
            });
        }
    });
};






/** Busca los jugadores de una partida
 * 
 * @param {Number} idPartida ID de partida para buscar los jugadores
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {Array(Number)} Array con los nicks de los jugadores
 */
DAOPartida.prototype.buscarJugadoresPartida = function(idPartida, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "SELECT nick, jug.pico, jug.id_jugador FROM jugadores as jug join usuarios as us WHERE jug.id_jugador=us.id AND id_partida= ?";

            var params = [idPartida];

            conexion.query(sql, params, function(err, rows) {
                conexion.end();
                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al buscar jugadores: " + err), undefined);
                } else {
                    if (rows.affectedRows === 0) {
                        callback(new Error("Partida no existente", undefined));
                    } else {
                        /*callback(null, rows.reduce(function(ac, n) {
                            ac.push(n.id_jugador);
                            return ac;
                        }, []));*/
                        if (rows.affectedRows === 0) {
                            callback(new Error("No existen usuarios en esta partida", undefined));
                        } else {
                            callback(null, rows);
                        }
                    }
                }
            });
        }
    });
};






/** Busca las partidas abiertas disponibles para el jugador que hay en la BBDD así como los jugadores adscritos a la misma
 * 
 * @param {Number} idJugador ID del jugador
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {Array(TPartida)} Array con las partidas abiertas y los jugadores adscritos a la misma
 */
DAOPartida.prototype.buscarPartidasDisponiblesParaUsuario = function(idJugador, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "SELECT  p.id, p.nombre, p.fecha_creacion, (select count(id_partida) from jugadores where id_partida=p.id) as num_jugadores_activos, p.num_jugadores_maximos, u.nick AS nickJugador " +
                "FROM  partidas AS p JOIN jugadores AS jug ON p.id = jug.id_partida JOIN usuarios AS u ON jug.id_jugador = u.id " +
                "WHERE p.estado = 'ESPERA' AND (select count(id_partida) from jugadores where id_partida=p.id)< p.num_jugadores_maximos AND p.id NOT IN " + "( SELECT jug.id_partida " +
                "FROM jugadores AS jug " +
                "WHERE jug.id_jugador = ?)";

            var params = [idJugador];

            conexion.query(sql, params, function(err, rows) {
                conexion.end();
                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al buscar partidas abiertas: " + err), undefined);
                } else {

                    var contPartida = 0;
                    var partidasAbiertas = [];

                    //Se recorren las filas obtenidas, en las que hay tantas filas por partida como jugadores tenga dicha partida
                    while (contPartida < rows.length) {

                        //Numero de jugadores
                        var numJug = rows[contPartida].num_jugadores_activos;

                        //Se crea un objeto partida con la informacion de la BBDD
                        var partida = new TPartida(rows[contPartida].id, rows[contPartida].nombre, dateFormat(rows[contPartida].fecha_creacion, "dd/mm/yyyy"),
                            undefined, undefined, rows[contPartida].num_jugadores_activos, rows[contPartida].num_jugadores_maximos,
                            undefined, undefined, []);

                        //Se recorren las filas correspondientes a los jugadores obteniendo su nick
                        for (var i = contPartida; i < contPartida + numJug; i++) {
                            partida.jugadores.push(rows[i].nickJugador);
                        }

                        //Se añade la partida completa al array de partidas abiertas
                        partidasAbiertas.push(partida);

                        //Se actualiza el contador con la posicion de la siguente partida
                        contPartida += numJug;
                    }
                    callback(null, partidasAbiertas);
                }
            });
        }
    });
};






/** Busca las partidas en las que el usuario se haya unido pero que aún esten a la espera de iniciarse
 * 
 * @param {Number} idJugador ID del jugador
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {Array(TPartida)} Array con las partidas en espera y los jugadores adscritos a la misma
 */
DAOPartida.prototype.buscarPartidasDeJugadorEnEspera = function(idJugador, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            console.log(err);
            callback(new Error(err), []);
        } else {
            var sql = "SELECT p.id,  p.nombre, p.fecha_creacion, (select count(id_partida) from jugadores where id_partida=p.id) as num_jugadores_activos, p.num_jugadores_maximos, u.nick AS nickJugador " +
                "FROM partidas AS p JOIN  jugadores AS jug ON p.id = jug.id_partida  JOIN usuarios AS u ON jug.id_jugador = u.id " +
                "WHERE  p.estado = 'ESPERA' AND p.creador != ? AND (select count(id_partida) from jugadores where id_partida=p.id) < p.num_jugadores_maximos AND p.id IN " +
                "(  SELECT jug.id_partida " +
                "FROM  jugadores AS jug " +
                "WHERE jug.id_jugador = ?)";

            var params = [idJugador, idJugador];

            conexion.query(sql, params, function(err, rows) {
                conexion.end();
                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al buscar partidas en espera: " + err), undefined);
                } else {

                    var contPartida = 0;
                    var partidasEspera = [];

                    //Se recorren las filas obtenidas, en las que hay tantas filas por partida como jugadores tenga dicha partida
                    while (contPartida < rows.length) {

                        //Numero de jugadores
                        var numJug = rows[contPartida].num_jugadores_activos;

                        //Se crea un objeto partida con la informacion de la BBDD
                        var partida = new TPartida(rows[contPartida].id, rows[contPartida].nombre, dateFormat(rows[contPartida].fecha_creacion, "dd/mm/yyyy"),
                            undefined, undefined, rows[contPartida].num_jugadores_activos, rows[contPartida].num_jugadores_maximos,
                            undefined, undefined, []);

                        //Se recorren las filas correspondientes a los jugadores obteniendo su nick
                        for (var i = contPartida; i < contPartida + numJug; i++) {
                            partida.jugadores.push(rows[i].nickJugador);
                            console.log("AÑADIENDO PARTIDA EN ESPERA");
                        }

                        //Se añade la partida completa al array de partidas espera
                        partidasEspera.push(partida);

                        //Se actualiza el contador con la posicion de la siguente partida
                        contPartida += numJug;
                    }
                    callback(null, partidasEspera);
                }
            });
        }
    });
};







/** Busca las partidas creadas del usuario pasado por parámetro
 * 
 * @param {Number} idUsuario ID de usuario
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {Array(TPartidas)} Array con las partidas creadas del usuario
 */
DAOPartida.prototype.buscarPartidasCreadasPorUsuario = function(idJugador, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "SELECT p.id, p.nombre, p.fecha_creacion, p.creador, (select count(id_partida) from jugadores where id_partida=p.id) as num_jugadores_activos, p.num_jugadores_maximos FROM partidas AS p WHERE p.estado = 'ESPERA' and p.creador = ?";

            var params = [idJugador];

            conexion.query(sql, params, function(err, rows) {
                conexion.end();

                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al buscar paritdas Terminadas: " + err), undefined);
                } else {

                    var partidasCreadas = [];
                    rows.forEach(function(n) {
                        partidasCreadas.push(new TPartida(n.id, n.nombre, dateFormat(n.fecha_creacion, "dd/mm/yyyy"), undefined, undefined, n.num_jugadores_activos, n.num_jugadores_maximos, undefined, undefined, undefined, undefined));
                    });


                    callback(null, partidasCreadas);
                }
            });
        }
    });
};







/** Busca las partidas terminadas del usuario pasado por parámetro
 * 
 * @param {Number} idUsuario ID de usuario
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {Array(TPartidas)} Array con las partidas terminadas de usuario
 */
DAOPartida.prototype.buscarPartidasTerminadas = function(idUsuario, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "SELECT p.id, p.nombre, u.nick as nickCreador, p.ganador " +
                "FROM partidas p join jugadores j on p.id=j.id_partida join usuarios u on p.creador=u.id " +
                "where estado = 'TERMINADA' and j.id_jugador= ?";

            var params = [idUsuario];

            conexion.query(sql, params, function(err, rows) {
                conexion.end();

                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al buscar paritdas Terminadas: " + err), undefined);
                } else {
                    var partidasTerminadas = rows.reduce(function(ac, n) {
                        //fecha
                        ac.push(new TPartida(n.id, n.nombre, undefined, undefined, undefined, undefined, undefined, n.ganador, undefined, undefined, undefined, n.nickCreador));
                        return ac;
                    }, []);

                    //console.log(partidaTerminadas);
                    callback(null, partidasTerminadas);
                }
            });
        }
    });
};






/** Busca las partidas ACTIVAS de un usuario en la BBDD y las retorna en la funcion callback
 * IMPORTANTE: Se retornan las partidas con el id del jugador que posé el turno, no el nick
 * 
 * @param {Number} idUsuario
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {Array(TPartidas)} Array con las partidas Activas de usuario (idPartida, nombrePartida, nickCreador, fechaCreacion, idTurno)
 */
DAOPartida.prototype.buscarPartidasActivas = function(idUsuario, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            //nombrePartida, usuarioCreador, fecha, idTurno
            var sql = "SELECT p.id, p.nombre, u.nick as nickCreador, p.fecha_creacion, p.turno " +
                "FROM partidas p join jugadores j on p.id=j.id_partida join usuarios u on p.creador=u.id " +
                "where p.estado = 'ACTIVA' and j.id_jugador= ?";

            var params = [idUsuario];

            conexion.query(sql, params, function(err, rows) {
                conexion.end();

                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al buscar paritdas Terminadas: " + err), undefined);
                } else {

                    if (rows.length === 0) {
                        callback(null, undefined);
                    } else {
                        //Se crea el array de partidas con el resultado de la query
                        var partidasActivas = rows.reduce(function(ac, n) {
                            ac.push(new TPartida(n.id, n.nombre, dateFormat(n.fecha_creacion, "dd/mm/yyyy"), undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, n.nickCreador));
                            return ac;
                        }, []);

                        callback(null, partidasActivas);
                    }
                }
            });
        }
    });
};







/** Retorna el nick del usuario que posé el turno de una partida
 * 
 * @param {Number} idPartida
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {String} nick del usuario que posé el turno
 */
DAOPartida.prototype.buscarTurnoPartidaByID = function(idPartida, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            //
            var sql = "SELECT u.nick as nickTurno " +
                "FROM partidas p JOIN usuarios u ON p.turno = u.id " +
                "WHERE p.id = ?";

            var params = [idPartida];

            conexion.query(sql, params, function(err, row) {
                conexion.end();

                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al buscar partidas Terminadas: " + err), undefined);
                } else {
                    if (row.length === 0) {
                        callback(null, undefined);
                    } else {
                        callback(null, row[0].nickTurno);
                    }
                }
            });
        }
    });
};







//========================================================
//---------------------CREAR / añadir---------------------
//========================================================


/** Crea una partida nueva en la BBDD con el objeto pasado por parametro y añade al creador como jugador de la partida
 * 
 * @param {TPartida} partidaNueva Objeto Partida con los datos necesarios para crear un apartida (nombre, idCreador y jugadores maximos)
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {Number} ID de la partida creada
 */
DAOPartida.prototype.crearPartida = function(partidaNueva, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "INSERT INTO partidas(nombre, fecha_creacion, turno, creador, num_jugadores_maximos, ganador, estado, mov_restantes) " +
                "VALUES (?, CURRENT_DATE , null ,? ,?, null, 'ESPERA', null)";

            var params = [partidaNueva.nombre, partidaNueva.creador, partidaNueva.num_jugadores_Max];

            conexion.query(sql, params, function(err, resultado) {
                if (err) {
                    //Error a la hora de ejecutar la query
                    callback(new Error("Error al insertar partida: " + err), undefined);
                } else {

                    sql = "INSERT INTO jugadores(id_partida, id_jugador) " +
                        "VALUES (?,?)";

                    var params = [resultado.insertId, partidaNueva.creador];

                    conexion.query(sql, params, function(err, resultJugador) {
                        conexion.end();
                        if (err) {
                            //Error a la hora de ejecutar la query
                            callback(new Error("Error al insetar jugador: " + err), undefined);
                        } else {
                            callback(null, "Partida creada y jugador añadido correctamente. ID_Partida: " + resultado.insertId + ", ID_Jugador: " + resultJugador.insertId);
                        }
                    });
                }
            });
        }
    });
};






/** Añade un usuario a una partida
 * 
 * @param {Number} idPartida ID de partida 
 * @param {Number} idUsuario ID de usuario
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {Number} ID de jugador insertado
 */
DAOPartida.prototype.añadirJugadorAPartida = function(idPartida, idUsuario, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "INSERT INTO jugadores(id_partida, id_jugador, roll) " +
                "VALUES (?,?, null)";

            var params = [idPartida, idUsuario];

            conexion.query(sql, params, function(err, resultJugador) {
                conexion.end();
                if (err) {
                    //Error a la hora de ejecutar la query
                    callback(new Error("Error al insertar jugador: " + err), undefined);
                } else {
                    callback(null, resultJugador.insertId);
                }
            });
        }
    });
};








/**
 * 
 * @param {type} idPartida
 * @param {type} idUsuario
 * @param {type} callback
 * @returns {undefined}
 */
DAOPartida.prototype.desunirJugadorAPartida = function(idPartida, idUsuario, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "DELETE FROM jugadores WHERE id_partida = ? and id_jugador = ?";

            var params = [idPartida, idUsuario];

            conexion.query(sql, params, function(err, resultJugador) {
                conexion.end();
                if (err) {
                    //Error a la hora de ejecutar la query
                    callback(new Error("Error al desunir a jugador: " + err), undefined);
                } else {
                    callback(null, resultJugador.insertId);
                }
            });
        }
    });
};






/** Cambia el turno a una partida 
 * 
 * @param {Number} id_partida ID de la partida
 * @param {Number} id_jug_turno_actual ID del jugador que tiene el turno actual
 * @param {function} callback Función callBack que retorna ok si cambia.
 * 
 * @returns {Boolean} True si la operacion fue correcta
 */
DAOPartida.prototype.cambiarTurnoPartida = function(id_partida, id_jug_turno_actual, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "SELECT * FROM jugadores WHERE id_partida = ? ORDER BY ID";

            var params = [id_partida];

            conexion.query(sql, params, function(err, resultado) {
                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al buscar turno de partida: " + err), undefined);
                } else {
                    //Buscamos ahora donde está nuestro usuario actual
                    var encontrado = false;
                    for (var i = 0; i < resultado.length && !encontrado; i++) {
                        if (resultado[i].id_jugador === id_jug_turno_actual) {
                            encontrado = true;
                        }
                    }
                    //Realizamos la modificación: 
                    if (i >= resultado.length)
                        i = 0;
                    sql = "UPDATE PARTIDAS set turno = ? WHERE id = ?";

                    var params = [resultado[i].id_jugador, id_partida];

                    conexion.query(sql, params, function(err, resultado_2) {
                        conexion.end();
                        if (err) {
                            //Error al ejecutar la query
                            callback(new Error("Error al actualizar el turno: " + err), undefined);
                        } else {
                            //Buscamos ahora donde está nuestro usuario actual
                            callback(null, true);
                        }

                    });
                }

            });
        }
    });
};





/**
 * 
 * @param {type} idPartida
 * @param {type} id_nuevoTurno
 * @param {type} numTurnos
 * @param {type} callback
 * @returns {undefined}
 */
DAOPartida.prototype.inicializarTurnos = function(idPartida, id_nuevoTurno, numTurnos, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "UPDATE partidas SET turno= ? , mov_restantes= ? WHERE id = ?";

            var params = [id_nuevoTurno, numTurnos, idPartida];

            conexion.query(sql, params, function(err, resultado) {
                conexion.end();
                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al inicializar turnos: " + err), undefined);
                } else {
                    callback(null, true);
                }

            });
        }
    });
};






/** Cambia el estado de una partida a ACTIVA
 * 
 * @param {Number} idPartida ID partida a activar
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {Boolean} True si la operacion fue correcta
 */
DAOPartida.prototype.activarPartida = function(idPartida, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();
    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "UPDATE partidas SET estado = 'ACTIVA' WHERE id = ?";

            var params = [idPartida];

            conexion.query(sql, params, function(err, resultado) {
                conexion.end();
                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al activar partida: " + err), undefined);
                } else {
                    if (resultado.affectedRows === 0) {
                        callback(new Error("Partida no existente", undefined));
                    } else {
                        callback(null, true);
                    }
                }
            });
        }
    });
};







/** Funcion que reduce los movimientos restantes.
 * 
 * @param {Number} idPartida ID partida a activar
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {Boolean} True si la operacion fue correcta
 */
DAOPartida.prototype.reducirMovimiento = function(idPartida, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "UPDATE partidas SET mov_restantes= mov_restantes-1 where id= ?";

            var params = [idPartida];

            conexion.query(sql, params, function(err, resultado) {
                conexion.end();
                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al reducir Movimiento: " + err), undefined);
                } else {
                    callback(null, true);
                }
            });
        }
    });
};






/** Funcion que nos devuelve los movimientos restantes.
 * 
 * @param {Number} idPartida ID partida a activar
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {Number} Número de movimientos restantes o undefined si no encuentra la partida.
 */
DAOPartida.prototype.movimientosRestantes = function(idPartida, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "SELECT mov_restantes FROM partidas WHERE id= ?";

            var params = [idPartida];

            conexion.query(sql, params, function(err, resultado) {
                conexion.end();
                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al buscar Movimiento: " + err), undefined);
                } else {
                    if (resultado.length > 0) {
                        callback(null, resultado[0].mov_restantes);
                    } else {
                        callback(null, undefined);
                    }
                }
            });
        }
    });
};





/** Cambia el estado de una partida a ACTIVA
 * 
 * @param {Number} idPartida ID partida a activar
 * @param {Number} idGanador ID del ganador de la partida.
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {Boolean} True si la operacion fue correcta
 */
DAOPartida.prototype.finalizarPartida = function(idPartida, idGanador, tipo_fin, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();
    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            console.log("ID ganador pasado: " + idGanador);
            var sql = "SELECT roll FROM jugadores WHERE id_jugador=? AND id_partida=?";

            var params = [idGanador, idPartida];

            conexion.query(sql, params, function(err, resultado) {
                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al buscar el roll: " + err), undefined);
                } else {
                    if (resultado.affectedRows === 0) {
                        callback(new Error("Partida no existente", undefined));
                    } else {

                        if (tipo_fin === 'no_pepita') {
                            idGanador = "SABOTEADOR";
                        } else {
                            idGanador = resultado[0].roll;
                        }
                        console.log("ID ganador al update: " + idGanador);
                        sql = "UPDATE partidas SET estado = 'TERMINADA', ganador = ? WHERE id = ?";

                        params = [idGanador, idPartida];

                        conexion.query(sql, params, function(err, resultado) {
                            conexion.end();
                            if (err) {
                                //Error al ejecutar la query
                                callback(new Error("Error al terminar partida: " + err), undefined);
                            } else {
                                if (resultado.affectedRows === 0) {
                                    callback(new Error("Partida no existente", undefined));
                                } else {
                                    callback(null, true);
                                }
                            }
                        });
                    }
                }
            });
        }
    });
};


/** Modificar el pico de un usuario
 * 
 * @param {Number} idPartida ID de partida 
 * @param {Number} idUsuario ID de usuario
 * @param {String} estado al que se cambia el pico
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {Number} true si se ha modificado con éxito o false si no.
 */
DAOPartida.prototype.modificarPico = function(idPartida, idUsuario, estado, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), false);
        } else {
            var sql = "UPDATE jugadores set pico = ? " +
                "WHERE id_partida=? AND id_jugador=?";

            var params = [estado, idPartida, idUsuario];

            console.log("Estado: " + estado);
            console.log("Id de partida: " + idPartida);
            console.log("Id de usuario: " + idUsuario);

            conexion.query(sql, params, function(err, resultJugador) {
                conexion.end();
                if (err) {
                    //Error a la hora de ejecutar la query
                    callback(new Error("Error al insertar jugador: " + err), false);
                } else {
                    //Realizamos el aumento de jugadores en la partida.
                    callback(null, true);
                }
            });
        }
    });
};



//========================================================
//-------------------------CARTAS-------------------------
//========================================================


/** Busca en la BBDD las cartas que posé un usuario en una partida 
 * 
 * @param {number} idUsuario id de usuario
 * @param {Number} idPartida id de partida
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {Array(Number)} Array con los numeros identificadores de carta
 */
DAOPartida.prototype.cargarCartasDeJugador = function(idUsuario, idPartida, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "SELECT num_carta FROM cartas_usuario WHERE id_usuario = ? and id_partida = ?";

            var params = [idUsuario, idPartida];

            conexion.query(sql, params, function(err, rows) {
                conexion.end();

                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al buscar partidas Terminadas: " + err), undefined);
                } else {
                    callback(null, rows.reduce(function(ac, n) {
                        ac.push(n.num_carta);
                        return ac;
                    }, []));
                }
            });
        }
    });
};






/** Inserta una carta en la BBDD, en la tabla que representa las cartas que posé el usuarioen la mano
 * 
 * @param {type} idUsuario ID de usuario
 * @param {type} idPartida ID de partida
 * @param {type} carta ID de la carta
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {Array(Number)} Array con los numeros identificadores de carta
 */
DAOPartida.prototype.insertarCartasJugador = function(idUsuario, idPartida, carta, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {

            var sql = "INSERT INTO cartas_usuario(id_usuario, id_partida, num_carta) VALUES (?, ?, ?)";

            var params = [idUsuario, idPartida, carta];


            conexion.query(sql, params, function(err, rows) {
                conexion.end();

                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al insertar Cartas: " + err), undefined);
                } else {
                    if (rows.affectedRows === 1) {
                        callback(null, true);
                    } else {
                        callback(null, false);
                    }

                }
            });


        }
    });
};






/** Asiga un roll a un jugador en una partida
 *  
 * @param {number} idPartida Id de la partida
 * @param {number} idJugador ID del jugador 
 * @param {String} rol "SABOTEADOR" o "BUSCADOR"
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {boolean)} true si está todo correcto
 *                     False si hay error
 */
DAOPartida.prototype.asignarRolAJugador = function(idPartida, idJugador, rol, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "UPDATE jugadores SET roll = ? WHERE id_partida = ? and id_jugador = ?";

            var params = [rol, idPartida, idJugador];

            conexion.query(sql, params, function(err, rows) {
                conexion.end();
                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al actualizar el rol: " + err), undefined);
                } else {
                    if (rows.affectedRows === 1)
                        callback(null, true);
                    else
                        callback(null, false);
                }
            });
        }
    });
};




module.exports = DAOPartida;
