(function() {
  define(["jquery", "underscore", "backbone", "text!templates/usuario/cadastro.html", "models/usuario/usuarioModel", "helpers/bindModelForm"], function($, _, Backbone, Template, UsuarioModel, BindModelForm) {
    var UsuarioView;
    UsuarioView = (function() {
      class UsuarioView extends Backbone.View {
        initialize() {
          this.model = new UsuarioModel;
          this.modelForm = new BindModelForm(this.model);
          return this.model.on("change", this.render, this);
        }

        render() {
          var template, that;
          that = this;
          template = _.template(Template);
          $(this.el).html(template());
          return this.modelForm.fetchForm(this.options.id, ["senha"]);
        }

        submit(event) {
          this.modelForm.saveForm();
          return event.preventDefault();
        }

      };

      UsuarioView.prototype.el = ".page";

      UsuarioView.prototype.events = {
        "submit #frmUsuario": "submit"
      };

      return UsuarioView;

    }).call(this);
    return UsuarioView;
  });

}).call(this);
