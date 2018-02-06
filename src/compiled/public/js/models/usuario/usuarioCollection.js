(function() {
  define(["underscore", "backbone", "collection", "models/usuario/usuarioModel"], function(_, Backbone, BaseCollection, UsuarioModel) {
    var UsuarioCollection;
    UsuarioCollection = (function() {
      class UsuarioCollection extends BaseCollection {};

      UsuarioCollection.prototype.model = UsuarioModel;

      UsuarioCollection.prototype.url = "/usuarios";

      return UsuarioCollection;

    }).call(this);
    return UsuarioCollection;
  });

}).call(this);
