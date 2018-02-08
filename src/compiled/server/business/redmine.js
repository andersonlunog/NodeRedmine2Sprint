(function() {
  // # load up the user model
  // User = require('../models/user')
  var environment, https;

  https = require("https");

  environment = require('../config/environment')();

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
            path: `/issues/${issue}.json`,
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": auth
            }
          // agent: false  # create a new agent just for this one request
          }, (res) => {
            res.setEncoding("utf8");
            if (res.statusCode !== 200) {
              console.log(`statusCode para issue ${issue}:`, res.statusCode);
              // callback? null, res.statusCode
              reject({
                statusCode: res.statusCode
              });
            }
            res.on("data", (d) => {
              var obj;
              obj = JSON.parse(d);
              console.log(`Buscou ${obj.issue.id}`);
              // console.log JSON.stringify obj, null, 2
              // callback? obj, 200
              return this.getTimeEntries(issue, dtInicial, dtFinal).then(function(times) {
                obj.time_entries = times.time_entries;
                return resolve(obj);
              });
            });
            // process.stdout.write(obj);
            return res.on("end", () => {
              return console.log("Acabou");
            });
          });
          req.on("error", (e) => {
            console.error(e);
            // error? e
            return resolve(e);
          });
          return req.end();
        });
      },
      getTimeEntries: function(issue, dtInicial, dtFinal) {
        var dateFilter, dtFim, dtFimArr, dtIni, dtIniArr, e;
        dateFilter = "";
        if (dtInicial && dtFinal) {
          try {
            dtIniArr = dtInicial.split("/");
            dtFimArr = dtFinal.split("/");
            dtIni = `${dtIniArr[2] - dtIniArr[1] - dtIniArr[0]}`;
            dtFim = `${dtFimArr[2] - dtFimArr[1] - dtFimArr[0]}`;
            dateFilter = `&spent_on=><${dtIni}|${dtFim}`;
          } catch (error) {
            e = error;
            console.log(e);
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
          // agent: false  # create a new agent just for this one request
          }, function(res) {
            var buffer;
            res.setEncoding("utf8");
            if (res.statusCode !== 200) {
              // console.log "statusCode para issue #{issue}:", res.statusCode
              // callback? null, res.statusCode
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
          // console.log "Chamou end..."
          req.on("error", (e) => {
            console.error(e);
            // error? e
            return reject(e);
          });
          return req.end();
        });
      }
    };
  };

}).call(this);
