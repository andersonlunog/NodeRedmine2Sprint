(function() {
  define(["underscore", "backbone", "model"], function(_, Backbone, BaseModel) {
    var SprintModel;
    SprintModel = (function() {
      class SprintModel extends BaseModel {};

      SprintModel.prototype.defaults = {
        nome: "",
        inicio: "",
        fim: ""
      };

      SprintModel.prototype.urlRoot = "/sprint";

      return SprintModel;

    }).call(this);
    return SprintModel;
  });

}).call(this);
