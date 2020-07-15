var express = require('express')
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')

var SEED = require('../config/config').SEED

var app = express();

var Usuario = require('../models/usuario');
//const usuario = require('../models/usuario');

// Google
var GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const usuario = require('../models/usuario');
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// ========================================
// Autenticación de Google
// ========================================
   async function verify(token) {
      const ticket = await client.verifyIdToken({
         idToken: token,
         audience: GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
         // Or, if multiple clients access the backend:
         //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
      });
      const payload = ticket.getPayload();
      // const userid = payload['sub']; 
      // If request specified a G Suite domain:
      // const domain = payload['hd'];
      return {
         nombre: payload.name,
         email: payload.email,
         img: payload.picture,
         google: true
      }
   }

   app.post('/google', async (req, res) => {

      var token = req.body.token;
      var googleUser = await verify(token)
         .catch(e => {
            res.status(403).json({
               ok: false,
               mensaje: 'Token no válido'
            });
         })

       Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
         if (err) {
            return res.status(500).json({
               ok: false,
               mensaje: 'Error al buscar usuario',
               errors: err
            });
         }

         if (usuarioDB) {
            if (usuarioDB.google === false) {
               return res.status(400).json({
                  ok: false,
                  mensaje: 'Debe de usar su autenticación normal'
               });
            } else {    // Genero Token
               var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }) // 4 hs

               res.status(200).json({
                  ok: true,
                  usuario: usuarioDB,
                  token,
                  id: usuarioDB._id
               });
            }
         } else {    // El Usuario no existe... hay que crearlo
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';
            usuario.save((err, usuarioDB) => {
               var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }) // 4 hs

               res.status(200).json({
                  ok: true,
                  usuario: usuarioDB,
                  token,
                  id: usuarioDB._id
               });
            });
         }

      }); 

   })







// ========================================
// Autenticación normal
// ========================================
app.post('/', (req, res) => {

   var body = req.body

   Usuario.findOne({ email: body.email }, (err, usuario_DB) => {

      if (err) {
         return res.status(400).json({
            ok: false,
            mensaje: 'Error al buscar usuario.',
            errors: err
         })
      }

      if (!usuario_DB) {
         return res.status(500).json({
            ok: false,
            mensaje: 'Credenciales incorrectas - email.',
            errors: err
         })
      }

      if (!bcrypt.compareSync(body.password, usuario_DB.password)) {

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