(function() {
  define(function(require, exports, module) {
    var $, Backbone, _, __createView, app, createView;
    _ = require("underscore");
    $ = require("jquery");
    Backbone = require("backbone");
    // ServiceUtil = require "helpers/serviceUtil"
    app = {};
    app.views = {};
    app.root = "/";
    // app.post = ServiceUtil.post
    Backbone.Events.on("view:index", function() {
      return app.createMainView("home", true);
    });
    app.createMainView = function(activeMenu, forceRecreate) {
      if (!app.views["index"] || forceRecreate) {
        return __createView("index", require("views/index"), {
          activeMenu: activeMenu
        });
      } else {
        return app.views["index"].menuView.setActiveMenu(activeMenu);
      }
    };
    Backbone.Events.on("view:sprintLista", function() {
      return app.createView("sprintLista", require("views/sprintListaView"));
    });
    Backbone.Events.on("view:sprintCadastro", function(id) {
      return app.createView("sprintCadastro", require("views/sprintCadastroView"), {
        sprintID: id
      });
    });
    Backbone.Events.on("view:importarUsuarios", function() {
      return app.createView("importarUsuarios", require("views/importarUsuariosView"));
    });
    // app.createCalculoView = (id)-> createView "calculo.calculo", require("views/calculo/CalculoView"), calculoID: id
    createView = function(name, View, options = {}) {
      if (!app.loaded) {
        app.loaded = true;
        __createView("index", require("views/index"), {
          activeMenu: "home"
        });
      }
      return __createView(name, View, options);
    };
    __createView = function(name, View, options = {}) {
      var view;
      view = app.views[name];
      if (view != null) {
        view.off();
        view.stopListening();
        if (typeof view.clean === "function") {
          view.clean();
        }
      }
      view = new View(options);
      return app.views[name] = view;
    };
    app.createView = createView;
    window.app = app;
    return module.exports = app;
  });

}).call(this);
