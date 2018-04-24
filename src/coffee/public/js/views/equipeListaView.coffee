define (require, exports, module) ->
  
  _ = require "underscore"
  $ = require "jquery"
  Backbone = require "backbone"
  template = require "text!templates/equipeLista.html"
  SprintCollection = require "models/sprintCollection"
  require "bootstrap"

  class EquipeListaView extends Backbone.View
    el: ".mid-container"

    template: _.template template

    initialize: ->
      @collection = new SprintCollection
      @collection.fetch
        success: (collection, response) =>
          @collection.reset response
          @render()
        error: (e) ->
          alert JSON.stringify e

      @collection.on "remove", @render, @
      @

    render: ->
      @$el.html @template sprints : @collection.models

      that = @
      $(".btn-delete").click ()->
        if $(@).data("id")
          that.collection.remove $(@).data("id")

      $("#btn-salvar").click ()->
        that.collection.save()
      @
  
  module.exports = EquipeListaView
