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
      getIssue: function(issue, callback, error) {
        var auth, redmineReq;
        console.log("Fazendo a requisição...");
        auth = 'Basic ' + new Buffer(environment.redmine.user + ':' + environment.redmine.pass).toString('base64');
        redmineReq = https.request({
          host: environment.redmine.host,
          port: 443,
          path: `/issues/${issue}.json`,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            "Authorization": auth
          }
        // agent: false  # create a new agent just for this one request
        }, (redmineRes) => {
          redmineRes.setEncoding("utf8");
          if (redmineRes.statusCode !== 200) {
            console.log("statusCode:", redmineRes.statusCode);
            console.log("headers:", redmineRes.headers);
            if (typeof callback === "function") {
              callback(null, redmineRes.statusCode);
            }
          }
          redmineRes.on("data", (d) => {
            var obj;
            obj = JSON.parse(d);
            console.log(obj.issue.id);
            console.log(JSON.stringify(obj, null, 2));
            return typeof callback === "function" ? callback(obj, 200) : void 0;
          });
          // process.stdout.write(obj);
          return redmineRes.on("end", () => {
            return console.log("Acabou");
          });
        });
        redmineReq.on("error", (e) => {
          console.error(e);
          return typeof error === "function" ? error(e) : void 0;
        });
        redmineReq.end();
      }
    };
  };

}).call(this);
