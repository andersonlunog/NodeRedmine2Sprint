(function() {
  define(function(require, exports, module) {
    var $, Backbone, _, __createIndexView, __createView, __unbindingSubViews, __unbindingView, app, createSubView, createView;
    _ = require("underscore");
    $ = require("jquery");
    Backbone = require("backbone");
    // ServiceUtil = require "helpers/serviceUtil"
    app = {};
    app.views = {};
    app.currentView = null;
    app.root = "/";
    // app.post = ServiceUtil.post
    Backbone.Events.on("view:index", function() {
      return app.createMainView("home", true);
    });
    app.createMainView = function(activeMenu, forceRecreate) {
      if (!app.views["index"] || forceRecreate) {
        return __createIndexView();
      } else {
        return app.indexView.menuView.setActiveMenu(activeMenu);
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
    Backbone.Events.on("view:sprintResultado", function(id) {
      return app.createView("sprintResultado", require("views/sprintResultadoView"), {
        sprintID: id
      });
    });
    Backbone.Events.on("view:importUsuariosRedmine", function() {
      return app.createView("importUsuariosRedmine", require("views/importUsuariosRedmineView"));
    });
    // app.createCalculoView = (id)-> createView "calculo.calculo", require("views/calculo/CalculoView"), calculoID: id
    createView = function(name, View, options = {}) {
      var view;
      __createIndexView();
      if (app.currentView != null) {
        __unbindingView(app.currentView);
      }
      view = __createView(name, View, options);
      return app.currentView = view;
    };
    createSubView = function(view, name, SubView, options = {}) {
      var subView, vName;
      if (view.subViews == null) {
        view.subViews = {};
      }
      vName = `${view.name}.${name}`;
      subView = __createView(vName, SubView, options);
      return view.subViews[vName] = subView;
    };
    __createIndexView = function() {
      var View, view;
      if (app.indexView == null) {
        View = require("views/index");
        view = new View;
        return app.indexView = view;
      }
    };
    __createView = function(name, View, options = {}) {
      var view;
      view = app.views[name];
      __unbindingView(view);
      view = new View(options);
      view.name = name;
      app.views[name] = view;
      return view;
    };
    __unbindingView = function(view) {
      if (view != null) {
        __unbindingSubViews(view);
        view.off();
        view.stopListening();
        view.undelegateEvents();
        if (typeof view.clean === "function") {
          view.clean();
        }
        view.$el.empty();
        return app.views[view.name] = void 0;
      }
    };
    __unbindingSubViews = function(view) {
      var name, ref, results, subView;
      if (_.isEmpty(view.subViews)) {
        return;
      }
      ref = view.subViews;
      results = [];
      for (name in ref) {
        subView = ref[name];
        results.push(__unbindingView(subView));
      }
      return results;
    };
    app.createView = createView;
    app.createSubView = createSubView;
    window.app = app;
    return module.exports = app;
  });

}).call(this);
