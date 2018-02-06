(function() {
  require.config({
    paths: {
      jquery: "libs/jquery/jquery.min",
      backbone: "libs/backbone/backbone",
      bootstrap: "libs/bootstrap/bootstrap.min",
      underscore: "libs/underscore/underscore",
      text: "libs/require/text",
      templates: "../templates",
      model: "models/baseModel",
      collection: "models/baseCollection",
      utils: "mylibs/utils"
    }
  });

  require(["views/app", "router", "vm"], function(AppView, Router, Vm) {
    var appView;
    appView = Vm.create({}, "AppView", AppView);
    appView.render();
    return Router.initialize({
      appView: appView
    });
  });

}).call(this);
