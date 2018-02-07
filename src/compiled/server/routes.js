(function() {
  var isLoggedIn, redmine;

  redmine = require('./business/redmine')();

  // route middleware to ensure user is logged in
  isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  };

  module.exports = function(app, passport) {
    // normal routes ===============================================================
    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
      res.render('index.ejs');
    });
    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
      res.render('profile.ejs', {
        user: req.user
      });
    });
    // LOGOUT ==============================
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
    app.get('/redmine/issue', function(req, res) {
      return redmine.getIssue(req.query.issue).then(function(issue) {
        return req.response(issue);
      });
    });
    app.get('/redmine/issues', function(req, res) {
      var issuesArr, issuesList, promises;
      issuesList = req.query.issues;
      if (!issuesList) {
        return res.render('redmine.ejs', {
          issues: [],
          issuesList: issuesList
        });
      }
      issuesArr = issuesList.split(/[^\d]/);
      promises = [];
      issuesArr.forEach(function(issueID, i, arr) {
        if (!issueID) {
          return;
        }
        return promises.push(redmine.getIssue(issueID));
      });
      return Promise.all(promises).then(function(issues) {
        console.log("Resolveu as promessas..");
        return res.render('redmine.ejs', {
          issues: issues,
          issuesList: issuesList
        });
      });
    });
  };

  // ---
  // generated by js2coffee 2.2.0
  // redmine.getIssue issuesList, (data, status) ->
//   res.render 'redmine.ejs', {issues: [data.issue], issuesList: issuesList}
// , (err) ->
//   res.render 'redmine.ejs', message: err

}).call(this);
