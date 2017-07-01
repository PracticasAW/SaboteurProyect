
var minJugadoresPartida = 3;


/** Objeto que representa en numero de jugadores de cada rol en funcion del numero de jugadores de la partida
 * Num jugadores: [num Saboteadores, Num Buscadores]
 */
var repartoRoles = {
    3: [1,2],
    4: [1,3],
    5: [2,3],
    6: [2,4],
    7: [2,5]
};


/** Objeto que representa el numero de turno que tiene cada partida en funcion de los jugadores que hay en ella
 * Num jugadores: numTurnos
 */
var numTurnos = {
    3: 50,
    4: 45,
    5: 40,
    6: 40,
    7: 35
};


/** Objeto que representa en numero de cartas que poseera cada jugador en la partida en funcion del numero de jugadores de la misma
 *  Num Jugadores: Num Cartas
 */
var numCartasPorJugador = {
    3: 6,
    4: 6,
    5: 6,
    6: 5,
    7: 5
};


/**
 * 
 * @type Number Numero de cartas que pose la baraja
 */
var numeroCartasBaraja = 19;


/**
 * numCarta : nombreCarta
 */
var cartas = {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    11: 11,
    12: 12,
    13: 13,
    14: 14,
    15: 15,
    16: "Lupa",
    17: "Bomba",
    18: "PicoArreglado",
    19: "PicoRoto"
};


var numCasillasFinales = 3;

/** Cartas que estarán en el talbero al incio de una partida
 *  Array( {numCarta, coor_X, coord_Y} )
 *  
 */
var cartasInicioTablero = [
    {numCarta: "Start", coor_X: 0, coor_Y: 3},
    {numCarta: "DNK", coor_X: 6, coor_Y: 1},
    {numCarta: "DNK", coor_X: 6, coor_Y: 3},
    {numCarta: "DNK", coor_X: 6, coor_Y: 5}
   ];


module.exports = {
    minJugadoresPartida: minJugadoresPartida,
    repartoRoles: repartoRoles,
    numTurnos: numTurnos,
    numCartasPorJugador: numCartasPorJugador,
    numeroCartasBaraja: numeroCartasBaraja,
    cartas: cartas,
    /** Cartas que estarán en el talbero al incio de una partida. Array( {numCarta, coor_X, coord_Y} ). */
    numCasillasFinales: numCasillasFinales,
    cartasInicioTablero: cartasInicioTablero
};
