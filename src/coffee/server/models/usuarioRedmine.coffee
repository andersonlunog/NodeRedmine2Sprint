mongoose = require('mongoose')
Schema = mongoose.Schema

usuarioRedmineSchema = new Schema
  redmineID: Number
  nome: String

module.exports = mongoose.model('UsuarioRedmine', usuarioRedmineSchema)

# ---
# generated by js2coffee 2.2.0