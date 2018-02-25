(function() {
  define(function(require, exports, module) {
    var $, Backbone, MainView, _, layoutTemplate;
    _ = require("underscore");
    $ = require("jquery");
    Backbone = require("backbone");
    layoutTemplate = require("text!templates/layout.html");
    require("bootstrap");
    MainView = (function() {
      class MainView extends Backbone.View {
        initialize(options = {}) {
          this.render();
          this.menuView = app.createSubView(this, "menu.principal", require("views/MenuView"), {
            activeMenu: options.activeMenu
          });
          this.menuView.render();
          return this;
        }

        render() {
          return this.$el.html(layoutTemplate);
        }

        showInitialMessages() {
          var modal;
          if (_.contains(app.resources.showResources, "alertaPeriodoTeste") && !this.alertaPeriodoTesteShown) {
            this.alertaPeriodoTesteShown = true;
            modal = $("<div class=\"modal fade\" tabindex=\"-1\" role=\"dialog\">\n  <div class=\"modal-dialog\" role=\"document\">\n    <div class=\"modal-content\">\n      <div class=\"modal-header\">\n        <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>\n        <h4 class=\"modal-title\">Período de avaliação</h4>\n      </div>\n      <div class=\"modal-body\">\n        <p>Seja bem vindo!</p>\n        <p>Você ainda tem <strong>7 dias</strong> para usufruir do Acertiz Trabalhista e avaliar o sistema.</p>\n        <p>Caso queira se efetivar, <a href=\"#\" class=\"faturas\">clique aqui</a> e siga as instruções.</p>\n      </div>\n      <div class=\"modal-footer\">\n        <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Fechar</button>\n      </div>\n    </div>\n  </div>\n</div>");
            $("body").append(modal);
            modal.find(".faturas").click(function(e) {
              e.preventDefault();
              modal.modal("hide");
              return window.location.hash = "faturas";
            });
            modal.on("hidden.bs.modal", function() {
              return modal.remove();
            });
            modal.modal("show");
          }
          if (_.contains(app.resources.showResources, "alertaFaturasVencidas") && !this.alertaFaturasVencidasShown) {
            this.alertaFaturasVencidasShown = true;
            return alert("Você está no período de teste");
          }
        }

      };

      MainView.prototype.el = "#main";

      return MainView;

    }).call(this);
    return module.exports = MainView;
  });

}).call(this);
