define (require, exports, module) ->
  
  _ = require "underscore"
  $ = require "jquery"
  Backbone = require "backbone"
  template = require "text!templates/sprintResultado.html"
  sprintModel = require "models/sprintModel"
  UsuarioRedmineCollection = require "models/usuarioRedmineCollection"
  helper = require "helpers/helper"
  require "bootstrap"

  class SprintResultadoView extends Backbone.View
    el: ".mid-container"

    template: _.template template

    events:
      "submit #frm-sprint": "submit"
      "click #btn-buscar": "buscarIssues"

    initialize: (@options)->
      @model = new sprintModel
      @model.on "change", @render, @
      @usuarioRedmineCollection = new UsuarioRedmineCollection
      @lancamentoHorasCollection = new Backbone.Collection
      @chamadosCollection = new Backbone.Collection
      @chamadosBuscaCollection = new Backbone.Collection
      @chamadosBuscaCollection.on "add remove", @render, @
      @render()
      if @options.sprintID
        @model.set "_id": @options.sprintID
        @model.fetch
          success: @getLancamentosHoras.bind(@)
          error: (e)->
            console.log e
            alert "Houve um erro ao buscar a sprint!/r/nConsulte o log."
      else
        @usuarioRedmineCollection.forEach (mdl)->
          mdl.set "ativoSprint", true
        @render()
      @

    getLancamentosHoras: (sprint)->
      usuarios = sprint.get "usuarios"
      inicio = sprint.get "inicio"
      fim = sprint.get "fim"
      usuarios.forEach (id, i, arr)=>
        $.get "/timeentries?user=#{id}&inicio=#{inicio}&fim=#{fim}", (lancamento)=>
          unless _.isEmpty(lancamento) or _.isEmpty(lancamento.time_entries)
            lancamento.time_entries.forEach (time)=>
              @getIssue time.issue.id, (issue)=>
                time.issue = issue
                console.log time
                @processaLancamento time
          else
            console.log "Usuário #{id} sem lançamentos..."
        .fail (e)=>
          console.log e
        # .always ()=>
        #   if i >= usuarios.length - 1
        #     @buscando = false
        #     @render()

    getIssue: (issueID, callback)->
      mdl = @chamadosCollection.get issueID
      return callback(mdl) if mdl
      mdl = @chamadosCollection.add id: issueID

      $.get "/redmine/issue?id=#{issueID}", (issue)=>
        unless _.isEmpty(issue) or _.isEmpty(issue.issues)
          mdl.set issue.issues[0]
          callback mdl
        else
          console.log "Chamado #{issueID} não encontrado..."
      .fail (e)=>
        console.log e
      # .always ()=>
      #   if i >= issuesArr.length - 1
      #     @buscando = false
      #     @render()

    processaLancamento: (lancamento)->
      time = _.pick lancamento, "user", "hours", "spent_on"
      issue = _.pick lancamento.issue, "id", "subject", "estimated_hours", "status"
      issue.time_entries = time

      lancamento.issue.custom_fields.forEach (field)->
        switch field.id
          when 19
            issue.sistema = field.value
          when 51
            issue.grupo_cliente = field.value
          when 52
            issue.componente = field.value
          when 53
            issue.origem = field.value
          when 58
            issue.tipo_servico = field.value

      ###
      issue = 
        id: 1
        subject: ""
        estimated_hours: 1
        status:
          {id: 27, name: "Aguardando Dev"}
        custom_fields: [
          {id: 19, name: "Sistema", value: "Interno"}
          {id: 51, name: "Grupo Cliente", value: "Custom"}
          {id: 52, name: "Componente", value: "Consolidado"}
          {id: 53, name: "Origem", value: "Contrato"}
          {id: 58, name: "Tipo do Serviço", value: "Correção"}
        ]
        time_entries:
          hours: 7
          spent_on: "2018-04-16"
          user: {id: 43, name: "Eduardo Reis"}
      ###

    render: ->
      modelObj = @model.toJSON()
      modelObj.resultados = []
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
  
  module.exports = SprintResultadoView