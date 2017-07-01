"use strict";

/** Constructora de objeto transfer Usuario
 * @constructor Usuario
 * 
 * @param {Number} id
 * @param {String} nick
 * @param {String} password
 * @param {String} nombreCompleto
 * @param {String} sexo
 * @param {Image} foto
 * @param {Date} fecha_nacimiento
 * 
 * @return {nm$_TUsuario.TUsuario} 
 */
function TUsuario(id, nick, password, nombreCompleto, sexo, foto, fecha_nacimiento) {
    this.id = id;
    this.nick = nick;
    this.password = password;
    this.nombreCompleto = nombreCompleto;
    this.sexo = sexo;
    this.foto = foto;
    this.fecha_nacimiento = fecha_nacimiento;
}



module.exports = TUsuario;
