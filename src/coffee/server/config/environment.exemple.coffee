module.exports = (pEnvironment) ->
  amb =
    development:
      dbHost: "localhost"
      dbName: "passportDB"
      mailSettings:
        send: false
        user: ""
        pass: ""
      url: "localhost:5000"
      redmine:
        user: "redmine_user"
        pass: "redmine_password"
        host: "company.redmineup.com"
      facebookAuth:
        clientID: "9999999999999999"
        clientSecret: "99999999999999999999999999999999"
        callbackURL: "http://localhost:8080/auth/facebook/callback"
        profileFields: [
          "id"
          "email"
          "name"
        ]
      googleAuth:
        clientID: "your-secret-clientID-here"
        clientSecret: "your-client-secret-here"
        callbackURL: "http://localhost:8080/auth/google/callback"

    test: {}

    production: {}

  amb[pEnvironment or process.env.NODE_ENV or "development"]