define (require, exports, module) ->
  
  _ = require "underscore"
  $ = require "jquery"
  Backbone = require "backbone"
  template = require "text!templates/sprintResultado.html"
  sprintModel = require "models/sprintModel"
  UsuarioRedmineCollection = require "models/usuarioRedmineCollection"
  Chart = require "chart"
  helper = require "helpers/helper"
  require "bootstrap"

  class SprintResultadoView extends Backbone.View
    el: ".mid-container"

    template: _.template template

    events:
      "submit #frm-sprint": "submit"
      "click #btn-buscar": "buscarIssues"
      "change .radio-grafico": "alterarGrafico"

    initialize: (@options)->
      @model = new sprintModel
      @model.on "change", @render, @
      @usuarioRedmineCollection = new UsuarioRedmineCollection
      @lancamentosCollection = new Backbone.Collection
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
            buscandoIssue = true
            lancamento.time_entries.forEach (time, j)=>
              @getIssue time.issue.id, (issue)=>
                time.issue = issue
                console.log time
                @lancamentosCollection.add time
              , ()=>
                if j >= lancamento.time_entries.length - 1 and i >= usuarios.length - 1
                  console.log "Acabou... #{@lancamentosCollection.length}"
                  @consolidaDados()
          else
            console.log "Usuário #{id} sem lançamentos..."
        .fail (e)=>
          console.log e
        # .always ()=>
        #   buscandoLancamentos = false if i >= usuarios.length - 1
        #     @render()

    getIssue: (issueID, callback, alwaysCb)->
      $.get "/redmine/issue?id=#{issueID}", (issue)=>
        unless _.isEmpty(issue) or _.isEmpty(issue.issues)
          callback issue.issues[0]
        else
          console.log "Chamado #{issueID} não encontrado..."
      .fail (e)=>
        console.log e
      .always ()=>
        alwaysCb?()

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

    consolidaDados: ()->
      @horaOrigem = {}
      @horaGrupoCliente = {}
      @horaTipoServico = {}
      somaPorCustomFields = (dest, lancamento, customFieldID)->
        key = _.findWhere(lancamento.get("issue").custom_fields, {id: customFieldID}).value
        if dest[key]
          dest[key] += lancamento.get("hours")
        else
          dest[key] = lancamento.get("hours")

      @lancamentosCollection.forEach (lancamento)=>
        somaPorCustomFields @horaOrigem, lancamento, 53
        somaPorCustomFields @horaGrupoCliente, lancamento, 51
        somaPorCustomFields @horaTipoServico, lancamento, 58

    render: ->
      modelObj = @model.toJSON()
      modelObj.lancamentos = @lancamentosCollection.toJSON()
      $(@el).html @template modelObj

      helper.aguardeBtn.call @, "#btn-buscar", "Buscar", "Buscando...", !@buscando

      @preparaGrafico()
      @

    preparaGrafico: ()->
      $("#grafico-modal").on "shown.bs.modal", (e)=>
        @renderGrafico @horaOrigem

    renderGrafico: (data)->      
      chartColors = 
        blue: "rgb(54, 162, 235)"
        green: "rgb(75, 192, 192)"
        grey: "rgb(201, 203, 207)"
        orange: "rgb(255, 159, 64)"
        purple: "rgb(153, 102, 255)"
        red: "rgb(255, 99, 132)"
        yellow: "rgb(255, 205, 86)"
      ctx = $ "#chart-area"
      chart = new Chart ctx,
        type: 'pie',
        data: 
          labels: _.keys(data),
          datasets: [
            label: 'Hora X Origem',
            data: _.values(data),
            backgroundColor: [
                chartColors.blue,
                chartColors.orange,
                chartColors.green,
                chartColors.yellow,
                chartColors.purple,
                chartColors.red
            ],
            borderColor: [
              chartColors.blue,
              chartColors.orange,
              chartColors.green,
              chartColors.yellow,
              chartColors.purple,
              chartColors.red
            ],
            borderWidth: 1
          ]

    alterarGrafico: (e)->
      switch $(e.target).val()
        when "origem"
          @renderGrafico @horaOrigem
        when "tipo_servico"
          @renderGrafico @horaTipoServico
        when "grupo_cliente"
          @renderGrafico @horaGrupoCliente
        
      
  
  module.exports = SprintResultadoView