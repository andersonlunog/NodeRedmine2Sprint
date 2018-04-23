(function() {
  var Schema, mongoose, sprintResultSchema;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  sprintResultSchema = new Schema({
    sprintID: Schema.Types.ObjectId,
    lancamentos: Array
  });

  module.exports = mongoose.model('SprintResult', sprintResultSchema);

}).call(this);
