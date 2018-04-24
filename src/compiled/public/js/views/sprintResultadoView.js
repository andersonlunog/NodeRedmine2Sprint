(function() {
  define(function(require, exports, module) {
    var $, Backbone, Chart, SprintResultadoView, UsuarioRedmineCollection, _, helper, sprintModel, sprintResultModel, template;
    _ = require("underscore");
    $ = require("jquery");
    Backbone = require("backbone");
    template = require("text!templates/sprintResultado.html");
    sprintModel = require("models/sprintModel");
    sprintResultModel = require("models/sprintResultModel");
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
            yellow: "rgb(255, 205, 86)",
            gold: "rgb(192,178,131)",
            charcoal: "rgb(55,55,55)",
            teal: "rgb(7,136,155)",
            powder: "rgb(102,185,191)",
            ink: "rgb(6,47,79)",
            oxblood: "rgb(118,50,63)",
            forest: "rgb(30,57,42)"
          };
          this.model = new sprintModel;
          this.resultModel = new sprintResultModel;
          this.model.on("change", this.render, this);
          this.usuarioRedmineCollection = new UsuarioRedmineCollection;
          this.lancamentosCollection = new Backbone.Collection;
          this.lancamentosCollection.on("add remove", this.render, this);
          this.render();
          if (this.options.sprintID) {
            this.model.set({
              "_id": this.options.sprintID
            });
            this.resultModel.set({
              "_id": this.options.sprintID
            });
            this.model.fetch({
              success: (sprint) => {
                return this.resultModel.fetch({
                  success: (sprintResult) => {
                    this.lancamentosCollection.reset(sprintResult.get("lancamentos"));
                    this.render();
                    return this.consolidaDados();
                  },
                  // @buscaLancamentosHoras sprint.get("usuarios"), sprint.get("inicio"), sprint.get("fim")
                  error: function(e) {
                    console.log(e);
                    return alert("Houve um erro ao buscar resultado da sprint!/r/nConsulte o log.");
                  }
                });
              },
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

        render() {
          var modelObj;
          modelObj = this.model.toJSON();
          modelObj.lancamentos = this.lancamentosCollection.toJSON();
          modelObj.usuarios = this.usuarioHoraCustoms || {};
          $(this.el).html(this.template(modelObj));
          helper.aguardeBtn.call(this, "#btn-atualizar-tudo", "Atualizar Tudo", "Atualizando...", !this.buscando);
          return this;
        }

        getColors(labels) {
          var i, l, label, len, ret;
          ret = [];
          for (i = l = 0, len = labels.length; l < len; i = ++l) {
            label = labels[i];
            if (_.contains(["Contrato", "Standard", "Normal"], label)) {
              ret.push(this.chartColors.blue);
            } else if (_.contains(["Venda", "Custom"], label)) {
              ret.push(this.chartColors.green);
            } else if (_.contains(["Bonificação", "Interno", "Correção"], label)) {
              ret.push(this.chartColors.yellow);
            } else if (_.contains(["Investimento", "Retrabalho"], label)) {
              ret.push(this.chartColors.orange);
            } else {
              ret.push(_.values(this.chartColors)[i + 6]);
            }
          }
          return ret;
        }

        atualizarTudo(e) {
          e.preventDefault();
          this.resultModel.set("lancamentos", []);
          return this.buscaLancamentosHoras(this.model.get("usuarios"), this.model.get("inicio"), this.model.get("fim"));
        }

        buscaLancamentosHoras(usuarios, inicio, fim) {
          this.buscando = true;
          this.lancamentosCollection.reset([]);
          helper.aguardeBtn.call(this, "#btn-atualizar-tudo", "Atualizar Tudo", "Atualizando...", !this.buscando);
          return usuarios.forEach((id, i, arr) => {
            return $.get(`/timeentries?user=${id}&inicio=${inicio}&fim=${fim}`, (lancamento) => {
              var buscandoIssue;
              if (!(_.isEmpty(lancamento) || _.isEmpty(lancamento.time_entries))) {
                buscandoIssue = true;
                return lancamento.time_entries.forEach((time, j) => {
                  return this.getIssue(time.issue.id, (issue) => {
                    time.issue = issue;
                    console.log(time);
                    this.lancamentosCollection.add(time);
                    return this.resultModel.set("lancamentos", this.lancamentosCollection.toJSON());
                  }, () => {
                    if (j >= lancamento.time_entries.length - 1 && i >= usuarios.length - 1) {
                      console.log(`Acabou... ${this.lancamentosCollection.length}`);
                      this.buscando = false;
                      this.render();
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
          var _somaPorCustomFields, _somaUsuarioHoraCustoms, _somaUsuarioHoraDia;
          this.horaOrigem = {};
          this.horaGrupoCliente = {};
          this.horaTipoServico = {};
          this.usuarioHoraDia = {};
          this.usuarioHoraCustoms = {};
          _somaPorCustomFields = function(dest, lancamento, customFieldID) {
            var key, ref;
            key = (ref = _.findWhere(lancamento.get("issue").custom_fields, {
              id: customFieldID
            })) != null ? ref.value : void 0;
            if (dest[key]) {
              return dest[key] += lancamento.get("hours");
            } else {
              return dest[key] = lancamento.get("hours");
            }
          };
          _somaUsuarioHoraDia = function(dest, lancamento) {
            var match, spent_on, userName;
            userName = lancamento.get("user").name;
            if (dest[userName] == null) {
              dest[userName] = {};
            }
            spent_on = lancamento.get("spent_on");
            match = /(\d{4})-(\d{2})-(\d{2})/g.exec(spent_on);
            spent_on = `${match[3]}/${match[2]}`;
            if (dest[userName][spent_on]) {
              return dest[userName][spent_on] += lancamento.get("hours");
            } else {
              return dest[userName][spent_on] = lancamento.get("hours");
            }
          };
          _somaUsuarioHoraCustoms = function(dest, lancamento) {
            var userName;
            userName = lancamento.get("user").name;
            if (dest[userName] == null) {
              dest[userName] = {
                origem: {},
                cliente: {},
                servico: {}
              };
            }
            _somaPorCustomFields(dest[userName].origem, lancamento, 53);
            _somaPorCustomFields(dest[userName].cliente, lancamento, 51);
            return _somaPorCustomFields(dest[userName].servico, lancamento, 58);
          };
          this.lancamentosCollection.forEach((lancamento) => {
            _somaPorCustomFields(this.horaOrigem, lancamento, 53);
            _somaPorCustomFields(this.horaGrupoCliente, lancamento, 51);
            _somaPorCustomFields(this.horaTipoServico, lancamento, 58);
            _somaUsuarioHoraDia(this.usuarioHoraDia, lancamento);
            return _somaUsuarioHoraCustoms(this.usuarioHoraCustoms, lancamento);
          });
          this.render();
          this.renderGraficoUsuarioHoraDia();
          this.renderGraficosUsuarios();
          if (this.graficoPizza == null) {
            return this.renderGraficoTotais(this.horaOrigem);
          }
        }

        salvar(ev) {
          ev.preventDefault();
          return this.resultModel.save(null, {
            success: function(mdl) {
              return alert("Resultado salvo com sucesso!");
            },
            error: function(err) {
              console.log(err);
              return alert("Houve algum erro ao salvar o resultado./r/nConsulte o log.");
            }
          });
        }

        renderGraficosUsuarios() {
          var _renderPieChart;
          _renderPieChart = (ctx, data) => {
            var colors, labels;
            labels = _.keys(data);
            colors = this.getColors(labels);
            return new Chart(ctx, {
              type: 'pie',
              data: {
                labels: labels,
                datasets: [
                  {
                    data: _.values(data),
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 1
                  }
                ]
              },
              options: {
                responsive: true
              }
            });
          };
          return _.each(this.usuarioHoraCustoms, (v, k) => {
            var ref, ref1, ref2, tr;
            tr = this.$(`tr[data-usuario='${k}']`);
            if ((ref = v.origem.chart) != null) {
              ref.destroy();
            }
            if ((ref1 = v.cliente.chart) != null) {
              ref1.destroy();
            }
            if ((ref2 = v.servico.chart) != null) {
              ref2.destroy();
            }
            v.origem.chart = _renderPieChart(tr.find(".chart-usuario-origem").first(), v.origem);
            v.cliente.chart = _renderPieChart(tr.find(".chart-usuario-cliente").first(), v.cliente);
            return v.servico.chart = _renderPieChart(tr.find(".chart-usuario-servico").first(), v.servico);
          });
        }

        renderGraficoUsuarioHoraDia() {
          var ctx, data, datasets, dia, diaHora, hora, i, labels, opts, ref, ref1, usuario;
          ctx = this.$("#chart-area-usuario");
          datasets = [];
          labels = [];
          i = 0;
          ref = this.usuarioHoraDia;
          for (usuario in ref) {
            diaHora = ref[usuario];
            data = [];
            for (dia in diaHora) {
              hora = diaHora[dia];
              if (!_.contains(labels, dia)) {
                labels.push(dia);
              }
              data.push({
                x: dia,
                y: hora
              });
            }
            datasets.push({
              label: usuario,
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
            },
            options: {
              responsive: false
            }
          };
          if ((ref1 = this.graficoUsuario) != null) {
            ref1.destroy();
          }
          return this.graficoUsuario = new Chart(ctx, opts);
        }

        renderGraficoTotais(data) {
          var colors, ctx, labels, ref;
          ctx = this.$("#chart-generic-area");
          if ((ref = this.graficoPizza) != null) {
            ref.destroy();
          }
          labels = _.keys(data);
          colors = this.getColors(labels);
          return this.graficoPizza = new Chart(ctx, {
            type: 'pie',
            data: {
              labels: labels,
              datasets: [
                {
                  data: _.values(data),
                  backgroundColor: colors,
                  borderColor: colors,
                  borderWidth: 1
                }
              ]
            }
          });
        }

        alterarGrafico(e) {
          switch ($(e.target).val()) {
            case "origem":
              this.$("#grafico-modal-label").html("Hora X Origem");
              return this.renderGraficoTotais(this.horaOrigem);
            case "tipo_servico":
              this.$("#grafico-modal-label").html("Hora X Tipo Serviço");
              return this.renderGraficoTotais(this.horaTipoServico);
            case "grupo_cliente":
              this.$("#grafico-modal-label").html("Hora X Grupo Cliente");
              return this.renderGraficoTotais(this.horaGrupoCliente);
          }
        }

      };

      SprintResultadoView.prototype.el = ".mid-container";

      SprintResultadoView.prototype.template = _.template(template);

      SprintResultadoView.prototype.events = {
        "click #btn-salvar": "salvar",
        "click #btn-atualizar-tudo": "atualizarTudo",
        "change .radio-grafico": "alterarGrafico"
      };

      return SprintResultadoView;

    }).call(this);
    return module.exports = SprintResultadoView;
  });

}).call(this);
