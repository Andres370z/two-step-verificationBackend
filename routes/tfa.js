const express = require('express');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const commons = require('./commons');
const router = express.Router();

router.post('/tfa/setup', (req, res) => {
    console.log(`DEBUG: Received TFA setup request`);

    // Generar un secreto único para el usuario actual
    const secret = speakeasy.generateSecret({
        length: 10,
        name: commons.userObject.uname, //nombre del usuario
        issuer: 'NarenAuth v0.0' //emisor del servicio
    });
    // Generar la URL de autenticación de dos factores (OTP)
    var url = speakeasy.otpauthURL({
        secret: secret.base32,
        label: commons.userObject.uname,
        issuer: 'NarenAuth v0.0',
        encoding: 'base32'
    });
    // Generar un código QR con la URL de autenticación de dos factores
    QRCode.toDataURL(url, (err, dataURL) => {
        // Almacenar temporalmente la información de TFA en el objeto userObject
        commons.userObject.tfa = {
            secret: '', // Se almacenará el secreto después de la verificación
            tempSecret: secret.base32, // Secreto temporal generado
            dataURL, // URL del código QR
            tfaURL: url // URL de autenticación de dos factores
        };
        return res.json({
            message: 'TFA Auth needs to be verified',
            tempSecret: secret.base32,
            dataURL,
            tfaURL: secret.otpauth_url
        });
    });
})
router.get('/tfa/setup', (req, res) => {
    console.log(`DEBUG: Received FETCH TFA request`);
    // Enviar la configuración actual de TFA (si existe)
    res.json(commons.userObject.tfa ? commons.userObject.tfa : null);
});
router.delete('/tfa/setup', (req, res) => {
    console.log(`DEBUG: Received DELETE TFA request`);

    delete commons.userObject.tfa;
    res.send({
        "status": 200,
        "message": "success"
    });
});

// Configurar la ruta POST para verificar el código de autenticación de dos factores
router.post('/tfa/verify', (req, res) => {
    console.log(`DEBUG: Received TFA Verify request`);

    // Verificar el código de autenticación de dos factores (TOTP)
    let isVerified = speakeasy.totp.verify({
        secret: commons.userObject.tfa.tempSecret,
        encoding: 'base32',
        token: req.body.token
    });
    // Comprobar si el código de autenticación de dos factores es válido
    if (isVerified) {
        console.log(`DEBUG: TFA is verified to be enabled`);

        commons.userObject.tfa.secret = commons.userObject.tfa.tempSecret;
        return res.send({
            "status": 200,
            "message": "Two-factor Auth is enabled successfully"
        });
    }

    console.log(`ERROR: TFA is verified to be wrong`);

    return res.send({
        "status": 403,
        "message": "Invalid Auth Code, verification failed. Please verify the system Date and Time"
    });
});

module.exports = router;