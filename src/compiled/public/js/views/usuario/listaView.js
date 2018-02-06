(function() {
  define(["jquery", "underscore", "backbone", "text!templates/usuario/lista.html", "models/usuario/usuarioCollection"], function($, _, Backbone, Template, UsuarioCollection) {
    var UsuariosView;
    UsuariosView = (function() {
      class UsuariosView extends Backbone.View {
        initialize() {
          this.collection = new UsuarioCollection;
          this.collection.fetch({
            success: (collection, response) => {
              this.collection.reset(response);
              return this.render();
            },
            error: function(e) {
              return alert(JSON.stringify(e));
            }
          });
          return this.collection.on("remove", this.render, this);
        }

        render() {
          var that;
          this.$el.html(this.template({
            usuarios: this.collection.models
          }));
          that = this;
          $(".btn-delete").click(function() {
            if ($(this).data("id")) {
              return that.collection.remove($(this).data("id"));
            }
          });
          return $("#btn-salvar").click(function() {
            return that.collection.save();
          });
        }

      };

      UsuariosView.prototype.el = ".page";

      UsuariosView.prototype.template = _.template(Template);

      return UsuariosView;

    }).call(this);
    return UsuariosView;
  });

}).call(this);
