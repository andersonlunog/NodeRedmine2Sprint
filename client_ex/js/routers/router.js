var app = app || {};

(function () {
  'use strict';

  var TestCaseRouter = Backbone.Router.extend({
    routes: {
      // 'chamados/' : 'chamados',
      'new/:tipo' : 'newCase',
      'new/:tipo/:cid' : 'newCaseBasead',
      'new-below/:tipo/:cid' : 'newCaseBaseadBelow',
      'edit/:tipo/:cid' : 'editCase',
      'calcular/:tipo/:cid' : 'calcular',
      '*actions': 'defaultRoute'
    },

    views: {},

    defaultRoute: function (tipo) {
      if (!app.appView)
        new app.AppView();

      app.appView.setTipo(tipo || "parametros-calculo");
      app.appView.render();
    },

    newCase: function(tipo) {
      if(app.appView == null)
        window.location = "#"
      var view = this.views["newCase"] || (this.views["newCase"] = new app.TestCaseEditorView());
      view.tipo = tipo;
      view.model = null;
      view.render();
    },

    editCase: function(tipo, cid) {
      if(app.appView == null)
        window.location = "#"
      var view = this.views["newCase"] || (this.views["newCase"] = new app.TestCaseEditorView());
      view.tipo = tipo;
      view.model = app.appView.collection.get(cid);
      view.render();
    },

    newCaseBasead: function(tipo, cid) {
      if(app.appView == null)
        window.location = "#"
      var view = this.views["newCase"] || (this.views["newCase"] = new app.TestCaseEditorView());
      view.tipo = tipo;
      var obj = app.appView.collection.get(cid).toJSON();
      delete obj.id;
      view.model = new app.TestCaseModel(obj);
      view.render();
    },

    newCaseBaseadBelow: function(tipo, cid) {
      if(app.appView == null)
        window.location = "#"
      var view = this.views["newCase"] || (this.views["newCase"] = new app.TestCaseEditorView());
      view.tipo = tipo;
      var mdl = app.appView.collection.get(cid);
      var obj = mdl.toJSON();
      delete obj.id;
      view.model = new app.TestCaseModel(obj);
      view.addAt = app.appView.collection.indexOf(mdl) + 1;
      view.render();
    },

    calcular: function(tipo, cid) {
      if(app.appView == null)
        window.location = "#"
      var view = this.views["calculo"] || (this.views["calculo"] = new app.CalculoView());
      view.tipo = tipo;
      view.model = app.appView.collection.get(cid).toJSON();
      view.render();
    },
  });

  app.testCaseRouter = new TestCaseRouter();
  Backbone.history.start();
})();
