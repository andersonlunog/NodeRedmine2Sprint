(function() {
  var EquipeModel, SprintModel, SprintResultModel, isLoggedIn, redmine;

  redmine = require('../business/redmine')();

  SprintModel = require('../models/sprint');

  EquipeModel = require('../models/equipe');

  SprintResultModel = require('../models/sprintResult');

  isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  };

  module.exports = function(app) {
    app.get('/redmine/issuetime', function(req, res) {
      var params;
      params = req.query;
      return redmine.getIssueTimeEntries(params.id, params.inicio, params.fim).then(function(issue) {
        return res.send(issue);
      }, function(err) {
        return res.status(400).send(err);
      });
    });
    app.get('/redmine/issue', function(req, res) {
      var params;
      params = req.query;
      return redmine.getIssue(params.id).then(function(issue) {
        return res.send(issue);
      }, function(err) {
        return res.status(400).send(err);
      });
    });
    app.get('/redmine/issues', function(req, res) {
      var issuesArr, promises, ret;
      ret = {
        issues: [],
        issuesList: req.query.issues,
        inicial: req.query.inicial,
        final: req.query.final
      };
      if (!ret.issuesList) {
        return res.render('redmine.ejs', ret);
      }
      issuesArr = ret.issuesList.split(/[^\d]/);
      promises = [];
      issuesArr.forEach(function(issueID, i, arr) {
        if (!issueID) {
          return;
        }
        return promises.push(redmine.getIssueTimeEntries(issueID, ret.inicial, ret.final));
      });
      return Promise.all(promises).then(function(issues) {
        console.log("Resolveu as promessas..");
        ret.issues = issues;
        return res.render('redmine.ejs', ret);
      });
    });
    // redmine.getIssueTimeEntries issuesList, (data, status) ->
    //   res.render 'redmine.ejs', {issues: [data.issue], issuesList: issuesList}
    // , (err) ->
    //   res.render 'redmine.ejs', message: err  

    //### SPRINT
    app.get("/sprints", function(req, res) {
      return SprintModel.find({}).populate("equipeID", "nome").select("nome inicio fim equipeID").exec(function(err, sprints) {
        if (err) {
          return res.status(400).send(err);
        }
        return res.send(sprints);
      });
    });
    app.get("/sprint/:id", function(req, res) {
      return SprintModel.findById(req.params.id, function(err, sprint) {
        if (err) {
          return res.status(400).send(err);
        }
        return res.send(sprint || {});
      });
    });
    app.post("/sprint", function(req, res) {
      var newSprint, sprint;
      sprint = req.body;
      newSprint = new SprintModel(sprint);
      return newSprint.save(function(err) {
        if (err) {
          console.log(`Houve um erro ao salvar ${sprint.nome}`);
          res.status(400).send(err);
        }
        console.log(`Sprint salva ${sprint.nome}`);
        return res.send(newSprint);
      });
    });
    app.put("/sprint/:id", function(req, res) {
      return SprintModel.findById(req.params.id, function(err, sprint) {
        if (err) {
          return res.status(400).send(err);
        }
        sprint.set(req.body);
        return sprint.save(function(err, uSprint) {
          if (err) {
            console.log(`Houve um erro ao atualizar ${sprint.nome}`);
            res.status(400).send(err);
          }
          console.log(`Sprint atualizada ${sprint.nome}`);
          return res.send(uSprint);
        });
      });
    });
    //### SPRINT RESULT
    app.get("/sprintResult/:id", function(req, res) {
      return SprintResultModel.findById(req.params.id, function(err, sprintResult) {
        if (err) {
          return res.status(400).send(err);
        }
        return res.send(sprintResult || {});
      });
    });
    app.put("/sprintResult/:id", function(req, res) {
      return SprintResultModel.findById(req.params.id, function(err, sprint) {
        if (err) {
          return res.status(400).send(err);
        }
        if (sprint != null) {
          sprint.set(req.body);
        } else {
          sprint = new SprintResultModel(req.body);
        }
        return sprint.save(function(err, uSprint) {
          if (err) {
            console.log(`Houve um erro ao atualizar resultado da sprint ${req.params.id}`);
            res.status(400).send(err);
          }
          console.log(`Resultado da sprint atualizada ${req.params.id}`);
          return res.send(uSprint);
        });
      });
    });
    // app.put "/sprint/:id", (req, res) ->
    //   SprintModel.findById req.params.id, (err, sprint) ->
    //     return res.status(400).send(err) if err
    //     sprint.set req.body
    //     sprint.save (err, uSprint)->
    //       if err
    //         console.log "Houve um erro ao atualizar #{sprint.nome}"
    //         res.status(400).send err
    //       console.log "Sprint atualizada #{sprint.nome}"
    //       res.send uSprint
    app.get("/timeentries", function(req, res) {
      var opts;
      opts = {
        user: req.query.user,
        dtInicial: req.query.inicio,
        dtFinal: req.query.fim
      };
      return redmine.getTimeEntries(opts).then(function(timeEntries) {
        console.log("Resolveu as promessas entries..");
        return res.send(timeEntries);
      });
    });
  };

}).call(this);
