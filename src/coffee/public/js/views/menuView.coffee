define (require, exports, module) ->
  _ = require "underscore"
  $ = require "jquery"
  Backbone = require "backbone"
  template = require "text!templates/menu.html"
  
  class MenuView extends Backbone.View
    el: ".menu-area"

    template: _.template template

    events:
      "click #logout": "logout"

    initialize: (@options)->
      # @listenTo Backbone.Events, "menu.home", () ->

    render: ->
      $template = $ @template()
      $template.find("#menu li").removeClass("active").closest("##{@options.activeMenu}").addClass("active")
      $template.find("#user-name").html @shortName(app.resources.userName) if app.resources?.userName
      @$el.html $template
      @

    setActiveMenu: (menu) ->
      $("#menu li").removeClass("active").closest("##{menu}").addClass("active")

    shortName: (name) ->
      return "" unless name.trim()
      firstName = name.trim().split(" ")[0]
      firstName.substring 0, Math.min firstName.length, 25

    testeSessao: (event) ->
      $.post("/sessao", data, (data)->
        alert data.msg
      ).fail () ->
          alert "erro"

    verSessoes: (event) ->
      $.post("/verSessoes",
        a: null
      , (data, status, request) ->
        console.log data
      ).fail (request, status, error) ->
        console.log "erro"

    loginVerify: (event) ->
      $.post("/ver",
        a: null
      , (data, status, request) ->
        console.log data
      ).fail (request, status, error) ->
        console.log "erro"

    logout: (event) ->
      $.post("/logout", {},
      (data, status, request) ->
        Backbone.Events.trigger "resources.reload"
        window.location.hash = "#login"
      ).fail (request, status, error) ->
        console.log "Erro ao tentar realizar o logout."
  
  module.exports = MenuView
