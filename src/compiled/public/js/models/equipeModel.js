(function() {
  define(["underscore", "backbone", "model"], function(_, Backbone, BaseModel) {
    var UsuarioRedmineModel;
    UsuarioRedmineModel = (function() {
      class UsuarioRedmineModel extends BaseModel {};

      UsuarioRedmineModel.prototype.defaults = {
        redmineID: null,
        nome: ""
      };

      UsuarioRedmineModel.prototype.urlRoot = "/usuarioRedmine";

      return UsuarioRedmineModel;

    }).call(this);
    return UsuarioRedmineModel;
  });

}).call(this);
