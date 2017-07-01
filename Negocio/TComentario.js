
var dateFormat = require("dateformat");


"use strict";

/** Constructora del transfer Comentario
 * @Constructor 
 * 
 * @param {Number} id
 * @param {Number} id_partida
 * @param {Number} id_usuario
 * @param {DateTime} fecha_hora
 * @param {String} comentario
 * 
 * @returns {TComentario}
 */
function TComentario(id, id_partida, id_usuario, nick, foto, fecha_hora, comentario) {
    this.id = id;
    this.id_partida = id_partida;
    this.id_usuario = id_usuario;
    this.nick = nick;
    this.foto = foto;
    this.fecha_hora = dateFormat(fecha_hora, "dd/mm/yyyy - HH:MM:ss");
    //this.fecha_hora = dateFormat(fecha_hora, "dd de mmmm de yyyy - HH:MM:ss");
    //this.fecha_hora = fecha_hora;
    this.comentario = comentario;
}




module.exports = TComentario;