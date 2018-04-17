# # load up the user model
# User = require('../models/user')
https = require "https"
environment = require('../config/environment')()
DateUtils = require "../utils/date"
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
# use this one for testing

module.exports = () ->

  getIssueTimeEntries: (issue, dtInicial, dtFinal) ->
    @getIssue issue, (issueObj, promiseRes)=>
      timeOptions = 
        issue: issue
        dtInicial: dtInicial
        dtFinal: dtFinal
      @getTimeEntries(timeOptions).then (times) ->
        issueObj.time_entries = times.time_entries
        promiseRes issueObj

  getIssue: (issue, callback) ->
    new Promise (resolve, reject) =>
        console.log "Fazendo a requisição da issue #{issue}..."
        auth = "Basic " + new Buffer(environment.redmine.user + ":" + environment.redmine.pass).toString("base64");
        req = https.request
          host: environment.redmine.host
          port: 443
          path: "/issues.json?status_id=*&issue_id=#{issue}"
          method: "GET"
          headers: 
            "Content-Type": "application/json"
            "Authorization": auth
        , (res) =>
          res.setEncoding "utf8"
          if res.statusCode != 200
            console.log "statusCode para issue #{issue}: #{res.statusCode}"
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
                console.log "Erro ao converter o objeto #{buffer}"
                console.log e
                return resolve issue: {}

            if obj.total_count is 0
              console.log "Não encontrou #{issue}"
            else
              obj = issue: obj.issues[0]
              console.log "Encontrou #{obj.issue.id}"
              if callback?
                callback obj, resolve
              else
                resolve obj

        req.on "error", (e) =>
          console.error "Ocorreu um erro ", e
          reject e

        req.end()

  ###
  opts:
    issue
    user
    dtInicial
    dtFinal
    callback(timeEntriesObj, promiseResolve)
  ###
  getTimeEntries: (opts) ->
    filters = []
    filters.push "issue_id=#{opts.issue}" if opts.issue
    filters.push "user_id=#{opts.user}" if opts.user
    if opts.dtInicial and opts.dtFinal
      try
        dtIni = DateUtils.getDateToFilter opts.dtInicial
        dtFim = DateUtils.getDateToFilter opts.dtFinal
        filters.push "spent_on=><#{dtIni}|#{dtFim}"
      catch e
        console.log "Não foi possível converter em data \"#{opts.dtInicial}\" e/ou \"#{opts.dtFinal}\"."

    new Promise (resolve, reject) ->
      params = filters.join "&"
      console.log "Fazendo a requisição de tempo com os parâmetros #{params}..."
      auth = "Basic " + new Buffer(environment.redmine.user + ":" + environment.redmine.pass).toString("base64");
      req = https.request
        host: environment.redmine.host
        port: 443
        path: "/time_entries.json?#{params}"
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
              if opts.callback?
                opts.callback obj, resolve
              else
                resolve obj
            catch e
              console.log "Erro ao converter o objeto #{buffer}"
              console.log e
              return resolve time_entries: {}
          else
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
                console.log "Erro ao converter o objeto #{buffer}"
                console.log e
                return resolve user: {}

        req.on "error", (e) =>
          console.error "Ocorreu um erro ", e
          reject e

        req.end()