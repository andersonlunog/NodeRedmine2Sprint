isLoggedIn = (req, res, next) ->
  if req.isAuthenticated()
    return next()
  res.redirect '/'
  return

module.exports = (app) ->
  app.get "/sprints", (req, res) ->
    res.send [{nome: "teste", inicio: new Date(), fim: new Date()}]
  return