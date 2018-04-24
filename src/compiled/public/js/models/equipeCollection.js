(function() {
  define(["underscore", "backbone", "collection", "models/usuarioRedmineModel"], function(_, Backbone, BaseCollection, UsuarioRedmineModel) {
    var UsuarioRedmineCollection;
    UsuarioRedmineCollection = (function() {
      class UsuarioRedmineCollection extends BaseCollection {};

      UsuarioRedmineCollection.prototype.model = UsuarioRedmineModel;

      UsuarioRedmineCollection.prototype.url = "/usuariosRedmine";

      return UsuarioRedmineCollection;

    }).call(this);
    return UsuarioRedmineCollection;
  });

}).call(this);
