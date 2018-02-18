(function() {
  define(function(require, exports, module) {
    var $, Backbone, ImportarUsuariosView, UsuarioRedmineCollection, _, template;
    _ = require("underscore");
    $ = require("jquery");
    Backbone = require("backbone");
    template = require("text!templates/importarUsuarios.html");
    UsuarioRedmineCollection = require("models/usuarioRedmineCollection");
    require("bootstrap");
    ImportarUsuariosView = (function() {
      class ImportarUsuariosView extends Backbone.View {
        initialize() {
          this.inicio = 50;
          this.fim = 60;
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
          this.aguardeBtn("#btn-buscar", "Buscar", "Buscando...", !this.buscando);
          this.aguardeBtn("#btn-importar", "Importar", "Importar", !this.buscando);
          return this;
        }

        aguardeBtn(btnSel, labelEnabled, labelDisabled, enabled) {
          if (enabled) {
            return this.$(`${btnSel}`).html(labelEnabled).attr("disabled", false);
          } else {
            return this.$(`${btnSel}`).html(labelDisabled).attr("disabled", true).append(" <span class=\"glyphicon glyphicon-refresh\" aria-hidden=\"true\"></span>");
          }
        }

        buscar(ev) {
          var i, j, ref, ref1, results;
          ev.preventDefault();
          this.inicio = parseInt($("#input-inicio").val());
          this.fim = parseInt($("#input-fim").val());
          console.log(`Buscando os usuário de ${this.inicio} a ${this.fim}`);
          this.buscando = true;
          this.collection.reset();
          results = [];
          //*******
          for (i = j = ref = this.inicio, ref1 = this.fim; ref <= ref1 ? j <= ref1 : j >= ref1; i = ref <= ref1 ? ++j : --j) {
            results.push(((id) => {
              return $.get(`/usuarioDoRedmine?id=${id}`, (u) => {
                if (!(_.isEmpty(u) || _.isEmpty(u.user))) {
                  return this.collection.add(u.user);
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

        // id = @inicio
        // requisitar = =>
        //   $.get "/usuarioRedmine?id=#{id}", (u)=>
        //     unless _.isEmpty(u) or _.isEmpty(u.user)
        //       @collection.add u.user 
        //     else
        //       console.log "UID #{id} não encontrado..."
        //     id++
        //     if id <= @fim
        //       requisitar()
        //     else
        //       @buscando = false
        //       @render()
        // requisitar()
        trclick(ev) {
          var chk, target;
          target = this.$(ev.target);
          chk = target.closest("tr").find("input:checkbox");
          if (chk[0] === target[0]) {
            return;
          }
          return chk.prop("checked", !chk.is(":checked"));
        }

        importar(ev) {
          var checks, that, usuarioRedmineCollection;
          ev.preventDefault();
          that = this;
          this.aguardeBtn("#btn-importar", "Importar", "Importar", false);
          checks = this.$("#frm-usuarios input:checked");
          if (!checks.length) {
            this.aguardeBtn("#btn-importar", "Importar", "Importar", true);
            alert("Nenhum usuário selecionado.");
            return;
          }
          usuarioRedmineCollection = new UsuarioRedmineCollection;
          return usuarioRedmineCollection.fetch({
            success: (collection, response) => {
              return checks.each(function(i) {
                var id, mdl;
                id = parseInt($(this).attr("name"));
                mdl = that.collection.get(id);
                if (!usuarioRedmineCollection.findWhere({
                  redmineID: id
                })) {
                  usuarioRedmineCollection.add({
                    redmineID: id,
                    nome: `${mdl.get("firstname")} ${mdl.get("lastname")}`
                  });
                }
                if (i === checks.length - 1) {
                  return usuarioRedmineCollection.sync("create", usuarioRedmineCollection, {
                    success: function(msg) {
                      console.log(msg);
                      that.aguardeBtn("#btn-importar", "Importar", "Importar", true);
                      return alert("Usuários importados com sucesso!");
                    },
                    error: function(e) {
                      console.log(e);
                      that.aguardeBtn("#btn-importar", "Importar", "Importar", true);
                      return alert("Houve um erro ao importar usuários!/r/nConsulte o log.");
                    }
                  });
                }
              });
            },
            // @collection.reset response
            // @render()
            error: function(e) {
              console.log(e);
              that.aguardeBtn("#btn-importar", "Importar", "Importar", true);
              return alert("Houve um erro ao importar usuários!/r/nConsulte o log.");
            }
          });
        }

      };

      ImportarUsuariosView.prototype.el = ".mid-container";

      ImportarUsuariosView.prototype.template = _.template(template);

      ImportarUsuariosView.prototype.events = {
        "click #btn-buscar": "buscar",
        "click #btn-importar": "importar",
        "click #frm-usuarios tbody tr": "trclick"
      };

      return ImportarUsuariosView;

    }).call(this);
    return module.exports = ImportarUsuariosView;
  });

}).call(this);
