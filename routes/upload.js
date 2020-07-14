var express = require('express')

var fileUpload = require('express-fileupload')
var fs = require('fs')

var app = express();

var Usuario = require('../models/usuario')
var Medico = require('../models/medico')
var Hospital = require('../models/hospital');
const usuario = require('../models/usuario');

// default options
app.use(fileUpload());


app.put('/:tipo/:id', (req, res, next) => {

   var tipo = req.params.tipo
   var id = req.params.id

   // tipos de colección
   var tiposValidos = ['hospitales', 'medicos', 'usuarios']
   
   if(tiposValidos.indexOf( tipo ) < 0) {
      return res.status(400).json({
         ok: false,
         mensaje: 'Tipo de colección no válida',
         errors: { message: 'Tipo de colección no válida' }
      })
   }

   if(!req.files) {
      return res.status(400).json({
         ok: false,
         mensaje: 'No se ha seleccionado ningún archivo',
         errors: { message: 'Seleccionar un archivo válido'}
      })
   }


   // Obtener nombre del archivo
   var archivo = req.files.imagen
   var nombreCortado = archivo.name.split('.')
   var extensionArchivo = nombreCortado[nombreCortado.length - 1]

    
   // Extensiones válidas
   extensionesValidas =['jpg', 'png', 'gif', 'jpeg']

   if(extensionesValidas.indexOf(extensionArchivo) < 0) {

      return res.status(400).json({
         ok: false,
         mensaje: 'Extensión no válida',
         errors: { message: 'Las extensiones válidas son: ' + extensionesValidas.join(', ') }
      })
   }


   // Nombre de archivo personalizado
   var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`


   // Mover el archivo de un temporal al path
   var path = `./upload/${ tipo }/${ nombreArchivo }`
 
   archivo.mv(path, err => {

      if(err) {
         return res.status(500).json({
            ok: false,
            mensaje: 'Error al mover archivo',
            errors: err
         })
      }

      subirPorTipo(tipo, id, nombreArchivo, res)
   })
})



function subirPorTipo( tipo, id, nombreArchivo, res ) {

   if( tipo === 'usuarios') {

      Usuario.findById( id, ( err, usuario ) => {

         if(!usuario) {
            return res.status(400).json({
               ok: false,
               mensaje: 'El usuario no existe',
               errors: { message: 'El usuario no existe'}
            })
         }

         if (err) {
            return res.status(500).json({
               ok: false,
               mensaje: 'Error al subir archivo',
               errors: err
            })
         }
         
         var pathViejo = './upload/usuarios' + usuario.img

         // Si existe, elimina la imagen anterior
         if( fs.existsSync( pathViejo ) ) {
            fs.unlink( pathViejo )
         }

         usuario.img = nombreArchivo

         usuario.save((err, usuarioActualizado) => {

            usuarioActualizado.password = ':)'

            if (err) {
               return res.status(500).json({
                  ok: false,
                  mensaje: 'Error al actualizar la imagen',
                  errors: err
               })
            }

            return res.status(200).json({
               ok: true,
               mensaje: 'Imagen de usuario actualizada',
               usuario: usuarioActualizado
            })
         })
      }) 
   }


   if( tipo === 'medicos') {

      Medico.findById(id, (err, medico) => {


         if (!medico) {
            return res.status(400).json({
               ok: false,
               mensaje: 'El medico no existe',
               errors: { message: 'El medico no existe' }
            })
         }

         if (err) {
            return res.status(500).json({
               ok: false,
               mensaje: 'Error al subir archivo',
               errors: err
            })
         }

         var pathViejo = './upload/medicos' + medico.img

         // Si existe, elimina la imagen anterior
         if (fs.existsSync(pathViejo)) {
            fs.unlink(pathViejo)
         }

         medico.img = nombreArchivo

         medico.save((err, medicoActualizado) => {

            medicoActualizado.password = ':)'

            if (err) {
               return res.status(500).json({
                  ok: false,
                  mensaje: 'Error al actualizar la imagen',
                  errors: err
               })
            }

            return res.status(200).json({
               ok: true,
               mensaje: 'Imagen de medico actualizada',
               medico: medicoActualizado
            })
         })
      })

   }


   if( tipo === 'hospitales') {

      Hospital.findById(id, (err, hospital) => {


         if (!hospital) {
            return res.status(400).json({
               ok: false,
               mensaje: 'El hospital no existe',
               errors: { message: 'El hospital no existe' }
            })
         }

         if (err) {
            return res.status(500).json({
               ok: false,
               mensaje: 'Error al subir archivo',
               errors: err
            })
         }

         var pathViejo = './upload/hospitales' + hospital.img

         // Si existe, elimina la imagen anterior
         if (fs.existsSync(pathViejo)) {
            fs.unlink(pathViejo)
         }

         hospital.img = nombreArchivo

         hospital.save((err, hospitalActualizado) => {

            hospitalActualizado.password = ':)'

            if (err) {
               return res.status(500).json({
                  ok: false,
                  mensaje: 'Error al actualizar la imagen',
                  errors: err
               })
            }

            return res.status(200).json({
               ok: true,
               mensaje: 'Imagen de hospital actualizada',
               hospital: hospitalActualizado
            })
         })
      })

   }
}

module.exports = app
