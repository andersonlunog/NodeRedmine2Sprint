(function() {
  var redmine;

  redmine = require('../business/redmine')();

  // https = require "https"
  // environment = require('../config/environment')()
  // DateUtils = require "../utils/date"
  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
  module.exports = function(app) {
    app.get("/usuarioRedmine", function(req, res) {
      var id;
      id = req.query.id;
      return redmine.getUser(id).then(function(user) {
        return res.send(user);
      }, function(e) {
        console.log(e);
        return res.status(404).send(`Usuário ${id} não encontrado`);
      });
    });
  };

  // res.send {}
// console.log "Fazendo a requisição de usuário ID #{id}..."
// auth = "Basic " + new Buffer(environment.redmine.user + ":" + environment.redmine.pass).toString("base64");
// reqHttp = https.request
//   host: environment.redmine.host
//   port: 443
//   path: "/users/#{id}.json"
//   method: "GET"
//   headers: 
//     "Content-Type": "application/json"
//     "Authorization": auth
// , (resHttp) ->
//   resHttp.setEncoding "utf8"
//   if resHttp.statusCode != 200
//     console.log "Usuário #{id} com status #{resHttp.statusCode}!"

//   buffer = ""

//   resHttp.on "data", (data) => 
//     buffer += data

//   resHttp.on "end", =>
//     if buffer
//       try
//         obj = JSON.parse buffer
//         res.send obj
//       catch e
//         res.send {}

// reqHttp.on "error", (e) =>
//   console.error e
//   res.send {}

// reqHttp.end()

}).call(this);
