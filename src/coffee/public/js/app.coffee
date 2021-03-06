define (require, exports, module) ->
   
  _ = require "underscore"
  $ = require "jquery"
  Backbone = require "backbone"

  app = {}
  app.views = {}
  app.currentView = null
  app.root = "/"

  Backbone.Events.on "view:index", -> app.createMainView("home", true)
  
  app.createMainView = (activeMenu, forceRecreate) -> 
    if not app.views["index"] or forceRecreate
      __createIndexView()
    else
      app.indexView.menuView.setActiveMenu(activeMenu)

  Backbone.Events.on "view:sprintLista", -> 
    app.createView("sprintLista", require("views/sprintListaView"))

  Backbone.Events.on "view:sprintCadastro", (id) -> 
    app.createView("sprintCadastro", require("views/sprintCadastroView"), sprintID: id)

  Backbone.Events.on "view:sprintResultado", (id) -> 
    app.createView("sprintResultado", require("views/sprintResultadoView"), sprintID: id)

  Backbone.Events.on "view:importUsuariosRedmine", -> 
    app.createView("importUsuariosRedmine", require("views/importUsuariosRedmineView"))

  Backbone.Events.on "view:equipeLista", -> 
    app.createView("equipeLista", require("views/equipeListaView"))

  Backbone.Events.on "view:equipeCadastro", (id)-> 
    app.createView("equipeCadastro", require("views/equipeCadastroView"), equipeID: id)
  
  createView = (name, View, options = {}) ->
    __createIndexView()
    __unbindingView app.currentView if app.currentView?
    view = __createView name, View, options
    app.currentView = view

  createSubView = (view, name, SubView, options = {}) ->
    view.subViews = {} unless view.subViews?
    vName = "#{view.name}.#{name}"
    subView = __createView vName, SubView, options
    view.subViews[vName] = subView

  __createIndexView = ()->
    unless app.indexView?
      View = require("views/index")
      view = new View
      app.indexView = view

  __createView = (name, View, options = {}) ->
    view = app.views[name]
    __unbindingView view
    view = new View options
    view.name = name
    app.views[name] = view
    view

  __unbindingView = (view)->
    if view?
      __unbindingSubViews view
      view.off()
      view.stopListening()
      view.undelegateEvents()
      view.clean?()
      view.$el.empty()
      app.views[view.name] = undefined

  __unbindingSubViews = (view) ->
    return if _.isEmpty view.subViews
    for name, subView of view.subViews
      __unbindingView subView
    

  app.createView = createView
  app.createSubView = createSubView

  window.app = app  
  module.exports = app
