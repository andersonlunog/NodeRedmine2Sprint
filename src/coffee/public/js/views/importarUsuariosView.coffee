define (require, exports, module) ->
  
  _ = require "underscore"
  $ = require "jquery"
  Backbone = require "backbone"
  template = require "text!templates/importarUsuarios.html"  
  require "bootstrap"

  class ImportarUsuariosView extends Backbone.View
    el: ".mid-container"

    template: _.template template

    events:
      "click #btn-buscar": "buscar"

    initialize: ->
      @collection = new Backbone.Collection()
      @render()
      @collection.on "add remove reset", @render, @
      @

    render: ->
      @$el.html @template 
        usuarios : @collection.models
        buscando: @buscando
        inicio: @inicio
        fim: @fim

      if @buscando        
        @$("#btn-buscar span").show()
        @$("#btn-buscar").text("Buscando...").attr("disabled", true).append """ <span class="glyphicon glyphicon-refresh" aria-hidden="true"></span>"""
      else
        @$("#btn-buscar span").hide()
        @$("#btn-buscar").text("Buscar ").attr "disabled", false
      @

    buscar: (ev)->      
      ev.preventDefault()
      @inicio = parseInt $("#input-inicio").val()
      @fim = parseInt $("#input-fim").val()
      console.log "Buscando os usuário de #{@inicio} a #{@fim}"
      @buscando = true
      @collection.reset()
      id = @inicio
      requisitar = =>
        $.get "/usuarioRedmine?id=#{id}", (u)=>
          unless _.isEmpty(u) or _.isEmpty(u.user)
            @collection.add u.user 
          else
            console.log "UID #{id} não encontrado..."
          id++
          if id <= @fim
            requisitar()
          else
            @buscando = false
            @render()
      requisitar()

  module.exports = ImportarUsuariosView
