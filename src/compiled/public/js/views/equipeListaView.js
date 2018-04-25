(function() {
  define(function(require, exports, module) {
    var $, Backbone, EquipeCollection, EquipeListaView, _, template;
    _ = require("underscore");
    $ = require("jquery");
    Backbone = require("backbone");
    template = require("text!templates/equipeLista.html");
    EquipeCollection = require("models/equipeCollection");
    require("bootstrap");
    EquipeListaView = (function() {
      class EquipeListaView extends Backbone.View {
        initialize() {
          this.collection = new EquipeCollection;
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
            equipes: this.collection.toJSON()
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

      EquipeListaView.prototype.el = ".mid-container";

      EquipeListaView.prototype.template = _.template(template);

      return EquipeListaView;

    }).call(this);
    return module.exports = EquipeListaView;
  });

}).call(this);
