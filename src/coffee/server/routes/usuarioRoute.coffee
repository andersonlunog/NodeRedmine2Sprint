redmine = require('../business/redmine')()
UsuarioRedmine = require('../models/usuarioRedmine')

# https = require "https"
# environment = require('../config/environment')()
# DateUtils = require "../utils/date"
# process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

module.exports = (app) ->
  app.get "/usuarioDoRedmine", (req, res) ->
    id = req.query.id
    redmine.getUser(id).then (user) ->
      res.send user
    , (e)->
      console.log e
      res.status(404).send "Usuário #{id} não encontrado"

  app.get "/usuariosRedmine", (req, res) ->
    UsuarioRedmine.find {}, (err, users) ->
      return res.status(400).send(err) if err
      res.send users
  
  app.post "/usuariosRedmine", (req, res) ->
    usuarios = req.body
    usuarios.forEach (usuario)->
      UsuarioRedmine.findOne { redmineID: usuario.redmineID }, (err, usr)->
        return console.log err if err
        if usr
          usr.save usuario
          console.log "#{usuario.nome} atualizado"
        else
          UsuarioRedmine.create usuario, (err1, usr1)->
            return console.log err1 if err1
            console.log "#{usuario.nome} inserido"
            console.log usr1
    
    res.send 200
      
      #   newUser = new User
      #   newUser.email = email
      #   newUser.password = newUser.generateHash(password)
      #   newUser.save (err) ->
      #     if err
      #       return done(err)
      #     done null, newUser
      # return
    
  return