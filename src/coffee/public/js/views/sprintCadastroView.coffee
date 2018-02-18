define (require, exports, module) ->
  
  _ = require "underscore"
  $ = require "jquery"
  Backbone = require "backbone"
  template = require "text!templates/sprintCadastro.html"
  sprintModel = require "models/sprintModel"
  BindModelForm = require "helpers/bindModelForm"
  UsuarioRedmineCollection = require "models/usuarioRedmineCollection"
  require "bootstrap"

  class SprintCadastroView extends Backbone.View
    el: ".mid-container"

    template: _.template template

    events:
      "submit #frmUsuario": "submit"

    initialize: (@options)->
      @model = new sprintModel
      @modelForm = new BindModelForm @model
      @model.on "change", @render, @
      @usuarioRedmineCollection = new UsuarioRedmineCollection
      @usuarioRedmineCollection.fetch
        success: (collection, response) =>
          @render()
        error: (e) ->
          console.log e
          alert "Houve um erro ao importar usuários!/r/nConsulte o log."
      # @render()
      @

    render: ->
      that = this
      $(@el).html @template 
        usuarios: @usuarioRedmineCollection.models
        chamados: []
      @modelForm.fetchForm @options.id
      @

    submit: (event) ->
      @modelForm.saveForm()
      event.preventDefault()
  
  module.exports = SprintCadastroView