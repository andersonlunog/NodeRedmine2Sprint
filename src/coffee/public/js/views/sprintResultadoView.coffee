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
      "click #btn-buscar": "getLancamentosHoras"
      "click #btn-teste": "teste"
      "change .radio-grafico": "alterarGrafico"

    initialize: (@options)->
      @chartColors =
        blue: "rgb(54, 162, 235)"
        green: "rgb(75, 192, 192)"
        grey: "rgb(201, 203, 207)"
        orange: "rgb(255, 159, 64)"
        purple: "rgb(153, 102, 255)"
        red: "rgb(255, 99, 132)"
        yellow: "rgb(255, 205, 86)"

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
        @render()
        alert "Nenhuma sprint encontrada com ID #{@options.sprintID}"
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
      @usuarioHoraDia = {}

      _somaPorCustomFields = (dest, lancamento, customFieldID)->
        key = _.findWhere(lancamento.get("issue").custom_fields, {id: customFieldID}).value
        if dest[key]
          dest[key] += lancamento.get("hours")
        else
          dest[key] = lancamento.get("hours")

      _somaUsuarioHoraDia = (dest, lancamento)->
        userName = lancamento.get("user").name
        dest[userName] = {} unless dest[userName]?

        spent_on = lancamento.get "spent_on"
        if dest[userName][spent_on]
          dest[userName][spent_on] += lancamento.get("hours")
        else
          dest[userName][spent_on] = lancamento.get("hours")

      @lancamentosCollection.forEach (lancamento)=>
        _somaPorCustomFields @horaOrigem, lancamento, 53
        _somaPorCustomFields @horaGrupoCliente, lancamento, 51
        _somaPorCustomFields @horaTipoServico, lancamento, 58
        _somaUsuarioHoraDia @usuarioHoraDia, lancamento

      @renderGraficoUsuarioHoraDia()


    render: ->
      modelObj = @model.toJSON()
      modelObj.lancamentos = @lancamentosCollection.toJSON()
      $(@el).html @template modelObj

      helper.aguardeBtn.call @, "#btn-buscar", "Buscar", "Buscando...", !@buscando

      @preparaGrafico()
      @

    preparaGrafico: ()->
      $("#grafico-modal").on "shown.bs.modal", (e)=>
        $("#grafico-modal .modal-body .btn-group .btn").first().click()
        @renderGrafico @horaOrigem unless @graficoPizza?

    teste: (e)->
      e.preventDefault()
      @consolidaDados()

    renderGraficoUsuarioHoraDia: ()->
      ctx = $ "#chart-area-usuario"
      datasets = []
      labels = []
      i = 0
      for k, v of @usuarioHoraDia
        data = []
        for k1, v1 of v
          labels.push k1 unless _.contains labels, k1
          data.push 
            x: k1
            y: v1
        datasets.push 
          label: k
          backgroundColor: @chartColors[_.keys(@chartColors)[i]]
          borderColor: @chartColors[_.keys(@chartColors)[i++]]
          fill: false
          lineTension: 0
          data: _.sortBy data, "x"
      
      opts = 
        type: 'line',
        data: 
          labels: labels.sort(),
          datasets: datasets

      # console.log JSON.stringify opts

      @graficoUsuario?.destroy()
      @graficoUsuario = new Chart ctx, opts        

      # options = {
      #   type: 'line',
      #   data: {
      #     labels: ["2018-04-20", "2018-04-19", "2018-04-18", "2018-04-16", "2018-04-17"],
      #     datasets: [
      #       {
      #         backgroundColor: "rgb(54, 162, 235)",
      #         borderColor: "rgb(54, 162, 235)",
      #         fill: false,
      #         data: [
      #           {
      #             x: "2018-04-20",
      #             y: 2.8
      #           },
      #           {
      #             x: "2018-04-19",
      #             y: 8.4
      #           },
      #           {
      #             x: "2018-04-18",
      #             y: 8.7
      #           },
      #           {
      #             x: "2018-04-16",
      #             y: 8.7
      #           },
      #           {
      #             x: "2018-04-17",
      #             y: 9.4
      #           }
      #         ],
      #         label: "Winicius Oliveira"
      #       },
      #       {
      #         backgroundColor: "rgb(75, 192, 192)",
      #         borderColor: "rgb(75, 192, 192)",
      #         fill: false,
      #         data: [
      #           {
      #             x: "2018-04-16",
      #             y: 8
      #           },
      #           {
      #             x: "2018-04-17",
      #             y: 8
      #           }
      #         ],
      #         label: "Sérgio  Rodriguez"
      #       }
      #     ]
      #   }
      # }
      # @graficoUsuario = new Chart ctx, options


    renderGrafico: (data)->
      ctx = $ "#chart-generic-area"
      @graficoPizza?.destroy()
      @graficoPizza = new Chart ctx,
        type: 'pie',
        data: 
          labels: _.keys(data),
          datasets: [
            # label: 'Hora X Origem',
            data: _.values(data),
            backgroundColor: [
                @chartColors.blue,
                @chartColors.orange,
                @chartColors.green,
                @chartColors.yellow,
                @chartColors.purple,
                @chartColors.red
            ],
            borderColor: [
              @chartColors.blue,
              @chartColors.orange,
              @chartColors.green,
              @chartColors.yellow,
              @chartColors.purple,
              @chartColors.red
            ],
            borderWidth: 1
          ]

    alterarGrafico: (e)->
      switch $(e.target).val()
        when "origem"
          $("#grafico-modal-label").html "Hora X Origem"
          @renderGrafico @horaOrigem
        when "tipo_servico"
          $("#grafico-modal-label").html "Hora X Tipo Serviço"
          @renderGrafico @horaTipoServico
        when "grupo_cliente"
          $("#grafico-modal-label").html "Hora X Grupo Cliente"
          @renderGrafico @horaGrupoCliente
        
      
  
  module.exports = SprintResultadoView