
var TComentario = require('../Negocio/TComentario');


console.log();
console.log("*********************************************");
console.log("*******    PRUEBAS DAO COMENTARIOS   ********");
console.log("*********************************************");
console.log();

console.log("preparando prueba.....");

var DAOComentarios = new (require('./FactoriaDAO'))().creaDAOComentarios(); 


if(DAOComentarios){
    console.log("DAOComentarios creado correctamente");
}else{
	console.log("DAOComentarios no creado");
}

var comentario = "COEMTNARIOS!!!";

var miTComent = new TComentario(-1, 17, 3, null, null, undefined, comentario);

DAOComentarios.insertarComentario(miTComent, function(err, result){
	if (err) {
        console.log("error al insertar comentario: " + err);
    } else {
		console.log("comentario insertado correctamente. ID: " + result);
	}
});

/*
DAOComentarios.buscarComentariosDePartida(17, function(err, arrayComentarios){
	if (err) {
        console.log("error al insertar comentario: " + err);
    } else {
		console.log(arrayComentarios);
	}
});
*/
