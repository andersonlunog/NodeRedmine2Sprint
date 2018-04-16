define (require, exports, module) ->
  
  _ = require "underscore"
  $ = require "jquery"
  Backbone = require "backbone"
  template = require "text!templates/sprintCadastro.html"
  sprintModel = require "models/sprintModel"
  UsuarioRedmineCollection = require "models/usuarioRedmineCollection"
  helper = require "helpers/helper"
  require "bootstrap"

  class SprintCadastroView extends Backbone.View
    el: ".mid-container"

    template: _.template template

    events:
      "submit #frm-sprint": "submit"
      "click #btn-buscar": "buscarIssues"

    initialize: (@options)->
      @model = new sprintModel
        usuarios: []
        nome: ""
        inicio: ""
        fim: ""
        chamadosPlanejadosTxt: "15527 15554 15555 15556 15557"
        buscando: false
        chamadosPlanejados: []
        chamadosNaoPlanejados: []
      @model.on "change", @render, @
      @usuarioRedmineCollection = new UsuarioRedmineCollection
      @chamadosBuscaCollection = new Backbone.Collection
      @chamadosBuscaCollection.on "add remove", @render, @
      @render()      
      @usuarioRedmineCollection.fetch
        data: 
          ativo: true
        success: (collection, response) =>
          if @options.sprintID
            @model.set "_id": @options.sprintID
            @model.fetch
              success: (sprint) =>
                @usuarioRedmineCollection.forEach (mdl)->
                  mdl.set("ativoSprint", true) if _.some sprint.get("usuarios"), (rID)-> mdl.get("redmineID")
                @render()
              error: (e)->
                console.log e
                alert "Houve um erro ao buscar a sprint!/r/nConsulte o log."
          else
            @usuarioRedmineCollection.forEach (mdl)->
              mdl.set "ativoSprint", true
            @render()
        error: (e) ->
          console.log e
          alert "Houve um erro ao importar usuários!/r/nConsulte o log."
      @

    render: ->
      that = this
      modelObj = @model.toJSON()
      modelObj.usuarios = @usuarioRedmineCollection.toJSON()
      modelObj.chamadosPlanejados = @chamadosBuscaCollection.toJSON()
      $(@el).html @template modelObj

      helper.aguardeBtn.call @, "#btn-buscar", "Buscar", "Buscando...", !@buscando
      @

    buscarIssues: (ev)->
      ev.preventDefault()
      helper.aguardeBtn.call @,  "#btn-buscar", "Buscar", "Buscando...", false
      @buscando = true
      @chamadosBuscaCollection.reset()

      chamadosPlanejadosTxt = @$("#txt-chamados").val()
      nome = @$("#input-nome").val()
      inicio = @$("#input-inicio").val()
      fim = @$("#input-fim").val()

      @model.set
        nome: nome
        chamadosPlanejadosTxt: chamadosPlanejadosTxt
        inicio: inicio
        fim: fim
      issuesArr = _.reject chamadosPlanejadosTxt.split(/[^\d]/), (iss)-> not iss

      return alert "O campo chamados não pode estar vazio!" if _.isEmpty issuesArr

      issuesArr.forEach (id, i, arr)=>
        $.get "/redmine/issue?id=#{id}", (issue)=>
          unless _.isEmpty(issue) or _.isEmpty(issue.issue)
            issue.id = issue.issue.id
            @chamadosBuscaCollection.add issue
          else
            console.log "Chamado #{id} não encontrado..."
        .fail (e)=>
          console.log e
        .always ()=>
          if i >= issuesArr.length - 1
            @buscando = false
            @render()

    submit: (ev) ->
      ev.preventDefault()

      usuariosChk = @$ "#frm-sprint #tbl-usuarios input:checked"
      unless usuariosChk.length
        helper.aguardeBtn.call @, "#btn-salvar", "Salvar", "Salvando...", true
        alert "Nenhum usuário selecionado."
        return

      # chamadosChk = @$ "#frm-sprint #tbl-chamados input:checked"
      # unless chamadosChk.length
      #   helper.aguardeBtn.call @, "#btn-salvar", "Salvar", "Salvando...", true
      #   alert "Nenhum chamado selecionado."
      #   return

      usuarios = _.map usuariosChk, (el)=> @usuarioRedmineCollection.get($(el).val()).toJSON()
      # chamadosPlanejados = _.map chamadosChk, (el)=> @chamadosBuscaCollection.get(parseInt($(el).val())).toJSON()
      chamadosPlanejadosTxt = @$("#txt-chamados").val()
      nome = @$("#input-nome").val()
      inicio = @$("#input-inicio").val()
      fim = @$("#input-fim").val()

      @model.set
        usuarios: _.pluck usuarios, "redmineID"
        nome: nome
        chamadosPlanejadosTxt: chamadosPlanejadosTxt
        # chamadosPlanejados: chamadosPlanejados
        chamadosPlanejados: []
        inicio: inicio
        fim: fim

      @model.save null,
        success: (mdl)->
          alert "Sprint salva com sucesso!"
        error: (err)->
          console.log err
          alert "Houve algum erro ao salvar a sprint./r/nConsulte o log."


      return
  
  module.exports = SprintCadastroView