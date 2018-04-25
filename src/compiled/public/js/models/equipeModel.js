(function() {
  define(["underscore", "backbone", "model"], function(_, Backbone, BaseModel) {
    var EquipeModel;
    EquipeModel = (function() {
      class EquipeModel extends BaseModel {};

      EquipeModel.prototype.defaults = {
        nome: "",
        usuarios: []
      };

      EquipeModel.prototype.urlRoot = "/equipe";

      return EquipeModel;

    }).call(this);
    return EquipeModel;
  });

}).call(this);
