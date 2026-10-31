/**
 * Central de Verificación de PIN para accesos directos
 */
function verificarPin(url, tipoAcceso) {
    // Diccionario con los PINs correspondientes a cada rol o sección
    const PINS = {
        "poite": "1954",
        "adscripto": "1935",
        "plano": "1963"
    };

    // Obtenemos el PIN correcto según el tipo de acceso solicitado
    const pinCorrecto = PINS[tipoAcceso];

    // Si por error se pasa un tipo de acceso que no existe en el diccionario
    if (!pinCorrecto) {
        console.error("Error: Tipo de acceso no definido.");
        alert("Ocurrió un error con la configuración de seguridad.");
        return;
    }

    // Solicitar el ingreso al usuario
    let intento = prompt(`Ingrese el PIN de seguridad [${tipoAcceso.toUpperCase()}]:`);

    if (intento === null) {
        return; // El usuario canceló el prompt, no hace nada.
    }

    if (intento === pinCorrecto) {
        window.open(url, '_blank');
    } else {
        alert("PIN incorrecto. Acceso denegado.");
    }
}