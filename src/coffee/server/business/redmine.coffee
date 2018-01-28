# # load up the user model
# User = require('../models/user')
https = require "https"
environment = require('../config/environment')()
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
# use this one for testing

module.exports = () ->
  getIssue: (callback, error) ->
    console.log "Fazendo a requisição..."
    auth = 'Basic ' + new Buffer(environment.redmine.user + ':' + environment.redmine.pass).toString('base64');
    redmineReq = https.request
      host: environment.redmine.host
      port: 443
      path: '/issues/12218.json'
      method: 'GET'
      headers: 
        'Content-Type': 'application/json'
        "Authorization": auth

      # agent: false  # create a new agent just for this one request
    , (redmineRes) =>
      redmineRes.setEncoding "utf8"
      if redmineRes.statusCode != 200
        console.log "statusCode:", redmineRes.statusCode
        console.log "headers:", redmineRes.headers
        callback? null, redmineRes.statusCode

      redmineRes.on "data", (d) =>        
        obj = JSON.parse d
        console.log obj.issue.id
        console.log JSON.stringify obj, null, 2
        callback? obj, 200
        # process.stdout.write(obj);

      redmineRes.on "end", =>
        console.log "Acabou"


    redmineReq.on "error", (e) =>
      console.error e
      error? e

    redmineReq.end()
    return
