"use strict";


var mysql = require("mysql");

/** @constructor Constructora del Objeto DAO del Módulo Partidas
 * 
 * @param {String} host Host BBDD
 * @param {String} usuario Usuario de conexion a la BBDD
 * @param {String} password Contraseña de conexion a la BBDD
 * @param {String} nombreBD Nombre de la BBDD
 * 
 * @returns {nm$_DAOPartida.DAOPartida}
 */
function DAOTablero(host, usuario, password, nombreBD) {
    this.host = host;
    this.usuario = usuario;
    this.password = password;
    this.nombreBD = nombreBD;
}



/** Crea una conexion con la BBDD usando los datos inicializados en la constructora del objeto
 * 
 * @returns {Connection} Objeto conexion a la BBDD
 */
DAOTablero.prototype.crearConexion = function() {
    return mysql.createConnection({
        host: this.host,
        user: this.usuario,
        password: this.password,
        database: this.nombreBD
    });
};



/** Inserta una carta a nombre de un jugador en el tablero de una partida con las coordenadas (x,y) correspondientes
 * 
 * @param {Number} id_partida id de la partida
 * @param {Number} id_usuario id del usuario
 * @param {Number} num_carta numero identificador de la carta
 * @param {Number} coor_x coordenada x del tablero
 * @param {Number} coor_y coordenada y del tablero
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {Number} id de la carta insertada en tablero
 */
DAOTablero.prototype.ponerFichaEnTablero = function(id_partida, id_usuario, num_carta, coor_x, coor_y, pepita, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "INSERT INTO `cartas_tablero`(`id_partida`, `id_usuario`, `num_carta`, `coor_X`, `coor_Y`, `pepita`) " +
                "VALUES (?,?,?,?,?,?)";

            var params = [id_partida, id_usuario, num_carta, coor_x, coor_y, pepita];

            conexion.query(sql, params, function(err, rows) {
                conexion.end();
                if (err) {
                    //Error a la hora de ejecutar la query
                    console.log("error al insertar carta en tablero: " + err);
                    callback(new Error("Error al insertar una carta en tablero."), undefined);
                } else {
                    callback(null, "Carta insertada correctamente, ID: " + rows.insertId);
                }
            });
        }
    });
};



/** Busca en la BBDD las cartas que tiene un usuario en una partida 
 * 
 * @param {number} idUsuario id de usuario
 * @param {Number} idPartida id de partida
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {Array(Number)} Array con los numeros identificadores de carta
 */
DAOTablero.prototype.cargarFichasDeJugador = function(idUsuario, idPartida, callback) {
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

/** Retorna el tablero con la fichas de la partida pasada por parametro 
 * 
 * @param {Number} id_partida id de la partida 
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {Matriz(Number)} id de la carta insertada en tablero
 */
DAOTablero.prototype.cargarFichasTablero = function(id_partida, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "SELECT num_carta, coor_X, coor_Y, pepita, us.nick FROM cartas_tablero as tab join usuarios as us WHERE tab.id_usuario = us.id AND id_partida = ?";

            var params = [id_partida];

            conexion.query(sql, params, function(err, rows) {
                conexion.end();
                if (err) {
                    //Error a la hora de ejecutar la query
                    callback(new Error("Error al buscar las cartas del tablero."), undefined);
                } else {

                    //Construimos la matriz del tablero con las cartas de la BBDD

                    if (rows.affectedRows === 0) {
                        callback(new Error("Partida no existente", undefined));
                    } else {

                        var matrizTablero = new Array(7);
                        for (var i = 0; i < 7; i++) {
                            matrizTablero[i] = new Array(7);
                        }

                        rows.forEach(function(n) {
                            matrizTablero[n.coor_X][n.coor_Y] = [n.num_carta, n.nick, n.pepita];
                        });
                        callback(null, matrizTablero);
                    }
                }
            });
        }
    });
};

/** Busca en la BBDD una carta de una partida situada en una posición dada
 * 
 * @param {Number} idPartida id de partida
 * @param {Number} pos_x
 * @param {Number} pos_y
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {Number} Identificación de la carta o undefined si no encuentra nada.
 */
DAOTablero.prototype.buscarFicha = function(idPartida, pos_x, pos_y, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "SELECT num_carta FROM cartas_tablero WHERE id_partida = ? AND coor_X = ? AND coor_Y = ?";

            var params = [idPartida, pos_x, pos_y];

            conexion.query(sql, params, function(err, rows) {
                conexion.end();

                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al buscar partidas Terminadas: " + err), undefined);
                } else {
                    if (rows.length > 0) {
                        callback(null, rows[0].num_carta);
                    } else {
                        callback(null, undefined);
                    }
                }
            });
        }
    });
};

/** Actualizamos la carta dnk 
 * 
 * @param {Number} idPartida ID de la partida
 * @param {Number} pos_x donde está la carta
 * @param {Number} pos_y donde está la carta
 * 
 * @returns {Number} undefined si no hay cambio, 1 si hay cambio pero no pepita y 2 si hay cambio y pepita.
 */
DAOTablero.prototype.actualizarDNK = function(idPartida, pos_x, pos_y, callback) {

    var conexion = this.crearConexion();
    var nombre_cambio = "NoGold";

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "SELECT * FROM cartas_tablero WHERE id_partida = ? AND coor_X = ? AND coor_y = ?";

            var params = [idPartida, pos_x, pos_y];

            conexion.query(sql, params, function(err, resultado) {
                if (err) {
                    //Error al ejecutar la query
                    console.log(err);
                    callback(new Error(err), undefined);
                } else {
                    if (resultado.length > 0) {
                        //Comprobamo si es pepita o no
                        if (resultado[0].pepita === 1) {
                            nombre_cambio = "Gold";
                        }
                        sql = "UPDATE cartas_tablero SET num_carta = ? WHERE id_partida = ? AND coor_X = ? AND coor_y = ?";

                        var params = [nombre_cambio, idPartida, pos_x, pos_y];

                        conexion.query(sql, params, function(err, resultado_2) {
                            conexion.end();
                            if (err) {
                                //Error al ejecutar la query
                                callback(new Error(err), undefined);
                            } else {
                                if (resultado[0].pepita === 1) {
                                    callback(null, 2);
                                } else {
                                    callback(null, 1);
                                }
                            }
                        });
                    } else {
                        callback(new Error(err), undefined);
                    }
                }

            });
        }
    });
};

/** Actualizamos una carta dada 
 * 
 * @param {Number} id_partida ID de la partida
 * @param {Number} id_usuario ID del jugador
 * @param {Number} num_carta numero de carta que vamos a cambiar.
 * @param {Number} num_carta_cambio numero de carta a la que vamos a cambiar.
 * 
 * @returns {Boolean} true si lo cambia, false si no la cambia.
 */
DAOTablero.prototype.actualizarCarta = function(id_partida, id_usuario, num_carta, num_carta_cambio, callback) {

    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {

            var sql = "UPDATE cartas_usuario SET num_carta = ? WHERE id_partida = ? AND id_usuario = ? AND num_carta = ? LIMIT 1";

            var params = [num_carta_cambio, id_partida, id_usuario, num_carta];

            conexion.query(sql, params, function(err, resultado) {
                conexion.end();
                if (err) {
                    //Error al ejecutar la query
                    callback(new Error(err), undefined);
                } else {
                    callback(null, true);
                }
            });
        }
    });
};

/** Eliminar una carta dada del tablero
 * 
 * @param {Number} id_partida ID de la partida
 * @param {Number} pos_x Posicion x del tablero
 * @param {Number} pos_y Posicion y del tablero
 * @param {Number} num_carta_cambio numero de carta a la que vamos a cambiar.
 * 
 * @returns {Boolean} true si lo cambia, false si no la cambia.
 */
DAOTablero.prototype.eliminarCartaDelTablero = function(idPartida, pos_x, pos_y, callback) {

    var conexion = this.crearConexion();
    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), false);
        } else {
            var sql = "DELETE FROM cartas_tablero WHERE id_partida = ? AND coor_X = ? AND coor_y = ?";

            var params = [idPartida, pos_x, pos_y];

            conexion.query(sql, params, function(err, resultado) {
                conexion.end();
                if (err) {
                    //Error al ejecutar la query
                    console.log(err);
                    callback(new Error(err), undefined);
                } else {
                    callback(null, true);
                }
            });
        }
    });
};



module.exports = DAOTablero;
