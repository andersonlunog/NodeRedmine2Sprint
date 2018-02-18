(function() {
  define(function(require, exports, module) {
    var $, Backbone, BindModelForm, SprintCadastroView, UsuarioRedmineCollection, _, sprintModel, template;
    _ = require("underscore");
    $ = require("jquery");
    Backbone = require("backbone");
    template = require("text!templates/sprintCadastro.html");
    sprintModel = require("models/sprintModel");
    BindModelForm = require("helpers/bindModelForm");
    UsuarioRedmineCollection = require("models/usuarioRedmineCollection");
    require("bootstrap");
    SprintCadastroView = (function() {
      class SprintCadastroView extends Backbone.View {
        initialize(options) {
          this.options = options;
          this.model = new sprintModel;
          this.modelForm = new BindModelForm(this.model);
          this.model.on("change", this.render, this);
          this.usuarioRedmineCollection = new UsuarioRedmineCollection;
          this.usuarioRedmineCollection.fetch({
            success: (collection, response) => {
              return this.render();
            },
            error: function(e) {
              console.log(e);
              return alert("Houve um erro ao importar usuários!/r/nConsulte o log.");
            }
          });
          return this;
        }

        render() {
          var that;
          that = this;
          $(this.el).html(this.template({
            usuarios: this.usuarioRedmineCollection.models,
            chamados: []
          }));
          this.modelForm.fetchForm(this.options.id);
          return this;
        }

        submit(event) {
          this.modelForm.saveForm();
          return event.preventDefault();
        }

      };

      SprintCadastroView.prototype.el = ".mid-container";

      SprintCadastroView.prototype.template = _.template(template);

      SprintCadastroView.prototype.events = {
        "submit #frmUsuario": "submit"
      };

      return SprintCadastroView;

    }).call(this);
    return module.exports = SprintCadastroView;
  });

}).call(this);
