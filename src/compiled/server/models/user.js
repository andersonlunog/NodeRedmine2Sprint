(function() {
  // load the things we need
  var bcrypt, mongoose, userSchema;

  mongoose = require('mongoose');

  bcrypt = require('bcrypt-nodejs');

  // define the schema for our user model
  userSchema = mongoose.Schema({
    local: {
      email: String,
      password: String
    },
    facebook: {
      id: String,
      token: String,
      name: String,
      email: String
    },
    google: {
      id: String,
      token: String,
      email: String,
      name: String
    }
  });

  // generating a hash
  userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };

  // checking if password is valid
  userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
  };

  // create the model for users and expose it to our app
  module.exports = mongoose.model('User', userSchema);

  // ---
// generated by js2coffee 2.2.0

}).call(this);
