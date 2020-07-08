// Requieres
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();

// Conexión a base de datos
mongoose.connection.openUri('mongodb://localhost/Clinica_DB', ( err, res ) => {

   if( err ) throw true;
   console.log('Base de Datos Clinica_DB: \x1b[32m%s\x1b[0m','Conectada ');
});

// Rutas
app.get('/', (req, res, next) => {
   res.status(200).json({
     ok: true,
     mensaje: 'Petición realizada correctamente'
   })
})

// Escuchar peticiones
app.listen(3000, () => {
   console.log('Express server corriendo en Puerto: \x1b[32m%s\x1b[0m','3000 ');
});





