var express = require('express')
var bcrypt = require('bcryptjs') 
var jwt = require('jsonwebtoken')

var SEED = require('../config/config').SEED

var app = express();

var Usuario = require('../models/usuario');
const usuario = require('../models/usuario');

app.post('/', (req, res) => {

   var body = req.body

   usuario.findOne({ email: body.email }, (err, usuario_DB) => {

      if (err) {
         return res.status(400).json({
            ok: false,
            mensaje: 'Error al buscar usuario.',
            errors: err
         })
      }

      if (! usuario_DB) {
         return res.status(500).json({
            ok: false,
            mensaje: 'Credenciales incorrectas - email.',
            errors: err
         })
      }

      if(!bcrypt.compareSync(body.password, usuario_DB.password)){

         return res.status(500).json({
            ok: false,
            mensaje: 'Credenciales incorrectas - password.',
            errors: err
         })
      }
      
      // Crear token
      usuario_DB.password = ':)'
      var token = jwt.sign({ usuario: usuario_DB }, SEED, { expiresIn: 14400 }) // 4 horas

      res.status(200).json({
         ok: true,
         usuario: usuario_DB,
         token,
         id: usuario_DB._id
      })
      
   })

   
})


module.exports = app