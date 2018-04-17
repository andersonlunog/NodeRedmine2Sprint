(function() {
  // # load up the user model
  // User = require('../models/user')
  var DateUtils, environment, https;

  https = require("https");

  environment = require('../config/environment')();

  DateUtils = require("../utils/date");

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  // use this one for testing
  module.exports = function() {
    return {
      getIssueTimeEntries: function(issue, dtInicial, dtFinal) {
        return this.getIssue(issue, (issueObj, promiseRes) => {
          var timeOptions;
          timeOptions = {
            issue: issue,
            dtInicial: dtInicial,
            dtFinal: dtFinal
          };
          return this.getTimeEntries(timeOptions).then(function(times) {
            issueObj.time_entries = times.time_entries;
            return promiseRes(issueObj);
          });
        });
      },
      getIssue: function(issue, callback) {
        return new Promise((resolve, reject) => {
          var auth, req;
          console.log(`Fazendo a requisição da issue ${issue}...`);
          auth = "Basic " + new Buffer(environment.redmine.user + ":" + environment.redmine.pass).toString("base64");
          req = https.request({
            host: environment.redmine.host,
            port: 443,
            path: `/issues.json?status_id=*&issue_id=${issue}`,
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": auth
            }
          }, (res) => {
            var buffer;
            res.setEncoding("utf8");
            if (res.statusCode !== 200) {
              console.log(`statusCode para issue ${issue}: ${res.statusCode}`);
              reject({
                statusCode: res.statusCode
              });
            }
            buffer = "";
            res.on("data", (data) => {
              return buffer += data;
            });
            return res.on("end", () => {
              var e, obj;
              if (buffer) {
                try {
                  obj = JSON.parse(buffer);
                  resolve(obj);
                } catch (error) {
                  e = error;
                  console.log(`Erro ao converter o objeto ${buffer}`);
                  console.log(e);
                  return resolve({
                    issue: {}
                  });
                }
              }
              if (obj.total_count === 0) {
                return console.log(`Não encontrou ${issue}`);
              } else {
                obj = {
                  issue: obj.issues[0]
                };
                console.log(`Encontrou ${obj.issue.id}`);
                if (callback != null) {
                  return callback(obj, resolve);
                } else {
                  return resolve(obj);
                }
              }
            });
          });
          req.on("error", (e) => {
            console.error("Ocorreu um erro ", e);
            return reject(e);
          });
          return req.end();
        });
      },
      /*
      opts:
        issue
        user
        dtInicial
        dtFinal
        callback(timeEntriesObj, promiseResolve)
      */
      getTimeEntries: function(opts) {
        var dtFim, dtIni, e, filters;
        filters = [];
        if (opts.issue) {
          filters.push(`issue_id=${opts.issue}`);
        }
        if (opts.user) {
          filters.push(`user_id=${opts.user}`);
        }
        if (opts.dtInicial && opts.dtFinal) {
          try {
            dtIni = DateUtils.getDateToFilter(opts.dtInicial);
            dtFim = DateUtils.getDateToFilter(opts.dtFinal);
            filters.push(`spent_on=><${dtIni}|${dtFim}`);
          } catch (error) {
            e = error;
            console.log(`Não foi possível converter em data "${opts.dtInicial}" e/ou "${opts.dtFinal}".`);
          }
        }
        return new Promise(function(resolve, reject) {
          var auth, params, req;
          params = filters.join("&");
          console.log(`Fazendo a requisição de tempo com os parâmetros ${params}...`);
          auth = "Basic " + new Buffer(environment.redmine.user + ":" + environment.redmine.pass).toString("base64");
          req = https.request({
            host: environment.redmine.host,
            port: 443,
            path: `/time_entries.json?${params}`,
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": auth
            }
          }, function(res) {
            var buffer;
            res.setEncoding("utf8");
            if (res.statusCode !== 200) {
              reject({
                statusCode: res.statusCode
              });
            }
            buffer = "";
            res.on("data", (data) => {
              return buffer += data;
            });
            return res.on("end", () => {
              var obj;
              if (buffer) {
                try {
                  obj = JSON.parse(buffer);
                  if (opts.callback != null) {
                    return opts.callback(obj, resolve);
                  } else {
                    return resolve(obj);
                  }
                } catch (error) {
                  e = error;
                  console.log(`Erro ao converter o objeto ${buffer}`);
                  console.log(e);
                  return resolve({
                    time_entries: {}
                  });
                }
              } else {
                return resolve({
                  time_entries: {}
                });
              }
            });
          });
          req.on("error", (e) => {
            console.error("Ocorreu um erro ", e);
            return reject(e);
          });
          return req.end();
        });
      },
      getUser: function(id) {
        return new Promise(function(resolve, reject) {
          var auth, req;
          console.log(`Fazendo a requisição de usuário ID ${id}...`);
          auth = "Basic " + new Buffer(environment.redmine.user + ":" + environment.redmine.pass).toString("base64");
          req = https.request({
            host: environment.redmine.host,
            port: 443,
            path: `/users/${id}.json`,
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": auth
            }
          }, function(res) {
            var buffer;
            res.setEncoding("utf8");
            if (res.statusCode !== 200) {
              console.log(`Usuário ${id} com status ${res.statusCode}!`);
              reject({
                statusCode: res.statusCode
              });
            }
            buffer = "";
            res.on("data", (data) => {
              return buffer += data;
            });
            return res.on("end", () => {
              var e, obj;
              if (buffer) {
                try {
                  obj = JSON.parse(buffer);
                  return resolve(obj);
                } catch (error) {
                  e = error;
                  console.log(`Erro ao converter o objeto ${buffer}`);
                  console.log(e);
                  return resolve({
                    user: {}
                  });
                }
              }
            });
          });
          req.on("error", (e) => {
            console.error("Ocorreu um erro ", e);
            return reject(e);
          });
          return req.end();
        });
      }
    };
  };

}).call(this);
