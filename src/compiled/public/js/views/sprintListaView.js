(function() {
  define(function(require, exports, module) {
    var $, Backbone, SprintCollection, SprintListaView, _, template;
    _ = require("underscore");
    $ = require("jquery");
    Backbone = require("backbone");
    template = require("text!templates/sprintLista.html");
    SprintCollection = require("models/sprintCollection");
    require("bootstrap");
    SprintListaView = (function() {
      class SprintListaView extends Backbone.View {
        initialize() {
          this.collection = new SprintCollection;
          this.collection.fetch({
            success: (collection, response) => {
              this.collection.reset(response);
              return this.render();
            },
            error: function(e) {
              return alert(JSON.stringify(e));
            }
          });
          this.collection.on("remove", this.render, this);
          return this;
        }

        render() {
          var that;
          this.$el.html(this.template({
            sprints: this.collection.toJSON()
          }));
          that = this;
          $(".btn-delete").click(function() {
            if ($(this).data("id")) {
              return that.collection.remove($(this).data("id"));
            }
          });
          $("#btn-salvar").click(function() {
            return that.collection.save();
          });
          return this;
        }

      };

      SprintListaView.prototype.el = ".mid-container";

      SprintListaView.prototype.template = _.template(template);

      return SprintListaView;

    }).call(this);
    return module.exports = SprintListaView;
  });

}).call(this);
