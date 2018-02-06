(function() {
  define(["underscore", "backbone"], function(_, Backbone) {
    var BaseCollection;
    BaseCollection = (function() {
      class BaseCollection extends Backbone.Collection {
        initialize() {
          this.modelsChanged = [];
          this.bind("remove", (model) => {
            return this.modelsChanged.push({
              method: "remove",
              model: model
            });
          });
          return this.bind("add", (model) => {
            return this.modelsChanged.push({
              method: "add",
              model: model
            });
          });
        }

        save() {
          var changed, i, len, ref;
          ref = this.modelsChanged;
          for (i = 0, len = ref.length; i < len; i++) {
            changed = ref[i];
            if (changed.method === "remove") {
              changed.model.destroy();
            }
            if (changed.method === "add") {
              changed.model.save();
            }
          }
          return this.modelsChanged = [];
        }

      };

      BaseCollection.prototype.modelsChanged = [];

      return BaseCollection;

    }).call(this);
    return BaseCollection;
  });

}).call(this);
