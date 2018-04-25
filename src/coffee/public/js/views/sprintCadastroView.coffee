define (require, exports, module) ->
  
  _ = require "underscore"
  $ = require "jquery"
  Backbone = require "backbone"
  template = require "text!templates/sprintCadastro.html"
  sprintModel = require "models/sprintModel"
  EquipeCollection = require "models/equipeCollection"
  helper = require "helpers/helper"
  require "bootstrap"

  class SprintCadastroView extends Backbone.View
    el: ".mid-container"

    template: _.template template

    events:
      "submit #frm-sprint": "submit"
      "click #btn-buscar": "buscarIssues"
      "change #select-equipe": "alterarEquipe"      

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
      @equipeCollection = new EquipeCollection
      @chamadosBuscaCollection = new Backbone.Collection
      @chamadosBuscaCollection.on "add remove", @render, @
      @render()
      @fetchEquipe()
      @

    fetchEquipe: () ->
      @equipeCollection.fetch
        success: (equipes) =>
          if @options.sprintID
            @model.set "_id": @options.sprintID
            @model.fetch
              success: (sprint) =>
                equipe = equipes.get sprint.get "equipeID"
                if equipe?
                  @usuariosEquipe = equipe.get("usuarios")
                else
                  @usuariosEquipe = equipes.at(0).get("usuarios")
                @render()
              error: (e)->
                console.log e
                alert "Houve um erro ao buscar a sprint!/r/nConsulte o log."
          else
            @usuariosEquipe = equipes.at(0).get("usuarios")
            @render()
        error: (e) ->
          console.log e
          alert "Houve um erro ao buscar equipes!/r/nConsulte o log."

    render: ->
      $(@el).html @template
        model: @model.toJSON()
        equipes: @equipeCollection.toJSON()
        usuariosEquipe: @usuariosEquipe or []
        chamadosPlanejados: @chamadosBuscaCollection.toJSON()

      helper.aguardeBtn.call @, "#btn-buscar", "Buscar", "Buscando...", !@buscando
      @

    alterarEquipe: (e)->
      @fillModel()
      @render()

    fillModel: ()->
      equipeID = @$("#select-equipe").val()
      chamadosPlanejadosTxt = @$("#txt-chamados").val()
      nome = @$("#input-nome").val()
      inicio = @$("#input-inicio").val()
      fim = @$("#input-fim").val()

      @usuariosEquipe = @equipeCollection.get(equipeID).get("usuarios")

      @model.set
        equipeID: equipeID
        usuarios: _.pluck @usuariosEquipe, "redmineID"
        nome: nome
        chamadosPlanejadosTxt: chamadosPlanejadosTxt
        chamadosPlanejados: []
        inicio: inicio
        fim: fim

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
        $.get "/redmine/issuetime?id=#{id}", (issue)=>
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

      # usuariosChk = @$ "#frm-sprint #tbl-usuarios input:checked"
      # unless usuariosChk.length
      #   helper.aguardeBtn.call @, "#btn-salvar", "Salvar", "Salvando...", true
      #   alert "Nenhum usuário selecionado."
      #   return

      @fillModel()

      @model.save null,
        success: (mdl)->
          alert "Sprint salva com sucesso!"
        error: (err)->
          console.log err
          alert "Houve algum erro ao salvar a sprint./r/nConsulte o log."


      return
  
  module.exports = SprintCadastroView