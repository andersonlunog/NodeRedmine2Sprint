(function() {
  var isLoggedIn, redmine;

  redmine = require('../business/redmine')();

  // route middleware to ensure user is logged in
  isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  };

  module.exports = function(app, passport) {
    app.get("/bkb", function(req, res) {
      return res.redirect("/index-bkb.html");
    });
    app.get('/', function(req, res) {
      res.render('index.ejs');
    });
    app.get('/profile', isLoggedIn, function(req, res) {
      res.render('profile.ejs', {
        user: req.user
      });
    });
    app.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
    });
    // =============================================================================
    // AUTHENTICATE (FIRST LOGIN) ==================================================
    // =============================================================================
    // locally --------------------------------
    // LOGIN ===============================
    // show the login form
    app.get('/login', function(req, res) {
      res.render('login.ejs', {
        message: req.flash('loginMessage')
      });
    });
    // process the login form
    app.post('/login', passport.authenticate('local-login', {
      successRedirect: '/profile',
      failureRedirect: '/login',
      failureFlash: true
    }));
    // SIGNUP =================================
    // show the signup form
    app.get('/signup', function(req, res) {
      res.render('signup.ejs', {
        message: req.flash('signupMessage')
      });
    });
    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
      successRedirect: '/profile',
      failureRedirect: '/signup',
      failureFlash: true
    }));
    // facebook -------------------------------
    // send to facebook to do the authentication
    app.get('/auth/facebook', passport.authenticate('facebook', {
      scope: ['public_profile', 'email']
    }));
    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));
    // google ---------------------------------
    // send to google to do the authentication
    app.get('/auth/google', passport.authenticate('google', {
      scope: ['profile', 'email']
    }));
    // the callback after google has authenticated the user
    app.get('/auth/google/callback', passport.authenticate('google', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));
    // =============================================================================
    // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
    // =============================================================================
    // locally --------------------------------
    app.get('/connect/local', function(req, res) {
      res.render('connect-local.ejs', {
        message: req.flash('loginMessage')
      });
    });
    app.post('/connect/local', passport.authenticate('local-signup', {
      successRedirect: '/profile',
      failureRedirect: '/connect/local',
      failureFlash: true
    }));
    // facebook -------------------------------
    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', {
      scope: ['public_profile', 'email']
    }));
    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback', passport.authorize('facebook', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));
    // google ---------------------------------
    // send to google to do the authentication
    app.get('/connect/google', passport.authorize('google', {
      scope: ['profile', 'email']
    }));
    // the callback after google has authorized the user
    app.get('/connect/google/callback', passport.authorize('google', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));
    // =============================================================================
    // UNLINK ACCOUNTS =============================================================
    // =============================================================================
    // used to unlink accounts. for social accounts, just remove the token
    // for local account, remove email and password
    // user account will stay active in case they want to reconnect in the future
    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
      var user;
      user = req.user;
      user.email = void 0;
      user.password = void 0;
      user.save(function(err) {
        res.redirect('/profile');
      });
    });
    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
      var user;
      user = req.user;
      user.facebook.token = void 0;
      user.save(function(err) {
        res.redirect('/profile');
      });
    });
    
    // google ---------------------------------
    app.get('/unlink/google', isLoggedIn, function(req, res) {
      var user;
      user = req.user;
      user.google.token = void 0;
      user.save(function(err) {
        res.redirect('/profile');
      });
    });
    // request para redmine ---------------------------------
    return app.get("/redmine/users", function(req, res) {
      var i, j, promises, results;
      promises = [];
      results = [];
      for (i = j = 0; j <= 100; i = ++j) {
        results.push(redmine.getUser(i).then(function(user) {
          return console.log(user);
        }));
      }
      return results;
    });
  };

  // app.get '/redmine/issues', (req, res) ->
//   ret =
//     issues: []
//     issuesList: req.query.issues
//     inicial: req.query.inicial
//     final: req.query.final

//   return res.render 'redmine.ejs', ret if not ret.issuesList

//   issuesArr = ret.issuesList.split /[^\d]/

//   promises = []

//   issuesArr.forEach (issueID, i, arr)->
//     return if not issueID
//     promises.push redmine.getIssue issueID, ret.inicial, ret.final

//   Promise.all(promises).then (issues) ->
//     console.log "Resolveu as promessas.."
//     ret.issues = issues
//     res.render 'redmine.ejs', ret

//   # redmine.getIssue issuesList, (data, status) ->
//   #   res.render 'redmine.ejs', {issues: [data.issue], issuesList: issuesList}
//   # , (err) ->
//   #   res.render 'redmine.ejs', message: err

// return

// ---
// generated by js2coffee 2.2.0

}).call(this);
