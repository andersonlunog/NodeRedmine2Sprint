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
      getIssue: function(issue, dtInicial, dtFinal) {
        return new Promise((resolve, reject) => {
          var auth, req;
          console.log(`Fazendo a requisição da issue ${issue}...`);
          auth = "Basic " + new Buffer(environment.redmine.user + ":" + environment.redmine.pass).toString("base64");
          req = https.request({
            host: environment.redmine.host,
            port: 443,
            path: `/issues.json?issue_id=${issue}`,
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": auth
            }
          }, (res) => {
            res.setEncoding("utf8");
            if (res.statusCode !== 200) {
              console.log(`statusCode para issue ${issue}: ${res.statusCode}`);
              reject({
                statusCode: res.statusCode
              });
            }
            res.on("data", (d) => {
              var obj;
              obj = JSON.parse(d);
              if (obj.total_count === 0) {
                return console.log(`Não encontrou ${issue}`);
              } else {
                obj = {
                  issue: obj.issues[0]
                };
                console.log(`Encontrou ${obj.issue.id}`);
                return this.getTimeEntries(issue, dtInicial, dtFinal).then(function(times) {
                  obj.time_entries = times.time_entries;
                  return resolve(obj);
                });
              }
            });
            return res.on("end", () => {
              return console.log("Acabou");
            });
          });
          req.on("error", (e) => {
            console.error("Ocorreu um erro ", e);
            return reject(e);
          });
          return req.end();
        });
      },
      getTimeEntries: function(issue, dtInicial, dtFinal) {
        var dateFilter, dtFim, dtIni, e;
        dateFilter = "";
        if (dtInicial && dtFinal) {
          try {
            dtIni = DateUtils.getDateToFilter(dtInicial);
            dtFim = DateUtils.getDateToFilter(dtFinal);
            dateFilter = `&spent_on=><${dtIni}|${dtFim}`;
          } catch (error) {
            e = error;
            console.log(`Não foi possível converter em data "${dtInicial}" e/ou "${dtFinal}".`);
          }
        }
        return new Promise(function(resolve, reject) {
          var auth, req;
          console.log(`Fazendo a requisição de tempo da issue ${issue}...`);
          auth = "Basic " + new Buffer(environment.redmine.user + ":" + environment.redmine.pass).toString("base64");
          req = https.request({
            host: environment.redmine.host,
            port: 443,
            path: `/time_entries.json?issue_id=${issue}${dateFilter}`,
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
                  return resolve(obj);
                } catch (error) {
                  e = error;
                  return resolve({
                    time_entries: {}
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
