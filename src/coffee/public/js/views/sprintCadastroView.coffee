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
        chamadosTxt: "12789 12741 12740 12577"
        buscando: false
        chamados: []
      @model.on "change", @render, @
      @usuarioRedmineCollection = new UsuarioRedmineCollection
      @chamadosBuscaCollection = new Backbone.Collection
      @chamadosBuscaCollection.on "add remove", @render, @
      @render()      
      @usuarioRedmineCollection.fetch
        success: (collection, response) =>
          if @options.id
            @model.set "_id": @options.id
            @model.fetch
              error: (e)->
                console.log e
                alert "Houve um erro ao buscar a sprint!/r/nConsulte o log."
          else
            @render()
        error: (e) ->
          console.log e
          alert "Houve um erro ao importar usuários!/r/nConsulte o log."
      @

    render: ->
      that = this
      modelObj = @model.toJSON()
      modelObj.usuarios = @usuarioRedmineCollection.toJSON()
      modelObj.chamados = @chamadosBuscaCollection.toJSON()
      $(@el).html @template modelObj

      helper.aguardeBtn.call @, "#btn-buscar", "Buscar", "Buscando...", !@buscando
      @

    buscarIssues: (ev)->
      ev.preventDefault()
      helper.aguardeBtn.call @,  "#btn-buscar", "Buscar", "Buscando...", false
      @buscando = true
      @chamadosBuscaCollection.reset()

      chamadosTxt = @$("#txt-chamados").val()
      nome = @$("#input-nome").val()
      inicio = @$("#input-inicio").val()
      fim = @$("#input-fim").val()

      @model.set
        nome: nome
        chamadosTxt: chamadosTxt
        inicio: inicio
        fim: fim
      issuesArr = _.reject chamadosTxt.split(/[^\d]/), (iss)-> not iss

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

      chamadosChk = @$ "#frm-sprint #tbl-chamados input:checked"
      unless chamadosChk.length
        helper.aguardeBtn.call @, "#btn-salvar", "Salvar", "Salvando...", true
        alert "Nenhum chamado selecionado."
        return

      usuarios = _.map usuariosChk, (el)=> @usuarioRedmineCollection.get($(el).val()).toJSON()
      chamados = _.map chamadosChk, (el)=> @chamadosBuscaCollection.get(parseInt($(el).val())).toJSON()

      @model.set
        usuarios: usuarios
        chamados: chamados

      @model.save null,
        success: (mdl)->
          alert "Sprint salva com sucesso!"
        error: (err)->
          console.log err
          alert "Houve algum erro ao salvar a sprint./r/nConsulte o log."


      return
  
  module.exports = SprintCadastroView