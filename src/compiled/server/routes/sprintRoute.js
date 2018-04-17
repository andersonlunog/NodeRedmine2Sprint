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
    app.get("/sprint/:id", function(req, res) {
      return SprintModel.find({
        _id: req.params.id
      }, function(err, sprint) {
        if (err) {
          return res.status(400).send(err);
        }
        if (!sprint.length) {
          return res.send(null);
        }
        return res.send(sprint[0]);
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
    app.get("/timeentries", function(req, res) {
      var opts;
      // SprintModel.find {_id: req.params.sprintID}, (err, sprints) ->
      //   return res.status(400).send(err) if err
      //   return res.send(null) unless sprints.length
      //   sprint = sprints[0]

      // promises = []
      opts = {
        user: req.query.user,
        dtInicial: req.query.inicio,
        dtFinal: req.query.fim
      };
      // callback: (timeEntriesObj, promiseResolve)->
      //   issuePromisses = []
      //   timeEntriesObj.time_entries.forEach (timeEntries) ->
      //     issuePromisses.push redmine.getIssue(timeEntries.issue.id)
      //   Promise.all(issuePromisses).then (issues)->
      //     console.log "Resolveu as promessas issue.."
      //     timeEntriesObj.time_entries.forEach (timeEntries, j) ->                
      //       timeEntriesObj.time_entries[j].issue = issues[j];
      //     promiseResolve(timeEntriesObj)

      // promises.push redmine.getTimeEntries opts
      return redmine.getTimeEntries(opts).then(function(timeEntries) {
        console.log("Resolveu as promessas entries..");
        return res.send(timeEntries);
      });
    });
  };

  // Promise.all(promises).then (timeEntries) ->
//   console.log "Resolveu as promessas entries.."
//   res.send timeEntries

}).call(this);
