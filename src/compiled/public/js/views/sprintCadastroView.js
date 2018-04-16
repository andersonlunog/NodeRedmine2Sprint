(function() {
  define(function(require, exports, module) {
    var $, Backbone, SprintCadastroView, UsuarioRedmineCollection, _, helper, sprintModel, template;
    _ = require("underscore");
    $ = require("jquery");
    Backbone = require("backbone");
    template = require("text!templates/sprintCadastro.html");
    sprintModel = require("models/sprintModel");
    UsuarioRedmineCollection = require("models/usuarioRedmineCollection");
    helper = require("helpers/helper");
    require("bootstrap");
    SprintCadastroView = (function() {
      class SprintCadastroView extends Backbone.View {
        initialize(options) {
          this.options = options;
          this.model = new sprintModel({
            usuarios: [],
            nome: "",
            inicio: "",
            fim: "",
            chamadosPlanejadosTxt: "15527 15554 15555 15556 15557",
            buscando: false,
            chamadosPlanejados: [],
            chamadosNaoPlanejados: []
          });
          this.model.on("change", this.render, this);
          this.usuarioRedmineCollection = new UsuarioRedmineCollection;
          this.chamadosBuscaCollection = new Backbone.Collection;
          this.chamadosBuscaCollection.on("add remove", this.render, this);
          this.render();
          this.usuarioRedmineCollection.fetch({
            data: {
              ativo: true
            },
            success: (collection, response) => {
              if (this.options.sprintID) {
                this.model.set({
                  "_id": this.options.sprintID
                });
                return this.model.fetch({
                  success: (sprint) => {
                    this.usuarioRedmineCollection.forEach(function(mdl) {
                      if (_.some(sprint.get("usuarios"), function(rID) {
                        return mdl.get("redmineID");
                      })) {
                        return mdl.set("ativoSprint", true);
                      }
                    });
                    return this.render();
                  },
                  error: function(e) {
                    console.log(e);
                    return alert("Houve um erro ao buscar a sprint!/r/nConsulte o log.");
                  }
                });
              } else {
                this.usuarioRedmineCollection.forEach(function(mdl) {
                  return mdl.set("ativoSprint", true);
                });
                return this.render();
              }
            },
            error: function(e) {
              console.log(e);
              return alert("Houve um erro ao importar usuários!/r/nConsulte o log.");
            }
          });
          return this;
        }

        render() {
          var modelObj, that;
          that = this;
          modelObj = this.model.toJSON();
          modelObj.usuarios = this.usuarioRedmineCollection.toJSON();
          modelObj.chamadosPlanejados = this.chamadosBuscaCollection.toJSON();
          $(this.el).html(this.template(modelObj));
          helper.aguardeBtn.call(this, "#btn-buscar", "Buscar", "Buscando...", !this.buscando);
          return this;
        }

        buscarIssues(ev) {
          var chamadosPlanejadosTxt, fim, inicio, issuesArr, nome;
          ev.preventDefault();
          helper.aguardeBtn.call(this, "#btn-buscar", "Buscar", "Buscando...", false);
          this.buscando = true;
          this.chamadosBuscaCollection.reset();
          chamadosPlanejadosTxt = this.$("#txt-chamados").val();
          nome = this.$("#input-nome").val();
          inicio = this.$("#input-inicio").val();
          fim = this.$("#input-fim").val();
          this.model.set({
            nome: nome,
            chamadosPlanejadosTxt: chamadosPlanejadosTxt,
            inicio: inicio,
            fim: fim
          });
          issuesArr = _.reject(chamadosPlanejadosTxt.split(/[^\d]/), function(iss) {
            return !iss;
          });
          if (_.isEmpty(issuesArr)) {
            return alert("O campo chamados não pode estar vazio!");
          }
          return issuesArr.forEach((id, i, arr) => {
            return $.get(`/redmine/issue?id=${id}`, (issue) => {
              if (!(_.isEmpty(issue) || _.isEmpty(issue.issue))) {
                issue.id = issue.issue.id;
                return this.chamadosBuscaCollection.add(issue);
              } else {
                return console.log(`Chamado ${id} não encontrado...`);
              }
            }).fail((e) => {
              return console.log(e);
            }).always(() => {
              if (i >= issuesArr.length - 1) {
                this.buscando = false;
                return this.render();
              }
            });
          });
        }

        submit(ev) {
          var chamadosPlanejadosTxt, fim, inicio, nome, usuarios, usuariosChk;
          ev.preventDefault();
          usuariosChk = this.$("#frm-sprint #tbl-usuarios input:checked");
          if (!usuariosChk.length) {
            helper.aguardeBtn.call(this, "#btn-salvar", "Salvar", "Salvando...", true);
            alert("Nenhum usuário selecionado.");
            return;
          }
          // chamadosChk = @$ "#frm-sprint #tbl-chamados input:checked"
          // unless chamadosChk.length
          //   helper.aguardeBtn.call @, "#btn-salvar", "Salvar", "Salvando...", true
          //   alert "Nenhum chamado selecionado."
          //   return
          usuarios = _.map(usuariosChk, (el) => {
            return this.usuarioRedmineCollection.get($(el).val()).toJSON();
          });
          // chamadosPlanejados = _.map chamadosChk, (el)=> @chamadosBuscaCollection.get(parseInt($(el).val())).toJSON()
          chamadosPlanejadosTxt = this.$("#txt-chamados").val();
          nome = this.$("#input-nome").val();
          inicio = this.$("#input-inicio").val();
          fim = this.$("#input-fim").val();
          this.model.set({
            usuarios: _.pluck(usuarios, "redmineID"),
            nome: nome,
            chamadosPlanejadosTxt: chamadosPlanejadosTxt,
            // chamadosPlanejados: chamadosPlanejados
            chamadosPlanejados: [],
            inicio: inicio,
            fim: fim
          });
          this.model.save(null, {
            success: function(mdl) {
              return alert("Sprint salva com sucesso!");
            },
            error: function(err) {
              console.log(err);
              return alert("Houve algum erro ao salvar a sprint./r/nConsulte o log.");
            }
          });
        }

      };

      SprintCadastroView.prototype.el = ".mid-container";

      SprintCadastroView.prototype.template = _.template(template);

      SprintCadastroView.prototype.events = {
        "submit #frm-sprint": "submit",
        "click #btn-buscar": "buscarIssues"
      };

      return SprintCadastroView;

    }).call(this);
    return module.exports = SprintCadastroView;
  });

}).call(this);
