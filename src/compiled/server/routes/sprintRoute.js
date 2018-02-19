(function() {
  var SprintModel, isLoggedIn, redmine;

  redmine = require('../business/redmine')();

  SprintModel = require('../models/sprint');

  isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  };

  module.exports = function(app) {
    app.get("/sprints", function(req, res) {
      return SprintModel.find({}, function(err, sprints) {
        if (err) {
          return res.status(400).send(err);
        }
        return res.send(sprints);
      });
    });
    app.get('/redmine/issue', function(req, res) {
      var params;
      params = req.query;
      return redmine.getIssue(params.id, params.inicio, params.fim).then(function(issue) {
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
        return promises.push(redmine.getIssue(issueID, ret.inicial, ret.final));
      });
      return Promise.all(promises).then(function(issues) {
        console.log("Resolveu as promessas..");
        ret.issues = issues;
        return res.render('redmine.ejs', ret);
      });
    });
    // redmine.getIssue issuesList, (data, status) ->
    //   res.render 'redmine.ejs', {issues: [data.issue], issuesList: issuesList}
    // , (err) ->
    //   res.render 'redmine.ejs', message: err  
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
  };

}).call(this);
