
"use strict";

/** Constructora de objeto transfer Partida

 * 
 * @param {Number} id
 * @param {String} nombre
 * @param {Date} fecha_creacion
 * @param {Number} turno
 * @param {Number} creador
 * @param {Number} num_jugadores_ativos
 * @param {Number} num_jugadores_Max
 * @param {Number} ganador
 * @param {String} estado
 * @param {Number} mov_restantes
 * @param {Array(String)} jugadores array con los nick de los Jugdores de la partida
 * 
 * @returns {TPartida}
 */
function TPartida(id, nombre, fecha_creacion, turno, creador, num_jugadores_activos, num_jugadores_Max, ganador, estado, mov_restantes, jugadores, creadorNick) {
    this.id = id;
    this.nombre = nombre;
    this.fecha_creacion = fecha_creacion;
    this.turno = turno;
    this.creador = creador;
    this.creadorNick = creadorNick;
    this.num_jugadores_ativos = num_jugadores_activos;
    this.num_jugadores_Max = num_jugadores_Max;
    this.ganador = ganador;
    this.estado = estado;
    this.mov_restantes = mov_restantes
    if(jugadores === undefined) this.jugadores = []; else  this.jugadores = jugadores;
    

}






module.exports = TPartida;