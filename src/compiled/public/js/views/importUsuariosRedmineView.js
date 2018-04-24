(function() {
  define(function(require, exports, module) {
    var $, Backbone, ImportUsuariosRedmineView, UsuarioRedmineCollection, _, helper, template;
    _ = require("underscore");
    $ = require("jquery");
    Backbone = require("backbone");
    template = require("text!templates/importUsuariosRedmine.html");
    UsuarioRedmineCollection = require("models/usuarioRedmineCollection");
    helper = require("helpers/helper");
    require("bootstrap");
    ImportUsuariosRedmineView = (function() {
      class ImportUsuariosRedmineView extends Backbone.View {
        initialize() {
          this.inicio = 50;
          this.fim = 60;
          this.collection = new UsuarioRedmineCollection;
          this.render();
          this.collection.on("add remove reset change", this.render, this);
          this.collection.fetch({
            error: (e) => {
              console.log(e);
              return alert("Houve um erro ao buscar usuários!/r/nConsulte o log.");
            }
          });
          return this;
        }

        render() {
          this.$el.html(this.template({
            usuarios: this.collection.models,
            buscando: this.buscando,
            inicio: this.inicio,
            fim: this.fim
          }));
          helper.aguardeBtn.call(this, "#btn-buscar", "Buscar", "Buscando...", !this.buscando);
          helper.aguardeBtn.call(this, "#btn-salvar", "Salvar", "Buscando...", !this.buscando);
          return this;
        }

        buscar(ev) {
          var i, j, ref, ref1, results;
          ev.preventDefault();
          this.inicio = parseInt($("#input-inicio").val());
          this.fim = parseInt($("#input-fim").val());
          console.log(`Buscando os usuário de ${this.inicio} a ${this.fim}`);
          this.buscando = true;
          results = [];
          //*******
          for (i = j = ref = this.inicio, ref1 = this.fim; ref <= ref1 ? j <= ref1 : j >= ref1; i = ref <= ref1 ? ++j : --j) {
            results.push(((id) => {
              return $.get(`/buscarRedmine?id=${id}`, (u) => {
                var userDB;
                if (!(_.isEmpty(u) || _.isEmpty(u.user))) {
                  userDB = this.collection.findWhere({
                    redmineID: u.user.id
                  });
                  if (!userDB) {
                    return this.collection.add({
                      redmineID: u.user.id,
                      nome: `${u.user.firstname} ${u.user.lastname}`
                    });
                  }
                } else {
                  return console.log(`UID ${id} não encontrado...`);
                }
              }).fail((e) => {
                return console.log(e.responseText);
              }).always(() => {
                if (id >= this.fim) {
                  this.buscando = false;
                  return this.render();
                }
              });
            })(i));
          }
          return results;
        }

        //******
        salvar(ev) {
          var checks, that;
          ev.preventDefault();
          that = this;
          helper.aguardeBtn.call(this, "#btn-salvar", "Salvar", "Salvar", false);
          checks = this.$("#frm-usuarios input:checked");
          if (!checks.length) {
            helper.aguardeBtn.call(this, "#btn-salvar", "Salvar", "Salvar", true);
            alert("Nenhum usuário selecionado.");
            return;
          }
          return this.collection.sync("create", this.collection, {
            success: function(msg) {
              console.log(msg);
              helper.aguardeBtn.call(that, "#btn-salvar", "Salvar", "Salvar", true);
              return alert("Usuários salvos com sucesso!");
            },
            error: function(e) {
              console.log(e);
              helper.aguardeBtn.call(that, "#btn-salvar", "Salvar", "Salvar", true);
              return alert("Houve um erro ao salvar usuários!/r/nConsulte o log.");
            }
          });
        }

      };

      ImportUsuariosRedmineView.prototype.el = ".mid-container";

      ImportUsuariosRedmineView.prototype.template = _.template(template);

      ImportUsuariosRedmineView.prototype.events = {
        "click #btn-buscar": "buscar",
        "click #btn-salvar": "salvar"
      };

      return ImportUsuariosRedmineView;

    }).call(this);
    return module.exports = ImportUsuariosRedmineView;
  });

}).call(this);
