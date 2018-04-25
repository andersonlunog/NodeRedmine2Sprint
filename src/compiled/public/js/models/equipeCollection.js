(function() {
  define(["underscore", "backbone", "collection", "models/equipeModel"], function(_, Backbone, BaseCollection, EquipeModel) {
    var EquipeCollection;
    EquipeCollection = (function() {
      class EquipeCollection extends BaseCollection {};

      EquipeCollection.prototype.model = EquipeModel;

      EquipeCollection.prototype.url = "/equipes";

      return EquipeCollection;

    }).call(this);
    return EquipeCollection;
  });

}).call(this);
