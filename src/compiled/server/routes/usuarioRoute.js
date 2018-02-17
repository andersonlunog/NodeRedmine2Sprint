(function() {
  var UsuarioRedmine, redmine;

  redmine = require('../business/redmine')();

  UsuarioRedmine = require('../models/usuarioRedmine');

  // https = require "https"
  // environment = require('../config/environment')()
  // DateUtils = require "../utils/date"
  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
  module.exports = function(app) {
    app.get("/usuarioDoRedmine", function(req, res) {
      var id;
      id = req.query.id;
      return redmine.getUser(id).then(function(user) {
        return res.send(user);
      }, function(e) {
        console.log(e);
        return res.status(404).send(`Usuário ${id} não encontrado`);
      });
    });
    app.get("/usuariosRedmine", function(req, res) {
      return UsuarioRedmine.find({}, function(err, users) {
        if (err) {
          return res.status(400).send(err);
        }
        return res.send(users);
      });
    });
    app.post("/usuariosRedmine", function(req, res) {
      var usuarios;
      usuarios = req.body;
      usuarios.forEach(function(usuario) {
        return UsuarioRedmine.findOne({
          redmineID: usuario.redmineID
        }, function(err, usr) {
          if (err) {
            return console.log(err);
          }
          if (usr) {
            usr.save(usuario);
            return console.log(`${usuario.nome} atualizado`);
          } else {
            return UsuarioRedmine.create(usuario, function(err1, usr1) {
              if (err1) {
                return console.log(err1);
              }
              console.log(`${usuario.nome} inserido`);
              return console.log(usr1);
            });
          }
        });
      });
      return res.send(200);
    });
  };

  
//   newUser = new User
//   newUser.email = email
//   newUser.password = newUser.generateHash(password)
//   newUser.save (err) ->
//     if err
//       return done(err)
//     done null, newUser
// return

}).call(this);
