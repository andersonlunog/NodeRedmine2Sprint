redmine = require('../business/redmine')()
SprintModel = require('../models/sprint')

isLoggedIn = (req, res, next) ->
  if req.isAuthenticated()
    return next()
  res.redirect '/'
  return

module.exports = (app) ->
  app.get "/sprints", (req, res) ->
    SprintModel.find {}, (err, sprints) ->
      return res.status(400).send(err) if err
      res.send sprints

  app.get '/redmine/issue', (req, res) ->
    params = req.query
    redmine.getIssue(params.id, params.inicio, params.fim).then (issue) ->
      res.send issue
    , (err) ->
      res.status(400).send err

  app.get '/redmine/issues', (req, res) ->
    ret =
      issues: []
      issuesList: req.query.issues
      inicial: req.query.inicial
      final: req.query.final

    return res.render 'redmine.ejs', ret if not ret.issuesList

    issuesArr = ret.issuesList.split /[^\d]/

    promises = []

    issuesArr.forEach (issueID, i, arr)->
      return if not issueID
      promises.push redmine.getIssue issueID, ret.inicial, ret.final

    Promise.all(promises).then (issues) ->
      console.log "Resolveu as promessas.."
      ret.issues = issues
      res.render 'redmine.ejs', ret

    # redmine.getIssue issuesList, (data, status) ->
    #   res.render 'redmine.ejs', {issues: [data.issue], issuesList: issuesList}
    # , (err) ->
    #   res.render 'redmine.ejs', message: err  
  
  app.get "/sprint/:id", (req, res) ->
    SprintModel.find {_id: req.params.id}, (err, sprint) ->
      return res.status(400).send(err) if err
      return res.send(null) unless sprint.length
      res.send sprint[0]

  app.post "/sprint", (req, res) ->
    sprint = req.body
    newSprint = new SprintModel sprint
    newSprint.save (err)->
      if err
        console.log "Houve um erro ao salvar #{sprint.nome}"
        res.status(400).send err
      console.log "Sprint salva #{sprint.nome}"
      res.send newSprint
      
  return