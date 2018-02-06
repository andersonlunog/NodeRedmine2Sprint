(function() {
  define(["backbone", "vm"], function(Backbone, Vm) {
    var AppRouter, initialize;
    AppRouter = Backbone.Router.extend({
      routes: {
        "sucesso": "sucesso",
        "usuarios": "usuarios",
        "usuario": "usuario",
        "usuario/:id": "usuario",
        "*actions": "defaultAction"
      }
    });
    initialize = function(options) {
      var appView, router;
      appView = options.appView;
      router = new AppRouter(options);
      router.on("route:sucesso", function() {
        return require(["views/login/sucesso"], function(ViewPage) {
          var viewPage;
          viewPage = Vm.create(appView, "SucessoView", ViewPage);
          return viewPage.render();
        });
      });
      router.on("route:usuario", function(id) {
        return require(["views/usuario/cadastroView"], function(ViewPage) {
          var viewPage;
          viewPage = Vm.create(appView, "CadastroUsuarioView", ViewPage, {
            id: id
          });
          return viewPage.render();
        });
      });
      router.on("route:usuarios", function(id) {
        return require(["views/usuario/listaView"], function(ViewPage) {
          var viewPage;
          viewPage = Vm.create(appView, "ListaUsuarioView", ViewPage);
          return viewPage.render();
        });
      });
      router.on("route:defaultAction", function() {
        return require(["views/login/loginView"], function(ViewPage) {
          var viewPage;
          viewPage = Vm.create(appView, "LoginView", ViewPage);
          return viewPage.render();
        });
      });
      return Backbone.history.start();
    };
    return {
      initialize: initialize
    };
  });

}).call(this);
