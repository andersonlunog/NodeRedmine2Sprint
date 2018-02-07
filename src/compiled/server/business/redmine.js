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
      getIssue: function(issue) {
        return new Promise((resolve, reject) => {
          var auth, redmineReq;
          console.log(`Fazendo a requisição da issue ${issue}...`);
          auth = "Basic " + new Buffer(environment.redmine.user + ":" + environment.redmine.pass).toString("base64");
          redmineReq = https.request({
            host: environment.redmine.host,
            port: 443,
            path: `/issues/${issue}.json`,
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": auth
            }
          // agent: false  # create a new agent just for this one request
          }, (redmineRes) => {
            redmineRes.setEncoding("utf8");
            if (redmineRes.statusCode !== 200) {
              console.log(`statusCode para issue ${issue}:`, redmineRes.statusCode);
              // callback? null, redmineRes.statusCode
              reject({
                statusCode: redmineRes.statusCode
              });
            }
            redmineRes.on("data", (d) => {
              var obj;
              obj = JSON.parse(d);
              console.log(`Buscou ${obj.issue.id}`);
              // console.log JSON.stringify obj, null, 2
              // callback? obj, 200
              return this.getTimeEntries(issue).then(function(times) {
                obj.time_entries = times.time_entries;
                return resolve(obj);
              });
            });
            // process.stdout.write(obj);
            return redmineRes.on("end", () => {
              return console.log("Acabou");
            });
          });
          redmineReq.on("error", (e) => {
            console.error(e);
            // error? e
            return resolve(e);
          });
          return redmineReq.end();
        });
      },
      getTimeEntries: function(issue) {
        return new Promise(function(resolve, reject) {
          var auth, redmineReq;
          console.log(`Fazendo a requisição de tempo da issue ${issue}...`);
          auth = "Basic " + new Buffer(environment.redmine.user + ":" + environment.redmine.pass).toString("base64");
          redmineReq = https.request({
            host: environment.redmine.host,
            port: 443,
            path: `/time_entries.json?issue_id=${issue}`,
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": auth
            }
          // agent: false  # create a new agent just for this one request
          }, function(redmineRes) {
            redmineRes.setEncoding("utf8");
            if (redmineRes.statusCode !== 200) {
              // console.log "statusCode para issue #{issue}:", redmineRes.statusCode
              // callback? null, redmineRes.statusCode
              reject({
                statusCode: redmineRes.statusCode
              });
            }
            redmineRes.on("data", (d) => {
              var e, obj;
              try {
                obj = JSON.parse(d);
                return resolve(obj);
              } catch (error) {
                e = error;
                return resolve({
                  time_entries: {}
                });
              }
            });
            return redmineRes.on("end", () => {
              return console.log("Acabou");
            });
          });
          redmineReq.on("error", (e) => {
            console.error(e);
            // error? e
            return resolve(e);
          });
          return redmineReq.end();
        });
      }
    };
  };

}).call(this);
