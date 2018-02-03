(function() {
  module.exports = function(pEnvironment) {
    var amb;
    amb = {
      development: {
        database: {
          host: "localhost",
          name: "passportDB"
        },
        mailSettings: {
          send: false,
          user: "",
          pass: ""
        },
        url: "localhost:5000",
        redmine: {
          user: "redmine_user",
          pass: "redmine_password",
          host: "company.redmineup.com"
        },
        facebookAuth: {
          clientID: "9999999999999999",
          clientSecret: "99999999999999999999999999999999",
          callbackURL: "http://localhost:8080/auth/facebook/callback",
          profileFields: ["id", "email", "name"]
        },
        googleAuth: {
          clientID: "your-secret-clientID-here",
          clientSecret: "your-client-secret-here",
          callbackURL: "http://localhost:8080/auth/google/callback"
        }
      },
      test: {},
      production: {}
    };
    return amb[pEnvironment || process.env.NODE_ENV || "development"];
  };

}).call(this);
