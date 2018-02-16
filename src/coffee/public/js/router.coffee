define (require, exports, module) ->
  Backbone = require "backbone"

  class Router extends Backbone.Router
    routes:
      "": -> Backbone.Events.trigger "view:index"
      
      "sprints": -> Backbone.Events.trigger "view:sprintLista"
      "sprint": -> Backbone.Events.trigger "view:sprintCadastro"
      "importar-usuarios": -> Backbone.Events.trigger "view:importarUsuarios"
      "sprints/:id": -> Backbone.Events.trigger "view:sprintCadastro", id

    #   "calculo" : "calculo"
    #   "calculo/load/:id" : "calculo"
    #   "calculo/new" : -> Backbone.Events.trigger "view:calculo.calculo.new"
    #   "calculo/:subview" : (subview)-> Backbone.Events.trigger "view:calculo.calculo", subview
            
    #   "usuario": -> Backbone.Events.trigger "view:usuario.new"
    #   "usuario/ativacao/sucesso": -> Backbone.Events.trigger "view:usuario.ativacao.sucesso"
      
    #   "login": -> Backbone.Events.trigger "view:login"

    #   # "error": -> Backbone.Events.trigger "view:error"
    
    # calculo: (id)-> Backbone.Events.trigger "view:calculo.calculo", id

  module.exports = Router