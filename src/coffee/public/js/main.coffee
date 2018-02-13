require ["config"], ->
  require ["app", "router"], (app, Router) ->
    app.router = new Router
    Backbone.history.start
      root: app.root