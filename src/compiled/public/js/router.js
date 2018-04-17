(function() {
  define(function(require, exports, module) {
    var Backbone, Router;
    Backbone = require("backbone");
    Router = (function() {
      class Router extends Backbone.Router {};

      Router.prototype.routes = {
        "": function() {
          return Backbone.Events.trigger("view:index");
        },
        "sprints": function() {
          return Backbone.Events.trigger("view:sprintLista");
        },
        "sprint": function() {
          return Backbone.Events.trigger("view:sprintCadastro");
        },
        "sprint/:id": function(id) {
          return Backbone.Events.trigger("view:sprintCadastro", id);
        },
        "sprint/result/:id": function(id) {
          return Backbone.Events.trigger("view:sprintResultado", id);
        },
        "definir-equipe": function() {
          return Backbone.Events.trigger("view:definirEquipe");
        }
      };

      return Router;

    }).call(this);
    //   "calculo" : "calculo"
    //   "calculo/load/:id" : "calculo"
    //   "calculo/new" : -> Backbone.Events.trigger "view:calculo.calculo.new"
    //   "calculo/:subview" : (subview)-> Backbone.Events.trigger "view:calculo.calculo", subview

    //   "usuario": -> Backbone.Events.trigger "view:usuario.new"
    //   "usuario/ativacao/sucesso": -> Backbone.Events.trigger "view:usuario.ativacao.sucesso"

    //   "login": -> Backbone.Events.trigger "view:login"

    //   # "error": -> Backbone.Events.trigger "view:error"

    // calculo: (id)-> Backbone.Events.trigger "view:calculo.calculo", id
    return module.exports = Router;
  });

}).call(this);
