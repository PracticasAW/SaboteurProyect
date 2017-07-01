"use strict";
var DAOUsuario = require("./DAOUsuario");
var DAOPartida = require("./DAOPartida");
var DAOTablero = require("./DAOTablero");
var DAOComentarios = require("./DAOComentarios");
var config = require("./config");


/** @constructor Constructor de la Factoria de DAOs
 * 
 * @returns {nm$_FactoriaDAO.FactoriaDAO}
 */
function FactoriaDAO() {
    this.host = config.host;    
    this.usuario = config.usuario;
    this.password = config.password;
    this.nombreBD = config.nombreBD;
}

/** Crea y retorna una DAO del Módulo Usuarios
 * 
 * @returns {nm$_FactoriaDAO.DAOUsuario} DAO del Módulo Usuarios
 */
FactoriaDAO.prototype.creaDAOUsuario = function (){
  return new DAOUsuario(this.host, this.usuario, this.password, this.nombreBD); 
};

/** Crea y retorna una DAO del Módulo partidas
 * 
 * @returns {nm$_FactoriaDAO.DAOPartida} DAO del Módulo Partida
 */
FactoriaDAO.prototype.creaDAOPartida = function (){
  return new DAOPartida(this.host, this.usuario, this.password, this.nombreBD); 
};

/** Crea y retorna una DAO del Módulo Tablero
 * 
 * @returns {nm$_FactoriaDAO.DAOTAblero} DAO del Módulo Tablero
 */
FactoriaDAO.prototype.creaDAOTablero = function (){
  return new DAOTablero(this.host, this.usuario, this.password, this.nombreBD); 
};


/** Crea y retorna una DAO del Módulo Comentarios
 * 
 * @returns {nm$_FactoriaDAO.DAOComentarios} DAO del Módulo Comentarios
 */
FactoriaDAO.prototype.creaDAOComentarios = function (){
  return new DAOComentarios(this.host, this.usuario, this.password, this.nombreBD); 
};



module.exports = FactoriaDAO;