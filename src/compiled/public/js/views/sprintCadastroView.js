(function() {
  define(function(require, exports, module) {
    var $, Backbone, EquipeCollection, SprintCadastroView, _, helper, sprintModel, template;
    _ = require("underscore");
    $ = require("jquery");
    Backbone = require("backbone");
    template = require("text!templates/sprintCadastro.html");
    sprintModel = require("models/sprintModel");
    EquipeCollection = require("models/equipeCollection");
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
          this.equipeCollection = new EquipeCollection;
          this.chamadosBuscaCollection = new Backbone.Collection;
          this.chamadosBuscaCollection.on("add remove", this.render, this);
          this.render();
          this.fetchEquipe();
          return this;
        }

        fetchEquipe() {
          return this.equipeCollection.fetch({
            success: (equipes) => {
              if (this.options.sprintID) {
                this.model.set({
                  "_id": this.options.sprintID
                });
                return this.model.fetch({
                  success: (sprint) => {
                    var equipe;
                    equipe = equipes.get(sprint.get("equipeID"));
                    if (equipe != null) {
                      this.usuariosEquipe = equipe.get("usuarios");
                    } else {
                      this.usuariosEquipe = equipes.at(0).get("usuarios");
                    }
                    return this.render();
                  },
                  error: function(e) {
                    console.log(e);
                    return alert("Houve um erro ao buscar a sprint!/r/nConsulte o log.");
                  }
                });
              } else {
                this.usuariosEquipe = equipes.at(0).get("usuarios");
                return this.render();
              }
            },
            error: function(e) {
              console.log(e);
              return alert("Houve um erro ao buscar equipes!/r/nConsulte o log.");
            }
          });
        }

        render() {
          $(this.el).html(this.template({
            model: this.model.toJSON(),
            equipes: this.equipeCollection.toJSON(),
            usuariosEquipe: this.usuariosEquipe || [],
            chamadosPlanejados: this.chamadosBuscaCollection.toJSON()
          }));
          helper.aguardeBtn.call(this, "#btn-buscar", "Buscar", "Buscando...", !this.buscando);
          return this;
        }

        alterarEquipe(e) {
          this.fillModel();
          return this.render();
        }

        fillModel() {
          var chamadosPlanejadosTxt, equipeID, fim, inicio, nome;
          equipeID = this.$("#select-equipe").val();
          chamadosPlanejadosTxt = this.$("#txt-chamados").val();
          nome = this.$("#input-nome").val();
          inicio = this.$("#input-inicio").val();
          fim = this.$("#input-fim").val();
          this.usuariosEquipe = this.equipeCollection.get(equipeID).get("usuarios");
          return this.model.set({
            equipeID: equipeID,
            usuarios: _.pluck(this.usuariosEquipe, "redmineID"),
            nome: nome,
            chamadosPlanejadosTxt: chamadosPlanejadosTxt,
            chamadosPlanejados: [],
            inicio: inicio,
            fim: fim
          });
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
            return $.get(`/redmine/issuetime?id=${id}`, (issue) => {
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
          ev.preventDefault();
          // usuariosChk = @$ "#frm-sprint #tbl-usuarios input:checked"
          // unless usuariosChk.length
          //   helper.aguardeBtn.call @, "#btn-salvar", "Salvar", "Salvando...", true
          //   alert "Nenhum usuário selecionado."
          //   return
          this.fillModel();
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
        "click #btn-buscar": "buscarIssues",
        "change #select-equipe": "alterarEquipe"
      };

      return SprintCadastroView;

    }).call(this);
    return module.exports = SprintCadastroView;
  });

}).call(this);
