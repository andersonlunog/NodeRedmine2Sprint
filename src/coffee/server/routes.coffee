redmine = require('./business/redmine')()
# route middleware to ensure user is logged in

isLoggedIn = (req, res, next) ->
  if req.isAuthenticated()
    return next()
  res.redirect '/'
  return

module.exports = (app, passport) ->
  # normal routes ===============================================================
  # show the home page (will also have our login links)
  app.get '/', (req, res) ->
    res.render 'index.ejs'
    return
  # PROFILE SECTION =========================
  app.get '/profile', isLoggedIn, (req, res) ->
    res.render 'profile.ejs', user: req.user
    return
  # LOGOUT ==============================
  app.get '/logout', (req, res) ->
    req.logout()
    res.redirect '/'
    return
  # =============================================================================
  # AUTHENTICATE (FIRST LOGIN) ==================================================
  # =============================================================================
  # locally --------------------------------
  # LOGIN ===============================
  # show the login form
  app.get '/login', (req, res) ->
    res.render 'login.ejs', message: req.flash('loginMessage')
    return
  # process the login form
  app.post '/login', passport.authenticate('local-login',
    successRedirect: '/profile'
    failureRedirect: '/login'
    failureFlash: true)
  # SIGNUP =================================
  # show the signup form
  app.get '/signup', (req, res) ->
    res.render 'signup.ejs', message: req.flash('signupMessage')
    return
  # process the signup form
  app.post '/signup', passport.authenticate('local-signup',
    successRedirect: '/profile'
    failureRedirect: '/signup'
    failureFlash: true)
  # facebook -------------------------------
  # send to facebook to do the authentication
  app.get '/auth/facebook', passport.authenticate('facebook', scope: [
    'public_profile'
    'email'
  ])
  # handle the callback after facebook has authenticated the user
  app.get '/auth/facebook/callback', passport.authenticate('facebook',
    successRedirect: '/profile'
    failureRedirect: '/')
  # google ---------------------------------
  # send to google to do the authentication
  app.get '/auth/google', passport.authenticate('google', scope: [
    'profile'
    'email'
  ])
  # the callback after google has authenticated the user
  app.get '/auth/google/callback', passport.authenticate('google',
    successRedirect: '/profile'
    failureRedirect: '/')
  # =============================================================================
  # AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
  # =============================================================================
  # locally --------------------------------
  app.get '/connect/local', (req, res) ->
    res.render 'connect-local.ejs', message: req.flash('loginMessage')
    return
  app.post '/connect/local', passport.authenticate('local-signup',
    successRedirect: '/profile'
    failureRedirect: '/connect/local'
    failureFlash: true)
  # facebook -------------------------------
  # send to facebook to do the authentication
  app.get '/connect/facebook', passport.authorize('facebook', scope: [
    'public_profile'
    'email'
  ])
  # handle the callback after facebook has authorized the user
  app.get '/connect/facebook/callback', passport.authorize('facebook',
    successRedirect: '/profile'
    failureRedirect: '/')
  # google ---------------------------------
  # send to google to do the authentication
  app.get '/connect/google', passport.authorize('google', scope: [
    'profile'
    'email'
  ])
  # the callback after google has authorized the user
  app.get '/connect/google/callback', passport.authorize('google',
    successRedirect: '/profile'
    failureRedirect: '/')
  # =============================================================================
  # UNLINK ACCOUNTS =============================================================
  # =============================================================================
  # used to unlink accounts. for social accounts, just remove the token
  # for local account, remove email and password
  # user account will stay active in case they want to reconnect in the future
  # local -----------------------------------
  app.get '/unlink/local', isLoggedIn, (req, res) ->
    user = req.user
    user.email = undefined
    user.password = undefined
    user.save (err) ->
      res.redirect '/profile'
      return
    return
  # facebook -------------------------------
  app.get '/unlink/facebook', isLoggedIn, (req, res) ->
    user = req.user
    user.facebook.token = undefined
    user.save (err) ->
      res.redirect '/profile'
      return
    return
  # google ---------------------------------
  app.get '/unlink/google', isLoggedIn, (req, res) ->
    user = req.user
    user.google.token = undefined
    user.save (err) ->
      res.redirect '/profile'
      return
    return

  # request para redmine ---------------------------------
  app.get '/redmine', (req, res) ->
    res.render 'redmine.ejs', message: req.flash('redmineMessage')

  app.get '/redmine/issues', (req, res) ->
    issuesList = req.query.issues

    return res.render 'redmine.ejs', {issues: [], issuesList: issuesList} if not issuesList

    issuesArr = issuesList.split /[^\d]/

    redmine.getIssue issuesList, (data, status) ->
      res.render 'redmine.ejs', {issues: [data.issue], issuesList: issuesList}
    , (err) ->
      res.render 'redmine.ejs', message: err
      
  return

# ---
# generated by js2coffee 2.2.0