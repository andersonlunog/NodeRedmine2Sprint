(function() {
  var Schema, mongoose, sprintResultSchema;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  sprintResultSchema = new Schema({
    lancamentos: Array
  });

  module.exports = mongoose.model('SprintResult', sprintResultSchema);

}).call(this);
