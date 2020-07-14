var express = require('express')

var app = express()

var mdVerificacion = require('../middlewares/autenticacion')


var Hospital = require('../models/hospital')


// =====================================
// Obtener listado de hospitales
// =====================================
app.get('/', (req, res, next) => {

   var desde = req.query.desde || 0
   desde = Number(desde)

   Hospital.find({})
      .skip(desde)
      .limit(5)
      .populate('usuario', 'nombre email')
      .exec(
         (err, hospitales) => {

            if (err) {
               return res.status(500).json({
                  ok: false,
                  mensaje: 'Error en base de datos.',
                  errors: err
               })
            }


            Hospital.count({}, (err, conteo) => {

               res.status(200).json({
                  ok: true,
                  hospitales,
                  total: conteo
               })
            })


         })
})


   // ========================================
   // Actualizar hospital
   // ========================================
   app.put('/:id', mdVerificacion.verificarToken, (req, res) => {

      var body = req.body
      var id = req.params.id

      Hospital.findById(id, (err, hospital) => {

         if (err) {
            return res.status(500).json({
               ok: false,
               mensaje: 'Error al buscar el hospital.',
               errors: err
            })
         }

         if (!hospital) {
            return res.status(400).json({
               ok: false,
               mensaje: 'El hospital con el id: ' + id + '  no existe',
               message: 'Error al ingresar el ID'
            })
         }

         hospital.nombre = body.nombre,
            hospital.usuario = req.usuario._id

         hospital.save((err, hospitalSaved) => {

            if (err) {
               return res.status(400).json({
                  ok: false,
                  mensaje: 'Error al actualizar datos del hospital',
                  errors: err
               })
            }

            res.status(201).json({
               ok: true,
               hospital: hospitalSaved
            })
         })
      })
   })


   // ========================================
   // Crear un nuevo Hospital
   // ========================================
   app.post('/', mdVerificacion.verificarToken, (req, res) => {

      var body = req.body

      var hospital = new Hospital({
         nombre: body.nombre,
         usuario: req.usuario._id
      })

      hospital.save((err, hospitalSaved) => {

         if (err) {
            return res.status(500).json({
               ok: false,
               mensaje: 'Error al crear el hospital',
               errors: err
            })
         }

         res.status(201).json({
            ok: true,
            hospital: hospitalSaved
         })
      })
   })


   // ========================================
   // Eliminar hospital
   // ========================================
   app.delete('/:id', mdVerificacion.verificarToken, (req, res) => {

      var id = req.params.id

      Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

         if (err) {
            return res.status(500).json({
               ok: false,
               mensaje: 'Error al borrar hospital',
               errors: err
            })
         }

         if (!hospitalBorrado) {
            return res.status(400).json({
               ok: false,
               mensaje: 'El hospital con el id' + id + ' no existe'
            })
         }

         res.status(201).json({
            ok: true,
            hospital: hospitalBorrado
         })
      })
   })
   


   module.exports = app