mongoose = require('mongoose')
Schema = mongoose.Schema

sprintSchema = new Schema
  nome: String
  inicio: String
  fim: String
  usuarios: Array
  chamadosTxt: String
  chamados: Array

module.exports = mongoose.model('Sprint', sprintSchema)