(function() {
  define(function(require, exports, module) {
    var $, Backbone, Chart, SprintResultadoView, UsuarioRedmineCollection, _, helper, sprintModel, template;
    _ = require("underscore");
    $ = require("jquery");
    Backbone = require("backbone");
    template = require("text!templates/sprintResultado.html");
    sprintModel = require("models/sprintModel");
    UsuarioRedmineCollection = require("models/usuarioRedmineCollection");
    Chart = require("chart");
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
              var buscandoIssue;
              if (!(_.isEmpty(lancamento) || _.isEmpty(lancamento.time_entries))) {
                buscandoIssue = true;
                return lancamento.time_entries.forEach((time, j) => {
                  return this.getIssue(time.issue.id, (issue) => {
                    time.issue = issue;
                    console.log(time);
                    return this.lancamentosCollection.add(time);
                  }, () => {
                    if (j >= lancamento.time_entries.length - 1 && i >= usuarios.length - 1) {
                      console.log(`Acabou... ${this.lancamentosCollection.length}`);
                      return this.consolidaDados();
                    }
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
        //   buscandoLancamentos = false if i >= usuarios.length - 1
        //     @render()
        getIssue(issueID, callback, alwaysCb) {
          return $.get(`/redmine/issue?id=${issueID}`, (issue) => {
            if (!(_.isEmpty(issue) || _.isEmpty(issue.issues))) {
              return callback(issue.issues[0]);
            } else {
              return console.log(`Chamado ${issueID} não encontrado...`);
            }
          }).fail((e) => {
            return console.log(e);
          }).always(() => {
            return typeof alwaysCb === "function" ? alwaysCb() : void 0;
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

        consolidaDados() {
          var somaPorCustomFields;
          this.horaOrigem = {};
          this.horaGrupoCliente = {};
          this.horaTipoServico = {};
          somaPorCustomFields = function(dest, lancamento, customFieldID) {
            var key;
            key = _.findWhere(lancamento.get("issue").custom_fields, {
              id: customFieldID
            }).value;
            if (dest[key]) {
              return dest[key] += lancamento.get("hours");
            } else {
              return dest[key] = lancamento.get("hours");
            }
          };
          return this.lancamentosCollection.forEach((lancamento) => {
            somaPorCustomFields(this.horaOrigem, lancamento, 53);
            somaPorCustomFields(this.horaGrupoCliente, lancamento, 51);
            return somaPorCustomFields(this.horaTipoServico, lancamento, 58);
          });
        }

        render() {
          var modelObj;
          modelObj = this.model.toJSON();
          modelObj.lancamentos = this.lancamentosCollection.toJSON();
          $(this.el).html(this.template(modelObj));
          helper.aguardeBtn.call(this, "#btn-buscar", "Buscar", "Buscando...", !this.buscando);
          this.preparaGrafico();
          return this;
        }

        preparaGrafico() {
          return $("#grafico-modal").on("shown.bs.modal", (e) => {
            return this.renderGrafico(this.horaOrigem);
          });
        }

        renderGrafico(data) {
          var chart, chartColors, ctx;
          chartColors = {
            blue: "rgb(54, 162, 235)",
            green: "rgb(75, 192, 192)",
            grey: "rgb(201, 203, 207)",
            orange: "rgb(255, 159, 64)",
            purple: "rgb(153, 102, 255)",
            red: "rgb(255, 99, 132)",
            yellow: "rgb(255, 205, 86)"
          };
          ctx = $("#chart-area");
          return chart = new Chart(ctx, {
            type: 'pie',
            data: {
              labels: _.keys(data),
              datasets: [
                {
                  label: 'Hora X Origem',
                  data: _.values(data),
                  backgroundColor: [chartColors.blue,
                chartColors.orange,
                chartColors.green,
                chartColors.yellow,
                chartColors.purple,
                chartColors.red],
                  borderColor: [chartColors.blue,
                chartColors.orange,
                chartColors.green,
                chartColors.yellow,
                chartColors.purple,
                chartColors.red],
                  borderWidth: 1
                }
              ]
            }
          });
        }

        alterarGrafico(e) {
          switch ($(e.target).val()) {
            case "origem":
              return this.renderGrafico(this.horaOrigem);
            case "tipo_servico":
              return this.renderGrafico(this.horaTipoServico);
            case "grupo_cliente":
              return this.renderGrafico(this.horaGrupoCliente);
          }
        }

      };

      SprintResultadoView.prototype.el = ".mid-container";

      SprintResultadoView.prototype.template = _.template(template);

      SprintResultadoView.prototype.events = {
        "submit #frm-sprint": "submit",
        "click #btn-buscar": "buscarIssues",
        "change .radio-grafico": "alterarGrafico"
      };

      return SprintResultadoView;

    }).call(this);
    return module.exports = SprintResultadoView;
  });

}).call(this);
