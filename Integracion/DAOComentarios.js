"use strict";

var TComentario = require('../Negocio/TComentario');

/**
* Funciones necesarias
*   Insertar comentario (idpartida, idsusuario, comentario) return boolean
    Obteber comentarios de una partida (idPartida) return Array[Comentarios]

*
*/

var mysql = require("mysql");

/** @constructor Constructora del Objeto DAO del Módulo Comentarios
 * 
 * @param {String} host Host BBDD
 * @param {String} usuario Usuario de conexion a la BBDD
 * @param {String} password Contraseña de conexion a la BBDD
 * @param {String} nombreBD Nombre de la BBDD
 * 
 * @returns {nm$_DAOComentarios.DAOComentarios}
 */
function DAOComentarios(host, usuario, password, nombreBD) {
    this.host = host;
    this.usuario = usuario;
    this.password = password;
    this.nombreBD = nombreBD;
}



/** Crea una conexion con la BBDD usando los datos inicializados en la constructora del objeto
 * 
 * @returns {Connection} Objeto conexion a la BBDD
 */
DAOComentarios.prototype.crearConexion = function() {
    return mysql.createConnection({
        host: this.host,
        user: this.usuario,
        password: this.password,
        database: this.nombreBD
    });
};


DAOComentarios.prototype.insertarComentario = function(tComentario, callback) {
    if (callback === undefined)
        callback = function() {};

    console.log(tComentario.comentario);

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "INSERT INTO `comentarios`(`id_partida`, `id_usuario`, fecha_hora, comentario) " +
                "VALUES (?,?, NOW(),?)";

            var params = [tComentario.id_partida, tComentario.id_usuario, tComentario.comentario];

            conexion.query(sql, params, function(err, rows) {
                conexion.end();
                if (err) {
                    //Error a la hora de ejecutar la query
                    console.log("error al insertar comentario: " + err);
                    callback(new Error("Error al insertar comentario."), undefined);
                } else {
                    callback(null, rows.insertId);
                }
            });
        }
    });
};



DAOComentarios.prototype.buscarComentariosDePartida = function(id_partida, callback) {
    if (callback === undefined)
        callback = function() {};

    var conexion = this.crearConexion();

    conexion.connect(function(err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "SELECT c.id, c.id_usuario, u.nick, u.foto, c.fecha_hora, c.comentario FROM comentarios c join usuarios u on c.id_usuario= u.id WHERE id_partida = ?";

            var params = [id_partida];

            conexion.query(sql, params, function(err, rows) {
                conexion.end();
                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al buscar los comentarios: " + err), undefined);
                } else {

                    var arrayComentarios = [];
                    rows.forEach(function(c) {
                        arrayComentarios.push(new TComentario(c.id, c.id_partida, c.id_usuario, c.nick, c.foto, c.fecha_hora, c.comentario));
                    });
                    //console.log(arrayComentarios);
                    callback(null, arrayComentarios);
                }
            });
        }
    });
};



module.exports = DAOComentarios;
