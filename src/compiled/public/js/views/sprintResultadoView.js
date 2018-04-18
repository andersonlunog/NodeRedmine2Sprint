(function() {
  define(function(require, exports, module) {
    var $, Backbone, SprintResultadoView, UsuarioRedmineCollection, _, helper, sprintModel, template;
    _ = require("underscore");
    $ = require("jquery");
    Backbone = require("backbone");
    template = require("text!templates/sprintResultado.html");
    sprintModel = require("models/sprintModel");
    UsuarioRedmineCollection = require("models/usuarioRedmineCollection");
    helper = require("helpers/helper");
    require("bootstrap");
    SprintResultadoView = (function() {
      class SprintResultadoView extends Backbone.View {
        initialize(options) {
          this.options = options;
          this.model = new sprintModel;
          this.model.on("change", this.render, this);
          this.usuarioRedmineCollection = new UsuarioRedmineCollection;
          this.lancamentosCollection = new Backbone.Collection;
          this.chamadosCollection = new Backbone.Collection;
          this.chamadosBuscaCollection = new Backbone.Collection;
          this.chamadosBuscaCollection.on("add remove", this.render, this);
          this.lancamentosCollection.on("add remove", this.render, this);
          this.render();
          if (this.options.sprintID) {
            this.model.set({
              "_id": this.options.sprintID
            });
            this.model.fetch({
              success: this.getLancamentosHoras.bind(this),
              error: function(e) {
                console.log(e);
                return alert("Houve um erro ao buscar a sprint!/r/nConsulte o log.");
              }
            });
          } else {
            this.usuarioRedmineCollection.forEach(function(mdl) {
              return mdl.set("ativoSprint", true);
            });
            this.render();
          }
          return this;
        }

        getLancamentosHoras(sprint) {
          var fim, inicio, usuarios;
          usuarios = sprint.get("usuarios");
          inicio = sprint.get("inicio");
          fim = sprint.get("fim");
          return usuarios.forEach((id, i, arr) => {
            return $.get(`/timeentries?user=${id}&inicio=${inicio}&fim=${fim}`, (lancamento) => {
              if (!(_.isEmpty(lancamento) || _.isEmpty(lancamento.time_entries))) {
                return lancamento.time_entries.forEach((time) => {
                  return this.getIssue(time.issue.id, (issue) => {
                    time.issue = issue;
                    console.log(time);
                    return this.processaLancamento(time);
                  });
                });
              } else {
                return console.log(`Usuário ${id} sem lançamentos...`);
              }
            }).fail((e) => {
              return console.log(e);
            });
          });
        }

        // .always ()=>
        //   if i >= usuarios.length - 1
        //     @buscando = false
        //     @render()
        getIssue(issueID, callback) {
          return $.get(`/redmine/issue?id=${issueID}`, (issue) => {
            if (!(_.isEmpty(issue) || _.isEmpty(issue.issues))) {
              return callback(issue.issues[0]);
            } else {
              return console.log(`Chamado ${issueID} não encontrado...`);
            }
          }).fail((e) => {
            return console.log(e);
          });
        }

        processaLancamento(lancamento) {
          var issue, time;
          time = _.pick(lancamento, "user", "hours", "spent_on");
          issue = _.pick(lancamento.issue, "id", "subject", "estimated_hours", "status", "assigned_to");
          issue.time_entries = time;
          lancamento.issue.custom_fields.forEach(function(field) {
            switch (field.id) {
              case 19:
                return issue.sistema = field.value;
              case 51:
                return issue.grupo_cliente = field.value;
              case 52:
                return issue.componente = field.value;
              case 53:
                return issue.origem = field.value;
              case 58:
                return issue.tipo_servico = field.value;
            }
          });
          return this.lancamentosCollection.add(issue);
        }

        render() {
          var modelObj;
          modelObj = this.model.toJSON();
          modelObj.resultados = this.lancamentosCollection.toJSON();
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

      SprintResultadoView.prototype.el = ".mid-container";

      SprintResultadoView.prototype.template = _.template(template);

      SprintResultadoView.prototype.events = {
        "submit #frm-sprint": "submit",
        "click #btn-buscar": "buscarIssues"
      };

      return SprintResultadoView;

    }).call(this);
    return module.exports = SprintResultadoView;
  });

}).call(this);
