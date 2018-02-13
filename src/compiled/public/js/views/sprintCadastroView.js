(function() {
  define(function(require, exports, module) {
    var $, Backbone, BindModelForm, SprintCadastroView, _, sprintModel, template;
    _ = require("underscore");
    $ = require("jquery");
    Backbone = require("backbone");
    template = require("text!templates/sprintCadastro.html");
    sprintModel = require("models/sprintModel");
    BindModelForm = require("helpers/bindModelForm");
    require("bootstrap");
    SprintCadastroView = (function() {
      class SprintCadastroView extends Backbone.View {
        initialize(options) {
          this.options = options;
          this.model = new sprintModel;
          this.modelForm = new BindModelForm(this.model);
          this.model.on("change", this.render, this);
          this.render();
          return this;
        }

        render() {
          var that;
          that = this;
          $(this.el).html(this.template());
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
