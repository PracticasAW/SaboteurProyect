"use strict";

var TUsuario
 = require("../Negocio/TUsuario");
var mysql = require("mysql");
var dateFormat = require("dateformat");


/** @constructor Constructora del DAO del módulo Usuarios
 * 
 * @param {String} host Host BBDD
 * @param {String} usuario Usuario de conexion a la BBDD
 * @param {String} password Contraseña de conexion a la BBDD
 * @param {String} nombreBD Nombre de la BBDD
 * 
 * @returns {nm$_DAOUsuario.DAOUsuario}
 */
function DAOUsuario(host, usuario, password, nombreBD) {
    this.host = host;
    this.usuario = usuario;
    this.password = password;
    this.nombreBD = nombreBD;}

/** Crea una conexion con la BBDD usando los datos inicializados en la constructora del objeto
 * 
 * @returns {Connection} Objeto conexion a la BBDD
 */
DAOUsuario.prototype.crearConexion = function () {
    return mysql.createConnection({
        host: this.host,
        user: this.usuario,
        password: this.password,
        database: this.nombreBD,
    });
};


/** Método que recive un nick de usuario y una contraseña y comprueba que estén registrados en la BBDD.
 * 
 * @param {string} nickLog Nick de usuario.
 * @param {string} passLog Contraseña del usuario.
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @return {TUsuario} id, nick y password.
 */
DAOUsuario.prototype.login = function (nickLog, passLog, callback) {
    if (callback === undefined)
        callback = function () {};
   
    var conexion = this.crearConexion();

    conexion.connect(function (err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "SELECT id, nick, password FROM usuarios where nick = ?";
            var params = [nickLog];
            conexion.query(sql, params, function (err, row) {
                if (err) {
                    //Error a la hora de ejecutar la query
                    callback(new Error(err), undefined);
                } else {

                    if (row.length > 0) {
                        conexion.end();

                        if (row[0].password === passLog.toString()) {
                            callback(null, row[0]);
                        } else {
                            callback(new Error("Password incorrecta."), undefined);
                        }
                    } else {
                        callback(new Error("No está registrado en el sistema."), undefined);
                    }
                }

            });
        }
    });
};


/** Resgistra un nuevo usuario en el sistema.
 * 
 * @param {Usuario} usuarioNuevo usuario nuevo a registrar
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {Number} ID del usuario Insertado en la BBDD
 */
DAOUsuario.prototype.crearUsuario = function (usuarioNuevo, callback) {
    if (callback === undefined)
        callback = function () {};

    var conexion = this.crearConexion();

    conexion.connect(function (err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var fecha_nacimiento = dateFormat(usuarioNuevo.fecha_nacimiento, "yyyy-mm-dd");

            var sql = "INSERT INTO usuarios(nick, password, nombre_completo, sexo, foto, fecha_nacimiento)" +
                    "VALUES (?,?,?,?,?,?)";

            var params = [usuarioNuevo.nick , usuarioNuevo.password , usuarioNuevo.nombreCompleto ,usuarioNuevo.sexo ,usuarioNuevo.foto , fecha_nacimiento];
            conexion.query(sql, params ,  function (err, resultado) {
                conexion.end();
                if (err) {
                    //Error a la hora de ejecutar la query
                    callback(new Error("Error al insertar un usuario."), undefined);
                } else {
                    callback(null, resultado.insertId);
                }
            });
        }
    });
};



/** Busca un usuario por nick
 * 
 * @param {type} nick
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {TUsuario} Usuario buscado por Nick con los datos de la BBDD 
 *                    undefined si no se encuentra en la BBDD
 */
DAOUsuario.prototype.buscarUsuarioByNick = function (nick, callback) {
    if (callback === undefined)
        callback = function () {};

    var conexion = this.crearConexion();

    conexion.connect(function (err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "SELECT * FROM usuarios WHERE nick = ?";
            var params = [nick];
            
            conexion.query(sql, params, function (err, rows) {
                conexion.end();
                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al buscar usuario: " + err), undefined);
                } else {
                    if (rows.length>0)
                        callback(null, rows[0]);
                    else
                        callback(null, undefined);
                }
            });
        }
    });
};


/** Busca un usuario por ID
 * 
 * @param {type} id_usuario id de usuario
 * @param {function} callback Función callBack para el retorno del resultado.
 * 
 * @returns {TUsuario} Usuario buscado por ID con los datos de la BBDD 
 */
DAOUsuario.prototype.buscarUsuarioByID = function (id_usuario, callback) {
    if (callback === undefined)
        callback = function () {};

    var conexion = this.crearConexion();

    conexion.connect(function (err) {
        if (err) {
            //Error a la hora de conectar con la BBDD
            callback(new Error(err), undefined);
        } else {
            var sql = "SELECT * FROM `usuarios` WHERE id = ?";
            var params = [id_usuario];

            conexion.query(sql, params, function (err, rows) {
                conexion.end();
                if (err) {
                    //Error al ejecutar la query
                    callback(new Error("Error al buscar usuario: " + err), undefined);
                } else {
                    if (rows.length>0)
                        callback(null, rows[0]);
                    else
                        callback(null, undefined);
                }
            });
        }
    });
};

/**
 * 
 * @param {type} nick
 * @param {type} callback
 * @returns {undefined}
 */
DAOUsuario.prototype.buscarFotoByNick = function (nick, callback) {
    if (callback === undefined)
        callback = function () {};

    var conexion = this.crearConexion();

    conexion.connect(function (err) {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            var sql = "SELECT foto FROM usuarios WHERE nick = ?";
            var params = [nick];
            conexion.query(sql, params, function (err, result) {
                conexion.end();

                if (err) {
                    console.log("ERROR BBDD: " + err);
                    callback(err);
                } else {
                    
                    if (result.length === 0) {
                        callback(null, undefined);
                    } else {
                        callback(null, result[0].foto);
                    }
                }
            });
        }
    });
};




module.exports = DAOUsuario;