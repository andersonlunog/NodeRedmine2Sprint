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
          this.chartColors = {
            blue: "rgb(54, 162, 235)",
            green: "rgb(75, 192, 192)",
            grey: "rgb(201, 203, 207)",
            orange: "rgb(255, 159, 64)",
            purple: "rgb(153, 102, 255)",
            red: "rgb(255, 99, 132)",
            yellow: "rgb(255, 205, 86)"
          };
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
            this.render();
            alert(`Nenhuma sprint encontrada com ID ${this.options.sprintID}`);
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
          var _somaPorCustomFields, _somaUsuarioHoraDia;
          this.horaOrigem = {};
          this.horaGrupoCliente = {};
          this.horaTipoServico = {};
          this.usuarioHoraDia = {};
          _somaPorCustomFields = function(dest, lancamento, customFieldID) {
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
          _somaUsuarioHoraDia = function(dest, lancamento) {
            var spent_on, userName;
            userName = lancamento.get("user").name;
            if (dest[userName] == null) {
              dest[userName] = {};
            }
            spent_on = lancamento.get("spent_on");
            if (dest[userName][spent_on]) {
              return dest[userName][spent_on] += lancamento.get("hours");
            } else {
              return dest[userName][spent_on] = lancamento.get("hours");
            }
          };
          this.lancamentosCollection.forEach((lancamento) => {
            _somaPorCustomFields(this.horaOrigem, lancamento, 53);
            _somaPorCustomFields(this.horaGrupoCliente, lancamento, 51);
            _somaPorCustomFields(this.horaTipoServico, lancamento, 58);
            return _somaUsuarioHoraDia(this.usuarioHoraDia, lancamento);
          });
          return this.renderGraficoUsuarioHoraDia();
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
            $("#grafico-modal .modal-body .btn-group .btn").first().click();
            if (this.graficoPizza == null) {
              return this.renderGrafico(this.horaOrigem);
            }
          });
        }

        teste(e) {
          e.preventDefault();
          return this.consolidaDados();
        }

        renderGraficoUsuarioHoraDia() {
          var ctx, data, datasets, i, k, k1, labels, opts, ref, ref1, v, v1;
          ctx = $("#chart-area-usuario");
          datasets = [];
          labels = [];
          i = 0;
          ref = this.usuarioHoraDia;
          for (k in ref) {
            v = ref[k];
            data = [];
            for (k1 in v) {
              v1 = v[k1];
              if (!_.contains(labels, k1)) {
                labels.push(k1);
              }
              data.push({
                x: k1,
                y: v1
              });
            }
            datasets.push({
              label: k,
              backgroundColor: this.chartColors[_.keys(this.chartColors)[i]],
              borderColor: this.chartColors[_.keys(this.chartColors)[i++]],
              fill: false,
              lineTension: 0,
              data: _.sortBy(data, "x")
            });
          }
          opts = {
            type: 'line',
            data: {
              labels: labels.sort(),
              datasets: datasets
            }
          };
          // console.log JSON.stringify opts
          if ((ref1 = this.graficoUsuario) != null) {
            ref1.destroy();
          }
          return this.graficoUsuario = new Chart(ctx, opts);
        }

        
        // options = {
        //   type: 'line',
        //   data: {
        //     labels: ["2018-04-20", "2018-04-19", "2018-04-18", "2018-04-16", "2018-04-17"],
        //     datasets: [
        //       {
        //         backgroundColor: "rgb(54, 162, 235)",
        //         borderColor: "rgb(54, 162, 235)",
        //         fill: false,
        //         data: [
        //           {
        //             x: "2018-04-20",
        //             y: 2.8
        //           },
        //           {
        //             x: "2018-04-19",
        //             y: 8.4
        //           },
        //           {
        //             x: "2018-04-18",
        //             y: 8.7
        //           },
        //           {
        //             x: "2018-04-16",
        //             y: 8.7
        //           },
        //           {
        //             x: "2018-04-17",
        //             y: 9.4
        //           }
        //         ],
        //         label: "Winicius Oliveira"
        //       },
        //       {
        //         backgroundColor: "rgb(75, 192, 192)",
        //         borderColor: "rgb(75, 192, 192)",
        //         fill: false,
        //         data: [
        //           {
        //             x: "2018-04-16",
        //             y: 8
        //           },
        //           {
        //             x: "2018-04-17",
        //             y: 8
        //           }
        //         ],
        //         label: "Sérgio  Rodriguez"
        //       }
        //     ]
        //   }
        // }
        // @graficoUsuario = new Chart ctx, options
        renderGrafico(data) {
          var ctx, ref;
          ctx = $("#chart-generic-area");
          if ((ref = this.graficoPizza) != null) {
            ref.destroy();
          }
          return this.graficoPizza = new Chart(ctx, {
            type: 'pie',
            data: {
              labels: _.keys(data),
              datasets: [
                {
                  // label: 'Hora X Origem',
                  data: _.values(data),
                  backgroundColor: [this.chartColors.blue,
                this.chartColors.orange,
                this.chartColors.green,
                this.chartColors.yellow,
                this.chartColors.purple,
                this.chartColors.red],
                  borderColor: [this.chartColors.blue,
                this.chartColors.orange,
                this.chartColors.green,
                this.chartColors.yellow,
                this.chartColors.purple,
                this.chartColors.red],
                  borderWidth: 1
                }
              ]
            }
          });
        }

        alterarGrafico(e) {
          switch ($(e.target).val()) {
            case "origem":
              $("#grafico-modal-label").html("Hora X Origem");
              return this.renderGrafico(this.horaOrigem);
            case "tipo_servico":
              $("#grafico-modal-label").html("Hora X Tipo Serviço");
              return this.renderGrafico(this.horaTipoServico);
            case "grupo_cliente":
              $("#grafico-modal-label").html("Hora X Grupo Cliente");
              return this.renderGrafico(this.horaGrupoCliente);
          }
        }

      };

      SprintResultadoView.prototype.el = ".mid-container";

      SprintResultadoView.prototype.template = _.template(template);

      SprintResultadoView.prototype.events = {
        "submit #frm-sprint": "submit",
        "click #btn-buscar": "getLancamentosHoras",
        "click #btn-teste": "teste",
        "change .radio-grafico": "alterarGrafico"
      };

      return SprintResultadoView;

    }).call(this);
    return module.exports = SprintResultadoView;
  });

}).call(this);
