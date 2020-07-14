var express = require('express')

var app = express()

var mdVerificacion = require('../middlewares/autenticacion')


var Medico = require('../models/medico')
const medico = require('../models/medico')


// =====================================
// Obtener listado de medicos
// =====================================
app.get('/', (req, res, next) => {

   var desde = req.query.desde || 0
   desde = Number(desde)

   Medico.find({})
      .skip(desde)
      .limit(5)
      .populate('usuario', 'nombre email')
      .populate('hospital')
      .exec(
         (err, medicos) => {

            if (err) {
               return res.status(500).json({
                  ok: false,
                  mensaje: 'Error en base de datos.',
                  errors: err
               })
            }

            Medico.count({}, (err, conteo) => {
               
               res.status(200).json({
                  ok: true,
                  medicos,
                  total: conteo
               })
            })


         })
})


// ========================================
// Actualizar medico
// ========================================
app.put('/:id', mdVerificacion.verificarToken, (req, res) => {

   var body = req.body
   var id = req.params.id

   Medico.findById(id, (err, medico) => {

      if (err) {
         return res.status(500).json({
            ok: false,
            mensaje: 'Error al buscar médico.',
            errors: err
         })
      }

      if (!medico) {
         return res.status(400).json({
            ok: false,
            mensaje: 'El médico con el id: ' + id + '  no existe',
            message: 'Error al ingresar el ID'
         })
      }

      medico.nombre = body.nombre,
         medico.usuario = req.usuario._id
      medico.hospital = body.hospital

      medico.save((err, medicoSaved) => {

         if (err) {
            return res.status(400).json({
               ok: false,
               mensaje: 'Error al actualizar datos del médico',
               errors: err
            })
         }

         res.status(201).json({
            ok: true,
            medico: medicoSaved
         })
      })
   })
})


// ========================================
// Crear un nuevo Hospital
// ========================================
app.post('/', mdVerificacion.verificarToken, (req, res) => {

   var body = req.body

   var medico = new Medico({
      nombre: body.nombre,
      usuario: req.usuario._id,
      hospital: body.hospital
   })

   medico.save((err, medicoSaved) => {

      if (err) {
         return res.status(500).json({
            ok: false,
            mensaje: 'Error al crear el médico',
            errors: err
         })
      }

      res.status(201).json({
         ok: true,
         medico: medicoSaved
      })
   })
})


// ========================================
// Eliminar hospital
// ========================================
app.delete('/:id', mdVerificacion.verificarToken, (req, res) => {

   var id = req.params.id

   Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

      if (err) {
         return res.status(500).json({
            ok: false,
            mensaje: 'Error al borrar medico',
            errors: err
         })
      }

      if (!medicoBorrado) {
         return res.status(400).json({
            ok: false,
            mensaje: 'El médico con el id' + id + ' no existe'
         })
      }

      res.status(201).json({
         ok: true,
         medico: medicoBorrado
      })
   })
})



module.exports = app