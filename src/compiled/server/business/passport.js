(function() {
  // load all the things we need
  var FacebookStrategy, GoogleStrategy, LocalStrategy, TwitterStrategy, User, environment;

  LocalStrategy = require('passport-local').Strategy;

  FacebookStrategy = require('passport-facebook').Strategy;

  TwitterStrategy = require('passport-twitter').Strategy;

  GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

  // load up the user model
  User = require('../models/user');

  // load the auth variables
  environment = require('../config/environment')();

  // use this one for testing
  module.exports = function(passport) {
    var fbStrategy;
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });
    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
      User.findById(id, function(err, user) {
        done(err, user);
      });
    });
    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    }, function(req, email, password, done) {
      if (email) {
        email = email.toLowerCase();
      }
      // Use lower-case e-mails to avoid case-sensitive e-mail matching
      // asynchronous
      process.nextTick(function() {
        User.findOne({
          'email': email
        }, function(err, user) {
          // if there are any errors, return the error
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false, req.flash('loginMessage', 'No user found.'));
          }
          if (!user.validPassword(password)) {
            return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
          } else {
            return done(null, user);
          }
        });
      });
    }));
    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // ========================================================================= 
    passport.use('local-signup', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    }, function(req, email, password, done) {
      if (email) {
        email = email.toLowerCase();
      }
      // Use lower-case e-mails to avoid case-sensitive e-mail matching
      // asynchronous
      process.nextTick(function() {
        if (!req.user) {
          User.findOne({
            'email': email
          }, function(err, user) {
            var newUser;
            // if there are any errors, return the error
            if (err) {
              return done(err);
            }
            // check to see if theres already a user with that email
            if (user) {
              return done(null, false, req.flash('signupMessage', 'E-mail já cadastrado.'));
            } else {
              // create the user
              newUser = new User;
              newUser.email = email;
              newUser.password = newUser.generateHash(password);
              newUser.save(function(err) {
                if (err) {
                  return done(err);
                }
                return done(null, newUser);
              });
            }
          });
        } else if (!req.user.email) {
          // ...presumably they're trying to connect a local account
          // BUT let's check if the email used to connect a local account is being used by another user
          User.findOne({
            'email': email
          }, function(err, user) {
            var user;
            if (err) {
              return done(err);
            }
            if (user) {
              return done(null, false, req.flash('loginMessage', 'E-mail já cadastrado.'));
            } else {
              // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
              user = req.user;
              user.email = email;
              user.password = user.generateHash(password);
              user.save(function(err) {
                if (err) {
                  return done(err);
                }
                return done(null, user);
              });
            }
          });
        } else {
          // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
          return done(null, req.user);
        }
      });
    }));
    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    fbStrategy = environment.facebookAuth;
    fbStrategy.passReqToCallback = true;
    // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    passport.use(new FacebookStrategy(fbStrategy, function(req, token, refreshToken, profile, done) {
      // console.log JS/ON.stringify(profile)
      // asynchronous
      process.nextTick(function() {
        var user;
        if (!req.user) {
          User.findOne({
            'facebook.id': profile.id
          }, function(err, user) {
            if (err) {
              return done(err);
            }
            if (user) {
              if (!user.facebook.token) {
                user.facebook.token = token;
                user.name = profile.name.givenName + ' ' + profile.name.familyName;
                user.email = (profile.emails[0].value || '').toLowerCase();
                user.save(function(err) {
                  if (err) {
                    return done(err);
                  }
                  return done(null, user);
                });
              }
              return done(null, user);
            } else {
              // user found, return that user
              User.findOne({
                'email': profile.emails[0].value
              }, function(err, user) {
                var newUser;
                // if there are any errors, return the error
                if (err) {
                  return done(err);
                }
                // check to see if theres already a user with that email
                if (user) {
                  user.facebook.id = profile.id;
                  user.facebook.token = token;
                  if (!user.name) {
                    user.name = profile.name.givenName + ' ' + profile.name.familyName;
                  }
                  user.email = profile.emails[0].value;
                  user.save(function(err) {
                    if (err) {
                      return done(err);
                    }
                    return done(null, user);
                  });
                  return done(null, user);
                } else {
                  // if there is no user, create them
                  newUser = new User;
                  newUser.facebook.id = profile.id;
                  newUser.facebook.token = token;
                  newUser.name = profile.name.givenName + ' ' + profile.name.familyName;
                  newUser.email = (profile.emails[0].value || '').toLowerCase();
                  newUser.save(function(err) {
                    if (err) {
                      return done(err);
                    }
                    return done(null, newUser);
                  });
                }
              });
            }
          });
        } else {
          // user already exists and is logged in, we have to link accounts
          user = req.user;
          // pull the user out of the session
          user.facebook.id = profile.id;
          user.facebook.token = token;
          if (!user.name) {
            user.name = profile.name.givenName + ' ' + profile.name.familyName;
          }
          user.facebook.email = (profile.emails[0].value || '').toLowerCase();
          user.save(function(err) {
            if (err) {
              return done(err);
            }
            return done(null, user);
          });
        }
      });
    }));
    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({
      clientID: environment.googleAuth.clientID,
      clientSecret: environment.googleAuth.clientSecret,
      callbackURL: environment.googleAuth.callbackURL,
      passReqToCallback: true
    }, function(req, token, refreshToken, profile, done) {
      // asynchronous
      process.nextTick(function() {
        var user;
        if (!req.user) {
          User.findOne({
            'google.id': profile.id
          }, function(err, user) {
            var newUser;
            if (err) {
              return done(err);
            }
            if (user) {
              if (!user.google.token) {
                user.google.token = token;
                user.google.name = profile.displayName;
                user.google.email = (profile.emails[0].value || '').toLowerCase();
                // pull the first email
                user.save(function(err) {
                  if (err) {
                    return done(err);
                  }
                  return done(null, user);
                });
              }
              return done(null, user);
            } else {
              newUser = new User;
              newUser.google.id = profile.id;
              newUser.google.token = token;
              newUser.google.name = profile.displayName;
              newUser.google.email = (profile.emails[0].value || '').toLowerCase();
              // pull the first email
              newUser.save(function(err) {
                if (err) {
                  return done(err);
                }
                return done(null, newUser);
              });
            }
          });
        } else {
          // user already exists and is logged in, we have to link accounts
          user = req.user;
          // pull the user out of the session
          user.google.id = profile.id;
          user.google.token = token;
          user.google.name = profile.displayName;
          user.google.email = (profile.emails[0].value || '').toLowerCase();
          // pull the first email
          user.save(function(err) {
            if (err) {
              return done(err);
            }
            return done(null, user);
          });
        }
      });
    }));
  };

  // ---
// generated by js2coffee 2.2.0

}).call(this);
