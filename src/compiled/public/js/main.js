(function() {
  require(["config"], function() {
    return require(["app", "router"], function(app, Router) {
      app.router = new Router;
      return Backbone.history.start({
        root: app.root
      });
    });
  });

}).call(this);
