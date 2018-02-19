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
        , (res) =>
          res.setEncoding "utf8"
          if res.statusCode != 200
            console.log "statusCode para issue #{issue}: #{res.statusCode}"
            reject statusCode: res.statusCode

          res.on "data", (d) =>        
            obj = JSON.parse d
            console.log "Encontrou #{obj.issue.id}"
            @getTimeEntries(issue, dtInicial, dtFinal).then (times) ->
              obj.time_entries = times.time_entries
              resolve obj

          res.on "end", =>
            console.log "Acabou"


        req.on "error", (e) =>
          console.error "Ocorreu um erro ", e
          reject e

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
        , (res) ->
          res.setEncoding "utf8"
          if res.statusCode != 200
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


        req.on "error", (e) =>
          console.error "Ocorreu um erro ", e
          reject e

        req.end()

  getUser: (id) ->
    new Promise (resolve, reject) ->
        console.log "Fazendo a requisição de usuário ID #{id}..."
        auth = "Basic " + new Buffer(environment.redmine.user + ":" + environment.redmine.pass).toString("base64");
        req = https.request
          host: environment.redmine.host
          port: 443
          path: "/users/#{id}.json"
          method: "GET"
          headers: 
            "Content-Type": "application/json"
            "Authorization": auth
        , (res) ->
          res.setEncoding "utf8"
          if res.statusCode != 200
            console.log "Usuário #{id} com status #{res.statusCode}!"
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
                resolve user: {}

        req.on "error", (e) =>
          console.error "Ocorreu um erro ", e
          reject e

        req.end()