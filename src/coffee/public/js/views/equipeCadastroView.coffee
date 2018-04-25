define (require, exports, module) ->
  
  _ = require "underscore"
  $ = require "jquery"
  Backbone = require "backbone"
  template = require "text!templates/equipeCadastro.html"  
  UsuarioRedmineCollection = require "models/usuarioRedmineCollection"
  EquipeModel = require "models/equipeModel"
  helper = require "helpers/helper"
  require "bootstrap"

  class EquipeCadastroView extends Backbone.View
    el: ".mid-container"

    template: _.template template

    events:
      "click #btn-salvar": "salvar"
      "click #frm-usuarios tbody tr": "trClick"
      "change .chk-usuario": "chkAtivoChanged"

    initialize: (@options)->
      @usuarioRedmineCollection = new UsuarioRedmineCollection
      @model = new EquipeModel
      @render()
      @listenTo @model, "change", @render

      @usuarioRedmineCollection.fetch
        data:
          ativo: true
        success: (usuarios)=>
          if @options.equipeID
            @model.set "_id": @options.equipeID
            @model.fetch
              success: (equipe) =>
                usuarios.forEach (mdl)->
                  mdl.set("ativoEquipe", true) if _.some equipe.get("usuarios"), (u)-> u.redmineID == mdl.get("redmineID")
                @render()
              error: (e)->
                console.log e
                alert "Houve um erro ao buscar a equipe!/r/nConsulte o log."
          else
            @usuarioRedmineCollection.forEach (mdl)->
              mdl.set "ativoEquipe", false
            @render()
        error: (e) =>
          console.log e
          alert "Houve um erro ao buscar usuários!/r/nConsulte o log."
      @

    render: ->
      @$el.html @template 
        usuariosRedmine : @usuarioRedmineCollection.toJSON()
        model: @model.toJSON()
      @

    trClick: (ev)->
      helper.trClick.call @, ev

    chkAtivoChanged: (ev)->
      chk = @$(ev.target)
      id = chk.attr("name")
      @fillModel()
      @usuarioRedmineCollection.get(id).set "ativoEquipe", chk.is(":checked")
      usuarios = []
      @usuarioRedmineCollection.forEach (itm)-> usuarios.push(_.pick(itm.toJSON(), "redmineID", "nome")) if itm.get("ativoEquipe")
      @model.set "usuarios", usuarios

    fillModel: ->
      @model.set "nome", @$("#input-nome").val()

    salvar: (ev)->
      ev.preventDefault()
      that = @
      helper.aguardeBtn.call @, "#btn-salvar", "Salvar", "Salvar", false
      @fillModel()
      if _.isEmpty @model.get "usuarios"
        helper.aguardeBtn.call @, "#btn-salvar", "Salvar", "Salvar", true
        alert "Nenhum usuário selecionado."
        return

      @model.save null,
        success: (msg)->
          console.log msg
          helper.aguardeBtn.call that, "#btn-salvar", "Salvar", "Salvar", true
          alert "Equipe salva com sucesso!"
        error: (e)->
          console.log e
          helper.aguardeBtn.call that, "#btn-salvar", "Salvar", "Salvar", true
          alert "Houve um erro ao salvar equipe!/r/nConsulte o log."

  module.exports = EquipeCadastroView
