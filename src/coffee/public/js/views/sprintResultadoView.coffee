define (require, exports, module) ->
  
  _ = require "underscore"
  $ = require "jquery"
  Backbone = require "backbone"
  template = require "text!templates/sprintResultado.html"
  sprintModel = require "models/sprintModel"
  sprintResultModel = require "models/sprintResultModel"
  UsuarioRedmineCollection = require "models/usuarioRedmineCollection"
  Chart = require "chart"
  helper = require "helpers/helper"
  require "bootstrap"

  class SprintResultadoView extends Backbone.View
    el: ".mid-container"

    template: _.template template

    events:
      # "click #btn-salvar": "salvar"
      "click #btn-atualizar-tudo": "atualizarTudo"
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
        gold: "rgb(192,178,131)"
        charcoal: "rgb(55,55,55)"
        teal: "rgb(7,136,155)"
        powder: "rgb(102,185,191)"
        ink: "rgb(6,47,79)"
        oxblood: "rgb(118,50,63)"
        forest: "rgb(30,57,42)"

      @model = new sprintModel
      @resultModel = new sprintResultModel
      @model.on "change", @render, @
      @usuarioRedmineCollection = new UsuarioRedmineCollection
      @lancamentosCollection = new Backbone.Collection
      @lancamentosCollection.on "add remove", @render, @
      @render()
      if @options.sprintID
        @model.set "_id": @options.sprintID
        @resultModel.set "_id": @options.sprintID
        @model.fetch
          success: (sprint)=>
            @resultModel.fetch
              success: (sprintResult)=>
                @lancamentosCollection.reset sprintResult.get "lancamentos"
                @consolidaDados()
                # @buscaLancamentosHoras sprint.get("usuarios"), sprint.get("inicio"), sprint.get("fim")
              error: (e)->
                console.log e
                alert "Houve um erro ao buscar resultado da sprint!/r/nConsulte o log."
          error: (e)->
            console.log e
            alert "Houve um erro ao buscar a sprint!/r/nConsulte o log."
      else
        @render()
        alert "Nenhuma sprint encontrada com ID #{@options.sprintID}"
      @

    render: ->
      modelObj = @model.toJSON()
      modelObj.lancamentos = @lancamentosCollection.toJSON()
      modelObj.usuarios = @usuarioHoraCustoms or {}
      $(@el).html @template modelObj

      helper.aguardeBtn.call @, "#btn-atualizar-tudo", "Atualizar Tudo", "Atualizando...", !@buscando
      @

    getColors: (labels)->
      ret = []
      for label, i in labels
        if _.contains ["Contrato", "Standard", "Normal"], label
          ret.push @chartColors.blue
        else if _.contains ["Venda", "Custom"], label
          ret.push @chartColors.green
        else if _.contains ["Bonificação", "Interno", "Correção"], label
          ret.push @chartColors.yellow
        else if _.contains ["Investimento", "Retrabalho"], label
          ret.push @chartColors.orange
        else
          ret.push _.values(@chartColors)[i + 6]
      ret

    atualizarTudo: (e)->
      e.preventDefault()
      @resultModel.set "lancamentos", []
      @buscaLancamentosHoras @model.get("usuarios"), @model.get("inicio"), @model.get("fim")

    buscaLancamentosHoras: (usuarios, inicio, fim)->
      @buscando = true
      helper.aguardeBtn.call @, "#btn-atualizar-tudo", "Atualizar Tudo", "Atualizando...", !@buscando
      promLancam = []
      usuarios.forEach (id, i, arr)=>
        promLancam.push @getLancamentos id, inicio, fim

      Promise.all(promLancam).then (lancamentos)=>
        @lancamentosCollection.reset _.without(_.flatten(lancamentos), undefined)
        @resultModel.set "lancamentos", @lancamentosCollection.toJSON()
        console.log "Acabou... #{@lancamentosCollection.length}"
        @salvar()
        @buscando = false
        @consolidaDados()

    getLancamentos: (userID, inicio, fim)->
      new Promise (resolve, reject)=>
        $.get "/timeentries?user=#{userID}&inicio=#{inicio}&fim=#{fim}", (lancamento)=>
          unless _.isEmpty(lancamento) or _.isEmpty(lancamento.time_entries)
            promIssues = []
            lancamento.time_entries.forEach (time)=>
              promIssues.push @getIssue time.issue.id

            Promise.all(promIssues).then (issues)=>
              issues.forEach (issue, j)=>
                console.log lancamento.time_entries[j].issue = issue
              resolve lancamento.time_entries
          else
            console.log "Usuário #{userID} sem lançamentos..."
            resolve()
        .fail (e)=>
          console.log e
          reject e

    getIssue: (issueID)->
      new Promise (resolve, reject)=>
        $.get "/redmine/issue?id=#{issueID}", (issue)=>
          unless _.isEmpty(issue) or _.isEmpty(issue.issues)
            resolve issue.issues[0]
          else
            console.log e = "Chamado #{issueID} não encontrado..."
            reject e
        .fail (e)=>
          console.log e
          reject e

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
      @usuarioHoraCustoms = {}      

      _somaPorCustomFields = (dest, lancamento, customFieldID)->
        key = _.findWhere(lancamento.get("issue").custom_fields, {id: customFieldID})?.value
        if dest[key]
          dest[key] += lancamento.get("hours")
        else
          dest[key] = lancamento.get("hours")

      _somaUsuarioHoraDia = (dest, lancamento)->
        userName = lancamento.get("user").name
        dest[userName] = {} unless dest[userName]?

        spent_on = lancamento.get "spent_on"
        match = (/(\d{4})-(\d{2})-(\d{2})/g).exec(spent_on)
        spent_on = "#{match[3]}/#{match[2]}"
        if dest[userName][spent_on]
          dest[userName][spent_on] += lancamento.get("hours")
        else
          dest[userName][spent_on] = lancamento.get("hours")

      _somaUsuarioHoraCustoms = (dest, lancamento)->
        userName = lancamento.get("user").name
        unless dest[userName]?
          dest[userName] = 
            origem: {}
            cliente: {}
            servico: {}

        _somaPorCustomFields dest[userName].origem, lancamento, 53
        _somaPorCustomFields dest[userName].cliente, lancamento, 51
        _somaPorCustomFields dest[userName].servico, lancamento, 58

      @lancamentosCollection.forEach (lancamento)=>
        _somaPorCustomFields @horaOrigem, lancamento, 53
        _somaPorCustomFields @horaGrupoCliente, lancamento, 51
        _somaPorCustomFields @horaTipoServico, lancamento, 58
        _somaUsuarioHoraDia @usuarioHoraDia, lancamento
        _somaUsuarioHoraCustoms @usuarioHoraCustoms, lancamento

      @render()
      @renderGraficoUsuarioHoraDia()
      @renderGraficosUsuarios()
      @renderGraficoTotais @horaOrigem

    salvar: (e) ->
      e?.preventDefault()

      @resultModel.save null,
        success: (mdl)->
          alert "Resultado atualizado com sucesso!"
        error: (err)->
          console.log err
          alert "Houve algum erro ao salvar o resultado./r/nConsulte o log."

    renderGraficosUsuarios: ()->
      _renderPieChart = (ctx, data)=>
        labels = _.keys(data)
        colors =  @getColors(labels)
        new Chart ctx,
          type: 'pie'
          data:
            labels: labels
            datasets: [
              data: _.values(data)
              backgroundColor: colors
              borderColor: colors
              borderWidth: 1
            ]
          options:
            responsive: true

      _.each @usuarioHoraCustoms, (v, k)=>
        tr = @$("tr[data-usuario='#{k}']")
        v.origem.chart?.destroy()
        v.cliente.chart?.destroy()
        v.servico.chart?.destroy()
        v.origem.chart = _renderPieChart tr.find(".chart-usuario-origem").first(), v.origem
        v.cliente.chart = _renderPieChart tr.find(".chart-usuario-cliente").first(), v.cliente
        v.servico.chart = _renderPieChart tr.find(".chart-usuario-servico").first(), v.servico

    renderGraficoUsuarioHoraDia: ()->
      ctx = @$ "#chart-area-usuario"
      datasets = []
      labels = []
      i = 0
      for usuario, diaHora of @usuarioHoraDia
        data = []
        for dia, hora of diaHora
          labels.push dia unless _.contains labels, dia
          data.push 
            x: dia
            y: hora
        datasets.push 
          label: usuario
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
        options:
          responsive: false

      @graficoUsuario?.destroy()
      @graficoUsuario = new Chart ctx, opts       

    renderGraficoTotais: (data)->
      ctx = @$ "#chart-generic-area"
      @graficoPizza?.destroy()
      labels = _.keys(data)
      colors =  @getColors(labels)
      @graficoPizza = new Chart ctx,
        type: 'pie'
        data: 
          labels: labels
          datasets: [
            data: _.values(data)
            backgroundColor: colors
            borderColor: colors
            borderWidth: 1
          ]

    alterarGrafico: (e)->
      switch $(e.target).val()
        when "origem"
          @$("#grafico-modal-label").html "Hora X Origem"
          @renderGraficoTotais @horaOrigem
        when "tipo_servico"
          @$("#grafico-modal-label").html "Hora X Tipo Serviço"
          @renderGraficoTotais @horaTipoServico
        when "grupo_cliente"
          @$("#grafico-modal-label").html "Hora X Grupo Cliente"
          @renderGraficoTotais @horaGrupoCliente

  module.exports = SprintResultadoView