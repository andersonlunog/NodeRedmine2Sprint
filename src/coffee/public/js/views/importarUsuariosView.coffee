define (require, exports, module) ->
  
  _ = require "underscore"
  $ = require "jquery"
  Backbone = require "backbone"
  template = require "text!templates/importarUsuarios.html"  
  UsuarioRedmineCollection = require "models/usuarioRedmineCollection"
  require "bootstrap"

  class ImportarUsuariosView extends Backbone.View
    el: ".mid-container"

    template: _.template template

    events:
      "click #btn-buscar": "buscar"
      "click #btn-importar": "importar"
      "click #frm-usuarios tbody tr": "trclick"

    initialize: ->
      @inicio = 50
      @fim = 60
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

      @aguardeBtn("#btn-buscar", "Buscar", "Buscando...", !@buscando)
      @aguardeBtn("#btn-importar", "Importar", "Importar", !@buscando)
      @

    aguardeBtn: (btnSel, labelEnabled, labelDisabled, enabled)->
      if enabled
        @$("#{btnSel}").html(labelEnabled).attr "disabled", false
      else
        @$("#{btnSel}").html(labelDisabled).attr("disabled", true).append """ <span class="glyphicon glyphicon-refresh" aria-hidden="true"></span>"""

    buscar: (ev)->
      ev.preventDefault()
      @inicio = parseInt $("#input-inicio").val()
      @fim = parseInt $("#input-fim").val()
      console.log "Buscando os usuário de #{@inicio} a #{@fim}"
      @buscando = true
      @collection.reset()

      #*******
      for i in [@inicio..@fim]
        ((id)=>
          $.get "/usuarioDoRedmine?id=#{id}", (u)=>
            unless _.isEmpty(u) or _.isEmpty(u.user)
              @collection.add u.user 
            else
              console.log "UID #{id} não encontrado..."
          .fail (e)=>
            console.log e.responseText
          .always ()=>
            if id >= @fim
              @buscando = false
              @render()
        )(i)
      #******


      # id = @inicio
      # requisitar = =>
      #   $.get "/usuarioRedmine?id=#{id}", (u)=>
      #     unless _.isEmpty(u) or _.isEmpty(u.user)
      #       @collection.add u.user 
      #     else
      #       console.log "UID #{id} não encontrado..."
      #     id++
      #     if id <= @fim
      #       requisitar()
      #     else
      #       @buscando = false
      #       @render()
      # requisitar()

    trclick: (ev)->
      target = @$(ev.target)
      chk = target.closest("tr").find("input:checkbox")
      return if chk[0] is target[0]
      chk.prop("checked", !chk.is(":checked"))

    importar: (ev)->
      ev.preventDefault()
      that = @
      @aguardeBtn "#btn-importar", "Importar", "Importar", false
      checks = @$ "#frm-usuarios input:checked"
      unless checks.length
        @aguardeBtn "#btn-importar", "Importar", "Importar", true
        alert "Nenhum usuário selecionado."
        return
      usuarioRedmineCollection = new UsuarioRedmineCollection
      usuarioRedmineCollection.fetch
        success: (collection, response) =>
          checks.each (i)->
            id = parseInt $(@).attr("name")
            mdl = that.collection.get id
            unless usuarioRedmineCollection.findWhere redmineID: id
              usuarioRedmineCollection.add
                redmineID: id
                nome: "#{mdl.get("firstname")} #{mdl.get("lastname")}"
            if i is checks.length - 1
              usuarioRedmineCollection.sync "create", usuarioRedmineCollection,
                success: (msg)->
                  console.log msg
                  that.aguardeBtn "#btn-importar", "Importar", "Importar", true
                  alert "Usuários importados com sucesso!"
                error: (e)->
                  console.log e
                  that.aguardeBtn "#btn-importar", "Importar", "Importar", true
                  alert "Houve um erro ao importar usuários!/r/nConsulte o log."

          # @collection.reset response
          # @render()
        error: (e) ->
          console.log e
          that.aguardeBtn "#btn-importar", "Importar", "Importar", true
          alert "Houve um erro ao importar usuários!/r/nConsulte o log."

  module.exports = ImportarUsuariosView
