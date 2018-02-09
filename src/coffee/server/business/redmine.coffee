# # load up the user model
# User = require('../models/user')
https = require "https"
environment = require('../config/environment')()
DateUtils = require "../utils/date"
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
# use this one for testing

module.exports = () ->

  getIssue: (issue, dtInicial, dtFinal) ->

    new Promise (resolve, reject) =>
        console.log "Fazendo a requisição da issue #{issue}..."
        auth = "Basic " + new Buffer(environment.redmine.user + ":" + environment.redmine.pass).toString("base64");
        req = https.request
          host: environment.redmine.host
          port: 443
          path: "/issues/#{issue}.json"
          method: "GET"
          headers: 
            "Content-Type": "application/json"
            "Authorization": auth

          # agent: false  # create a new agent just for this one request
        , (res) =>
          res.setEncoding "utf8"
          if res.statusCode != 200
            console.log "statusCode para issue #{issue}:", res.statusCode
            # callback? null, res.statusCode
            reject statusCode: res.statusCode

          res.on "data", (d) =>        
            obj = JSON.parse d
            console.log "Buscou #{obj.issue.id}"
            # console.log JSON.stringify obj, null, 2
            # callback? obj, 200
            @getTimeEntries(issue, dtInicial, dtFinal).then (times) ->
              obj.time_entries = times.time_entries
              resolve obj
            # process.stdout.write(obj);

          res.on "end", =>
            console.log "Acabou"


        req.on "error", (e) =>
          console.error e
          # error? e
          resolve e

        req.end()

  getTimeEntries: (issue, dtInicial, dtFinal) ->
    dateFilter = ""
    if dtInicial and dtFinal
      try
        dtIni = DateUtils.getDateToFilter dtInicial
        dtFim = DateUtils.getDateToFilter dtFinal
        dateFilter = "&spent_on=><#{dtIni}|#{dtFim}"
      catch e
        console.log "Não foi possível converter em data \"#{dtInicial}\" e/ou \"#{dtFinal}\"."
      

    new Promise (resolve, reject) ->
        console.log "Fazendo a requisição de tempo da issue #{issue}..."
        auth = "Basic " + new Buffer(environment.redmine.user + ":" + environment.redmine.pass).toString("base64");
        req = https.request
          host: environment.redmine.host
          port: 443
          path: "/time_entries.json?issue_id=#{issue}#{dateFilter}"
          method: "GET"
          headers: 
            "Content-Type": "application/json"
            "Authorization": auth

          # agent: false  # create a new agent just for this one request
        , (res) ->
          res.setEncoding "utf8"
          if res.statusCode != 200
            # console.log "statusCode para issue #{issue}:", res.statusCode
            # callback? null, res.statusCode
            reject statusCode: res.statusCode

          buffer = ""

          res.on "data", (data) => 
            buffer += data

          res.on "end", =>
            if buffer
              try
                obj = JSON.parse buffer
                resolve obj
              catch e
                resolve time_entries: {}
            # console.log "Chamou end..."


        req.on "error", (e) =>
          console.error e
          # error? e
          reject e

        req.end()