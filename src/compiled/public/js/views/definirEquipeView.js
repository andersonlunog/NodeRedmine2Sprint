(function() {
  define(function(require, exports, module) {
    var $, Backbone, DefinirEquipeView, UsuarioRedmineCollection, _, helper, template;
    _ = require("underscore");
    $ = require("jquery");
    Backbone = require("backbone");
    template = require("text!templates/definirEquipe.html");
    UsuarioRedmineCollection = require("models/usuarioRedmineCollection");
    helper = require("helpers/helper");
    require("bootstrap");
    DefinirEquipeView = (function() {
      class DefinirEquipeView extends Backbone.View {
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
                      ativo: false,
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
        trclick(ev) {
          var chk, target;
          target = this.$(ev.target);
          chk = target.closest("tr").find("input:checkbox");
          if (chk[0] === target[0]) {
            return;
          }
          chk.prop("checked", !chk.is(":checked"));
          return chk.trigger("change");
        }

        chkAtivoChanged(ev) {
          var chk, id;
          chk = this.$(ev.target);
          id = chk.attr("name");
          return this.collection.get(id).set("ativo", chk.is(":checked"));
        }

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

      DefinirEquipeView.prototype.el = ".mid-container";

      DefinirEquipeView.prototype.template = _.template(template);

      DefinirEquipeView.prototype.events = {
        "click #btn-buscar": "buscar",
        "click #btn-salvar": "salvar",
        "click #frm-usuarios tbody tr": "trclick",
        "change .chk-usuario": "chkAtivoChanged"
      };

      return DefinirEquipeView;

    }).call(this);
    // usuarioRedmineCollection = new UsuarioRedmineCollection
    // usuarioRedmineCollection.fetch
    //   success: (collection, response) =>
    //     checks.each (i)->
    //       id = parseInt $(@).attr("name")
    //       mdl = that.collection.get id
    //       unless usuarioRedmineCollection.findWhere redmineID: id
    //         usuarioRedmineCollection.add
    //           redmineID: id
    //           nome: "#{mdl.get("firstname")} #{mdl.get("lastname")}"
    //       if i is checks.length - 1
    //         usuarioRedmineCollection.sync "create", usuarioRedmineCollection,
    //           success: (msg)->
    //             console.log msg
    //             helper.aguardeBtn.call that, "#btn-salvar", "Salvar", "Salvar", true
    //             alert "Usuários importados com sucesso!"
    //           error: (e)->
    //             console.log e
    //             helper.aguardeBtn.call that, "#btn-salvar", "Salvar", "Salvar", true
    //             alert "Houve um erro ao salvar usuários!/r/nConsulte o log."
    //   error: (e) =>
    //     console.log e
    //     helper.aguardeBtn.call @, "#btn-salvar", "Salvar", "Salvar", true
    //     alert "Houve um erro ao salvar usuários!/r/nConsulte o log."
    return module.exports = DefinirEquipeView;
  });

}).call(this);
