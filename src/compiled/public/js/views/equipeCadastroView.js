(function() {
  define(function(require, exports, module) {
    var $, Backbone, EquipeCadastroView, EquipeModel, UsuarioRedmineCollection, _, helper, template;
    _ = require("underscore");
    $ = require("jquery");
    Backbone = require("backbone");
    template = require("text!templates/equipeCadastro.html");
    UsuarioRedmineCollection = require("models/usuarioRedmineCollection");
    EquipeModel = require("models/equipeModel");
    helper = require("helpers/helper");
    require("bootstrap");
    EquipeCadastroView = (function() {
      class EquipeCadastroView extends Backbone.View {
        initialize(options) {
          this.options = options;
          this.usuarioRedmineCollection = new UsuarioRedmineCollection;
          this.model = new EquipeModel;
          this.render();
          this.listenTo(this.model, "change", this.render);
          this.usuarioRedmineCollection.fetch({
            data: {
              ativo: true
            },
            success: (usuarios) => {
              if (this.options.equipeID) {
                this.model.set({
                  "_id": this.options.equipeID
                });
                return this.model.fetch({
                  success: (equipe) => {
                    usuarios.forEach(function(mdl) {
                      if (_.some(equipe.get("usuarios"), function(u) {
                        return u.redmineID === mdl.get("redmineID");
                      })) {
                        return mdl.set("ativoEquipe", true);
                      }
                    });
                    return this.render();
                  },
                  error: function(e) {
                    console.log(e);
                    return alert("Houve um erro ao buscar a equipe!/r/nConsulte o log.");
                  }
                });
              } else {
                this.usuarioRedmineCollection.forEach(function(mdl) {
                  return mdl.set("ativoEquipe", false);
                });
                return this.render();
              }
            },
            error: (e) => {
              console.log(e);
              return alert("Houve um erro ao buscar usuários!/r/nConsulte o log.");
            }
          });
          return this;
        }

        render() {
          this.$el.html(this.template({
            usuariosRedmine: this.usuarioRedmineCollection.toJSON(),
            model: this.model.toJSON()
          }));
          return this;
        }

        trClick(ev) {
          return helper.trClick.call(this, ev);
        }

        chkAtivoChanged(ev) {
          var chk, id, usuarios;
          chk = this.$(ev.target);
          id = chk.attr("name");
          this.fillModel();
          this.usuarioRedmineCollection.get(id).set("ativoEquipe", chk.is(":checked"));
          usuarios = [];
          this.usuarioRedmineCollection.forEach(function(itm) {
            if (itm.get("ativoEquipe")) {
              return usuarios.push(_.pick(itm.toJSON(), "redmineID", "nome"));
            }
          });
          return this.model.set("usuarios", usuarios);
        }

        fillModel() {
          return this.model.set("nome", this.$("#input-nome").val());
        }

        salvar(ev) {
          var that;
          ev.preventDefault();
          that = this;
          helper.aguardeBtn.call(this, "#btn-salvar", "Salvar", "Salvar", false);
          this.fillModel();
          if (_.isEmpty(this.model.get("usuarios"))) {
            helper.aguardeBtn.call(this, "#btn-salvar", "Salvar", "Salvar", true);
            alert("Nenhum usuário selecionado.");
            return;
          }
          return this.model.save(null, {
            success: function(msg) {
              console.log(msg);
              helper.aguardeBtn.call(that, "#btn-salvar", "Salvar", "Salvar", true);
              return alert("Equipe salva com sucesso!");
            },
            error: function(e) {
              console.log(e);
              helper.aguardeBtn.call(that, "#btn-salvar", "Salvar", "Salvar", true);
              return alert("Houve um erro ao salvar equipe!/r/nConsulte o log.");
            }
          });
        }

      };

      EquipeCadastroView.prototype.el = ".mid-container";

      EquipeCadastroView.prototype.template = _.template(template);

      EquipeCadastroView.prototype.events = {
        "click #btn-salvar": "salvar",
        "click #frm-usuarios tbody tr": "trClick",
        "change .chk-usuario": "chkAtivoChanged"
      };

      return EquipeCadastroView;

    }).call(this);
    return module.exports = EquipeCadastroView;
  });

}).call(this);
