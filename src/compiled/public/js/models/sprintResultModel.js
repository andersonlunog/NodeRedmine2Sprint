(function() {
  define(["underscore", "backbone", "model"], function(_, Backbone, BaseModel) {
    var SprintResultModel;
    SprintResultModel = (function() {
      class SprintResultModel extends BaseModel {};

      SprintResultModel.prototype.defaults = {
        lancamentos: []
      };

      SprintResultModel.prototype.urlRoot = "/sprintResult";

      return SprintResultModel;

    }).call(this);
    return SprintResultModel;
  });

}).call(this);
