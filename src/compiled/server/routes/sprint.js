(function() {
  var isLoggedIn;

  isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  };

  module.exports = function(app) {
    app.get("/sprints", function(req, res) {
      return res.send([
        {
          nome: "teste",
          inicio: new Date(),
          fim: new Date()
        }
      ]);
    });
  };

}).call(this);
