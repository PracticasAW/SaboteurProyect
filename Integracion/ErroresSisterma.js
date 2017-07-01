"use strict";

/**
 * 
 * @returns {ErrorSab}
 */
function ErrorSab() {
    //Errores usuario
    this.contraseñaIncorrecta = 1001;
    this.UsuarioNoRegistrado = 1002;
    this.usuarioRegistrado = 1003;
    
    //Errores Partida
    
}


/**
 * 
 * @param {type} errorNum
 * @returns {undefined}
 */
ErrorSab.prototype.imprimeError = function (errorNum) {
    var mensaje = "";
    switch (errorNum) {
        case this.contraseñaIncorrecta:
            mensaje = "Password incorrecta.";
            break;
        case this.UsuarioNoRegistrado:
            mensaje = "Usuario no está registrado en el sistema.";
            break;

        default:

            break;
    }

    console.error(mensaje);
};
