const express = require('express');
const commons = require('./commons');
const router = express.Router();

router.post('/register',(req, res) => {
    console.log(`DEBUG: Received request to register user`);

    const result = req.body;// Obtener los datos enviados en la solicitud POST

    // Validar si se proporcionó un nombre de usuario y una contraseña
    if ((!result.uname && !result.upass) || (result.uname.trim() == "" || result.upass.trim() == "")) {
        // Devolver un error si el nombre de usuario o la contraseña están en blanco o no se proporcionan
        return res.send({
            "status": 400,
            "message": "Username/ password is required"
        });
    }
    // Almacenar el nombre de usuario y la contraseña en el objeto userObject
    commons.userObject.uname = result.uname;
    commons.userObject.upass = result.upass;

    // Eliminar cualquier información de autenticación de dos factores (TFA) asociada con el usuario
    delete commons.userObject.tfa;

    // Enviar una respuesta de éxito
    return res.send({
        "status": 200,
        "message": "User is successfully registered"
    });

});
module.exports = router;