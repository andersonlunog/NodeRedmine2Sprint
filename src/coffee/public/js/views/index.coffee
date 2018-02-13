define (require, exports, module) ->
  
  _ = require "underscore"
  $ = require "jquery"
  Backbone = require "backbone"
  layoutTemplate = require "text!templates/layout.html"
  require "bootstrap"

  class MainView extends Backbone.View
    el: "#main"

    initialize: (options) ->
      @render()
      @menuView = app.createView "menu.principal", require("views/MenuView"), activeMenu: options.activeMenu
      @menuView.render()
      @
      
    render: ->
      @$el.html layoutTemplate

    showInitialMessages: ->
      if _.contains(app.resources.showResources, "alertaPeriodoTeste") and not @alertaPeriodoTesteShown
        @alertaPeriodoTesteShown = true
        modal = $("""<div class="modal fade" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                  <h4 class="modal-title">Período de avaliação</h4>
                </div>
                <div class="modal-body">
                  <p>Seja bem vindo!</p>
                  <p>Você ainda tem <strong>7 dias</strong> para usufruir do Acertiz Trabalhista e avaliar o sistema.</p>
                  <p>Caso queira se efetivar, <a href="#" class="faturas">clique aqui</a> e siga as instruções.</p>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>
                </div>
              </div>
            </div>
          </div>""")
        $("body").append modal

        modal.find(".faturas").click (e)->
          e.preventDefault()
          modal.modal "hide"
          window.location.hash = "faturas"

        modal.on "hidden.bs.modal", ->
          modal.remove()

        modal.modal "show"

      if _.contains(app.resources.showResources, "alertaFaturasVencidas") and not @alertaFaturasVencidasShown
        @alertaFaturasVencidasShown = true
        alert "Você está no período de teste"
  
  module.exports = MainView
