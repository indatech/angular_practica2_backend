// Requires
var express = require('express')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')

// Inicializar variables
var app = express()

// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Importar Rutas
var appRoutes = require('./routes/app')
var usuarioRoutes = require('./routes/usuario')
var loginRoutes = require('./routes/login')

// Conexión a base de datos
mongoose.connection.openUri('mongodb://localhost/Clinica_DB', ( err, res ) => {

   if( err ) throw true
   console.log('Base de Datos Clinica_DB: \x1b[32m%s\x1b[0m','Conectada ')
})

// Rutas
app.use('/usuario', usuarioRoutes)
app.use('/login', loginRoutes)
app.use('/', appRoutes)

// Escuchar peticiones
app.listen(3000, () => {
   console.log('Express server corriendo en Puerto: \x1b[32m%s\x1b[0m','3000 ');
})

 



