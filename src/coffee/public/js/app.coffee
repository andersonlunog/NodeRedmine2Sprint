define (require, exports, module) ->
   
  _ = require "underscore"
  $ = require "jquery"
  Backbone = require "backbone"
  # ServiceUtil = require "helpers/serviceUtil"

  app = {}
  app.views = {}
  app.root = "/"
  # app.post = ServiceUtil.post

  Backbone.Events.on "view:index", -> app.createMainView("home", true)
  
  app.createMainView = (activeMenu, forceRecreate) -> 
    if not app.views["index"] or forceRecreate
      __createView "index", require("views/index"), activeMenu: activeMenu
    else
      app.views["index"].menuView.setActiveMenu(activeMenu)

  Backbone.Events.on "view:sprintLista", -> 
    app.createView("sprintLista", require("views/sprintListaView"))

  Backbone.Events.on "view:sprintCadastro", (id) -> 
    app.createView("sprintCadastro", require("views/sprintCadastroView"), sprintID: id)

  # app.createCalculoView = (id)-> createView "calculo.calculo", require("views/calculo/CalculoView"), calculoID: id
  
  createView = (name, View, options = {}) ->
    if not app.loaded
      app.loaded = true
      __createView "index", require("views/index"), activeMenu: "home"
    __createView name, View, options

  __createView = (name, View, options = {}) ->
    view = app.views[name]
    if view?
      view.off()
      view.stopListening()
      view.clean?()
    view = new View options
    app.views[name] = view

  app.createView = createView

  window.app = app  
  module.exports = app
