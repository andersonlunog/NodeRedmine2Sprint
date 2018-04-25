(function() {
  var Schema, equipeSchema, mongoose;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  equipeSchema = new Schema({
    nome: String,
    usuarios: Array
  });

  module.exports = mongoose.model('Equipe', equipeSchema);

}).call(this);
