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
      @lancamentosCollection = new Backbone.Collection
      @chamadosCollection = new Backbone.Collection
      @chamadosBuscaCollection = new Backbone.Collection
      @chamadosBuscaCollection.on "add remove", @render, @
      @lancamentosCollection.on "add remove", @render, @
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
      $.get "/redmine/issue?id=#{issueID}", (issue)=>
        unless _.isEmpty(issue) or _.isEmpty(issue.issues)
          callback issue.issues[0]
        else
          console.log "Chamado #{issueID} não encontrado..."
      .fail (e)=>
        console.log e

    processaLancamento: (lancamento)->
      time = _.pick lancamento, "user", "hours", "spent_on"
      issue = _.pick lancamento.issue, "id", "subject", "estimated_hours", "status", "assigned_to"
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

      @lancamentosCollection.add issue

    render: ->
      modelObj = @model.toJSON()
      modelObj.resultados = @lancamentosCollection.toJSON()
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