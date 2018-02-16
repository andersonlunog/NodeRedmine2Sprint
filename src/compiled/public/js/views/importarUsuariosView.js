(function() {
  define(function(require, exports, module) {
    var $, Backbone, ImportarUsuariosView, _, template;
    _ = require("underscore");
    $ = require("jquery");
    Backbone = require("backbone");
    template = require("text!templates/importarUsuarios.html");
    require("bootstrap");
    ImportarUsuariosView = (function() {
      class ImportarUsuariosView extends Backbone.View {
        initialize() {
          this.collection = new Backbone.Collection();
          this.render();
          this.collection.on("add remove reset", this.render, this);
          return this;
        }

        render() {
          this.$el.html(this.template({
            usuarios: this.collection.models,
            buscando: this.buscando,
            inicio: this.inicio,
            fim: this.fim
          }));
          if (this.buscando) {
            this.$("#btn-buscar span").show();
            this.$("#btn-buscar").text("Buscando...").attr("disabled", true).append(" <span class=\"glyphicon glyphicon-refresh\" aria-hidden=\"true\"></span>");
          } else {
            this.$("#btn-buscar span").hide();
            this.$("#btn-buscar").text("Buscar ").attr("disabled", false);
          }
          return this;
        }

        buscar(ev) {
          var id, requisitar;
          ev.preventDefault();
          this.inicio = parseInt($("#input-inicio").val());
          this.fim = parseInt($("#input-fim").val());
          console.log(`Buscando os usuário de ${this.inicio} a ${this.fim}`);
          this.buscando = true;
          this.collection.reset();
          id = this.inicio;
          requisitar = () => {
            return $.get(`/usuarioRedmine?id=${id}`, (u) => {
              if (!(_.isEmpty(u) || _.isEmpty(u.user))) {
                this.collection.add(u.user);
              } else {
                console.log(`UID ${id} não encontrado...`);
              }
              id++;
              if (id <= this.fim) {
                return requisitar();
              } else {
                this.buscando = false;
                return this.render();
              }
            });
          };
          return requisitar();
        }

      };

      ImportarUsuariosView.prototype.el = ".mid-container";

      ImportarUsuariosView.prototype.template = _.template(template);

      ImportarUsuariosView.prototype.events = {
        "click #btn-buscar": "buscar"
      };

      return ImportarUsuariosView;

    }).call(this);
    return module.exports = ImportarUsuariosView;
  });

}).call(this);
