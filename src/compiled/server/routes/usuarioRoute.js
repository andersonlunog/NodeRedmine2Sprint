(function() {
  var UsuarioRedmine, redmine;

  redmine = require('../business/redmine')();

  UsuarioRedmine = require('../models/usuarioRedmine');

  // https = require "https"
  // environment = require('../config/environment')()
  // DateUtils = require "../utils/date"
  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
  module.exports = function(app) {
    app.get("/buscarRedmine", function(req, res) {
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
      var filtro;
      filtro = req.query;
      return UsuarioRedmine.find(filtro, function(err, users) {
        if (err) {
          return res.status(400).send(err);
        }
        return res.send(users);
      });
    });
    app.post("/usuariosRedmine", function(req, res) {
      var ret, returnIfLast, usuarios;
      usuarios = req.body;
      ret = {
        usuariosIncluidos: [],
        usuariosAtualizados: [],
        erros: []
      };
      returnIfLast = function(i) {
        if (i >= usuarios.length - 1) {
          return res.send(ret);
        }
      };
      return usuarios.forEach(function(usuario, i) {
        return UsuarioRedmine.findOne({
          redmineID: usuario.redmineID
        }, function(err, usr) {
          if (err) {
            ret.erros.push(err);
            console.log(`Houve um erro no usuario ${usuario.nome}`);
            return returnIfLast(i);
          } else {
            if (usr) {
              usr.set(usuario);
              return usr.save().then(function(usr1) {
                ret.usuariosAtualizados.push(usr1);
                console.log(`Atualizado usuario ${usuario.nome}`);
                return returnIfLast(i);
              });
            } else {
              return UsuarioRedmine.create(usuario, function(err1, usr1) {
                if (err1) {
                  ret.erros.push(err1);
                  console.log(`Houve um erro no usuario ${usuario.nome}`);
                  return returnIfLast(i);
                } else {
                  ret.usuariosIncluidos.push(usr1);
                  console.log(`Inserido usuario ${usuario.nome}`);
                  return returnIfLast(i);
                }
              });
            }
          }
        });
      });
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
