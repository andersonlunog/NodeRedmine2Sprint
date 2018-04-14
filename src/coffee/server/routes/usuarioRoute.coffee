redmine = require('../business/redmine')()
UsuarioRedmine = require('../models/usuarioRedmine')

# https = require "https"
# environment = require('../config/environment')()
# DateUtils = require "../utils/date"
# process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

module.exports = (app) ->
  app.get "/buscarRedmine", (req, res) ->
    id = req.query.id
    redmine.getUser(id).then (user) ->
      res.send user
    , (e)->
      console.log e
      res.status(404).send "Usuário #{id} não encontrado"

  app.get "/usuariosRedmine", (req, res) ->
    filtro = req.query
    UsuarioRedmine.find filtro, (err, users) ->
      return res.status(400).send(err) if err
      res.send users
  
  app.post "/usuariosRedmine", (req, res) ->
    usuarios = req.body
    ret = 
      usuariosIncluidos: []
      usuariosAtualizados: []
      erros: []

    returnIfLast = (i)->
      if i >= usuarios.length - 1
          res.send ret

    usuarios.forEach (usuario, i)->
      UsuarioRedmine.findOne { redmineID: usuario.redmineID }, (err, usr)->
        if err
          ret.erros.push err
          console.log "Houve um erro no usuario #{usuario.nome}"
          returnIfLast i
        else
          if usr
            usr.set usuario
            usr.save().then (usr1)->
              ret.usuariosAtualizados.push usr1
              console.log "Atualizado usuario #{usuario.nome}"
              returnIfLast i
          else
            UsuarioRedmine.create usuario, (err1, usr1)->
              if err1
                ret.erros.push err1
                console.log "Houve um erro no usuario #{usuario.nome}"
                returnIfLast i
              else
                ret.usuariosIncluidos.push usr1
                console.log "Inserido usuario #{usuario.nome}"
                returnIfLast i
      
      #   newUser = new User
      #   newUser.email = email
      #   newUser.password = newUser.generateHash(password)
      #   newUser.save (err) ->
      #     if err
      #       return done(err)
      #     done null, newUser
      # return
    
  return