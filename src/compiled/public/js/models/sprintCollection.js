(function() {
  define(["underscore", "backbone", "collection", "models/sprintModel"], function(_, Backbone, BaseCollection, SprintModel) {
    var SprintCollection;
    SprintCollection = (function() {
      class SprintCollection extends BaseCollection {};

      SprintCollection.prototype.model = SprintModel;

      SprintCollection.prototype.url = "/sprints";

      return SprintCollection;

    }).call(this);
    return SprintCollection;
  });

}).call(this);
