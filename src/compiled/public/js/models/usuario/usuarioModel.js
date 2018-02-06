(function() {
  define(["underscore", "backbone", "model"], function(_, Backbone, BaseModel) {
    var UsuarioModel;
    UsuarioModel = (function() {
      class UsuarioModel extends BaseModel {};

      UsuarioModel.prototype.defaults = {
        nome: "",
        email: "",
        senha: "",
        confirmacaoSenha: ""
      };

      UsuarioModel.prototype.urlRoot = "/usuario";

      return UsuarioModel;

    }).call(this);
    return UsuarioModel;
  });

}).call(this);
