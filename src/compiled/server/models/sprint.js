(function() {
  var Schema, mongoose, sprintSchema;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  sprintSchema = new Schema({
    nome: String,
    inicio: String,
    fim: String,
    usuarios: Array,
    chamadosPlanejadosTxt: String,
    chamadosPlanejados: Array,
    chamadosNaoPlanejados: Array
  });

  module.exports = mongoose.model('Sprint', sprintSchema);

}).call(this);
