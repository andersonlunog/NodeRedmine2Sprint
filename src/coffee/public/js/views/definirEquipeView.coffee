define (require, exports, module) ->
  
  _ = require "underscore"
  $ = require "jquery"
  Backbone = require "backbone"
  template = require "text!templates/definirEquipe.html"  
  UsuarioRedmineCollection = require "models/usuarioRedmineCollection"
  helper = require "helpers/helper"
  require "bootstrap"

  class DefinirEquipeView extends Backbone.View
    el: ".mid-container"

    template: _.template template

    events:
      "click #btn-buscar": "buscar"
      "click #btn-salvar": "salvar"
      "click #frm-usuarios tbody tr": "trclick"
      "change .chk-usuario": "chkAtivoChanged"

    initialize: ->
      @inicio = 50
      @fim = 60
      @collection = new UsuarioRedmineCollection
      @render()
      @collection.on "add remove reset change", @render, @

      @collection.fetch
        error: (e) =>
          console.log e
          alert "Houve um erro ao buscar usuários!/r/nConsulte o log."
      @

    render: ->
      @$el.html @template 
        usuarios : @collection.models
        buscando: @buscando
        inicio: @inicio
        fim: @fim

      helper.aguardeBtn.call @,"#btn-buscar", "Buscar", "Buscando...", !@buscando
      helper.aguardeBtn.call @, "#btn-salvar", "Salvar", "Buscando...", !@buscando

      @

    buscar: (ev)->
      ev.preventDefault()
      @inicio = parseInt $("#input-inicio").val()
      @fim = parseInt $("#input-fim").val()
      console.log "Buscando os usuário de #{@inicio} a #{@fim}"
      @buscando = true

      #*******
      for i in [@inicio..@fim]
        ((id)=>
          $.get "/buscarRedmine?id=#{id}", (u)=>
            unless _.isEmpty(u) or _.isEmpty(u.user)
              userDB = @collection.findWhere redmineID: u.user.id
              unless userDB
                @collection.add
                  ativo: false
                  redmineID: u.user.id
                  nome: "#{u.user.firstname} #{u.user.lastname}"
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

    trclick: (ev)->
      target = @$(ev.target)
      chk = target.closest("tr").find("input:checkbox")
      return if chk[0] is target[0]
      chk.prop("checked", !chk.is(":checked"))
      chk.trigger "change"

    chkAtivoChanged: (ev)->
      chk = @$(ev.target)
      id = chk.attr("name")
      @collection.get(id).set "ativo", chk.is(":checked")

    salvar: (ev)->
      ev.preventDefault()
      that = @
      helper.aguardeBtn.call @, "#btn-salvar", "Salvar", "Salvar", false
      checks = @$ "#frm-usuarios input:checked"
      unless checks.length
        helper.aguardeBtn.call @, "#btn-salvar", "Salvar", "Salvar", true
        alert "Nenhum usuário selecionado."
        return

      @collection.sync "create", @collection,
        success: (msg)->
          console.log msg
          helper.aguardeBtn.call that, "#btn-salvar", "Salvar", "Salvar", true
          alert "Usuários salvos com sucesso!"
        error: (e)->
          console.log e
          helper.aguardeBtn.call that, "#btn-salvar", "Salvar", "Salvar", true
          alert "Houve um erro ao salvar usuários!/r/nConsulte o log."

      # usuarioRedmineCollection = new UsuarioRedmineCollection
      # usuarioRedmineCollection.fetch
      #   success: (collection, response) =>
      #     checks.each (i)->
      #       id = parseInt $(@).attr("name")
      #       mdl = that.collection.get id
      #       unless usuarioRedmineCollection.findWhere redmineID: id
      #         usuarioRedmineCollection.add
      #           redmineID: id
      #           nome: "#{mdl.get("firstname")} #{mdl.get("lastname")}"
      #       if i is checks.length - 1
      #         usuarioRedmineCollection.sync "create", usuarioRedmineCollection,
      #           success: (msg)->
      #             console.log msg
      #             helper.aguardeBtn.call that, "#btn-salvar", "Salvar", "Salvar", true
      #             alert "Usuários importados com sucesso!"
      #           error: (e)->
      #             console.log e
      #             helper.aguardeBtn.call that, "#btn-salvar", "Salvar", "Salvar", true
      #             alert "Houve um erro ao salvar usuários!/r/nConsulte o log."
      #   error: (e) =>
      #     console.log e
      #     helper.aguardeBtn.call @, "#btn-salvar", "Salvar", "Salvar", true
      #     alert "Houve um erro ao salvar usuários!/r/nConsulte o log."

  module.exports = DefinirEquipeView
