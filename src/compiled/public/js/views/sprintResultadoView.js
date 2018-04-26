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
                    return this.consolidaDados();
                  },
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
          var promLancam;
          this.buscando = true;
          helper.aguardeBtn.call(this, "#btn-atualizar-tudo", "Atualizar Tudo", "Atualizando...", !this.buscando);
          promLancam = [];
          usuarios.forEach((id, i, arr) => {
            return promLancam.push(this.getLancamentos(id, inicio, fim));
          });
          return Promise.all(promLancam).then((lancamentos) => {
            this.lancamentosCollection.reset(_.without(_.flatten(lancamentos), void 0));
            this.resultModel.set("lancamentos", this.lancamentosCollection.toJSON());
            console.log(`Acabou... ${this.lancamentosCollection.length}`);
            this.salvar();
            this.buscando = false;
            return this.consolidaDados();
          });
        }

        getLancamentos(userID, inicio, fim) {
          return new Promise((resolve, reject) => {
            return $.get(`/timeentries?user=${userID}&inicio=${inicio}&fim=${fim}`, (lancamento) => {
              var promIssues;
              if (!(_.isEmpty(lancamento) || _.isEmpty(lancamento.time_entries))) {
                promIssues = [];
                lancamento.time_entries.forEach((time) => {
                  return promIssues.push(this.getIssue(time.issue.id));
                });
                return Promise.all(promIssues).then((issues) => {
                  issues.forEach((issue, j) => {
                    return console.log(lancamento.time_entries[j].issue = issue);
                  });
                  return resolve(lancamento.time_entries);
                });
              } else {
                console.log(`Usuário ${userID} sem lançamentos...`);
                return resolve();
              }
            }).fail((e) => {
              console.log(e);
              return reject(e);
            });
          });
        }

        getIssue(issueID) {
          return new Promise((resolve, reject) => {
            return $.get(`/redmine/issue?id=${issueID}`, (issue) => {
              var e;
              if (!(_.isEmpty(issue) || _.isEmpty(issue.issues))) {
                return resolve(issue.issues[0]);
              } else {
                console.log(e = `Chamado ${issueID} não encontrado...`);
                return reject(e);
              }
            }).fail((e) => {
              console.log(e);
              return reject(e);
            });
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

        /*
        Cria um objeto do tipo:
        dest:
        horas:
          Contrato: 2
          Investimento: 4
        componente:
          wms: 
        Contrato: 2
        Investimento: 4
        */
        _somaPorCustomFields(dest, lancamento, customFieldID) {
          var chamadosArr, componente, destChamados, destComponente, destHoras, horas, issue, key, objComp, ref, ref1, ref2, sistema;
          issue = lancamento.get("issue");
          horas = lancamento.get("hours");
          key = (ref = _.findWhere(issue.custom_fields, {
            id: customFieldID
          })) != null ? ref.value : void 0;
          destHoras = dest.horas || (dest.horas = {});
          if (!destHoras[key]) {
            destHoras[key] = horas;
          } else {
            destHoras[key] += horas;
          }
          destChamados = dest.chamados || (dest.chamados = {});
          chamadosArr = destChamados[key] || (destChamados[key] = []);
          if (!_.contains(chamadosArr, issue.id)) {
            chamadosArr.push(issue.id);
          }
          componente = (ref1 = _.findWhere(issue.custom_fields, {
            id: 52
          })) != null ? ref1.value : void 0;
          sistema = (ref2 = _.findWhere(issue.custom_fields, {
            id: 19
          })) != null ? ref2.value : void 0;
          if (sistema === "Demeter") {
            componente = "wms-demeter";
          }
          objComp = dest.componente || (dest.componente = {});
          destComponente = objComp[componente] || (objComp[componente] = {});
          if (!destComponente[key]) {
            return destComponente[key] = horas;
          } else {
            return destComponente[key] += horas;
          }
        }

        _somaUsuarioHoraDia(dest, lancamento) {
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
        }

        _somaUsuarioHoraCustoms(dest, lancamento) {
          var userName;
          userName = lancamento.get("user").name;
          if (dest[userName] == null) {
            dest[userName] = {
              origem: {},
              cliente: {},
              servico: {}
            };
          }
          this._somaPorCustomFields(dest[userName].origem, lancamento, 53);
          this._somaPorCustomFields(dest[userName].cliente, lancamento, 51);
          this._somaPorCustomFields(dest[userName].servico, lancamento, 58);
          return this._somaChamados(dest[userName], lancamento);
        }

        _somaChamados(dest, lancamento) {
          var issue;
          issue = lancamento.get("issue");
          if (!_.contains(dest.chamados || (dest.chamados = []), issue.id)) {
            return dest.chamados.push(issue.id);
          }
        }

        consolidaDados() {
          this.horaOrigem = {};
          this.horaGrupoCliente = {};
          this.horaTipoServico = {};
          this.usuarioHoraDia = {};
          this.usuarioHoraCustoms = {};
          this.totalChamados = {};
          this.lancamentosCollection.forEach((lancamento) => {
            this._somaPorCustomFields(this.horaOrigem, lancamento, 53);
            this._somaPorCustomFields(this.horaGrupoCliente, lancamento, 51);
            this._somaPorCustomFields(this.horaTipoServico, lancamento, 58);
            this._somaUsuarioHoraDia(this.usuarioHoraDia, lancamento);
            this._somaUsuarioHoraCustoms(this.usuarioHoraCustoms, lancamento);
            return this._somaChamados(this.totalChamados, lancamento);
          });
          this.render();
          this.renderGraficoUsuarioHoraDia();
          this.renderGraficosUsuarios();
          this.renderGraficoTotais(this.horaOrigem);
          return this.renderGraficoRadarTotais(this.horaOrigem);
        }

        salvar(e) {
          if (e != null) {
            e.preventDefault();
          }
          return this.resultModel.save(null, {
            success: function(mdl) {
              return alert("Resultado atualizado com sucesso!");
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
            labels = _.keys(data.horas);
            colors = this.getColors(labels);
            return new Chart(ctx, {
              type: 'pie',
              data: {
                labels: labels,
                datasets: [
                  {
                    data: _.values(data.horas),
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
          labels = _.keys(data.horas);
          colors = this.getColors(labels);
          return this.graficoPizza = new Chart(ctx, {
            type: 'pie',
            data: {
              labels: labels,
              datasets: [
                {
                  data: _.values(data.horas),
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
              this.renderGraficoTotais(this.horaOrigem);
              return this.renderGraficoRadarTotais(this.horaOrigem);
            case "tipo_servico":
              this.$("#grafico-modal-label").html("Hora X Tipo Serviço");
              this.renderGraficoTotais(this.horaTipoServico);
              return this.renderGraficoRadarTotais(this.horaTipoServico);
            case "grupo_cliente":
              this.$("#grafico-modal-label").html("Hora X Grupo Cliente");
              this.renderGraficoTotais(this.horaGrupoCliente);
              return this.renderGraficoRadarTotais(this.horaGrupoCliente);
          }
        }

        renderGraficoRadarTotais(data) {
          var ctx, datasets, labels, ref, subKeys;
          ctx = this.$("#chart-radar-generic-area");
          if ((ref = this.graficoRadar) != null) {
            ref.destroy();
          }
          labels = _.keys(data.componente);
          datasets = [];
          subKeys = [];
          _.each(data.componente, function(componente, key) {
            return subKeys = _.union(subKeys, _.keys(componente));
          });
          _.each(subKeys, (subKey) => {
            var color, colorTransp, dsData;
            dsData = [];
            _.each(data.componente, (componente) => {
              return dsData.push(componente[subKey] || 0);
            });
            color = this.getColors([subKey])[0];
            colorTransp = color.replace(")", ", 0.8)");
            return datasets.push({
              label: subKey,
              data: dsData,
              fill: false,
              pointRadius: 4,
              backgroundColor: colorTransp,
              borderColor: colorTransp,
              pointBackgroundColor: color,
              pointBorderColor: "#fff",
              pointHoverBackgroundColor: "#fff",
              pointHoverBorderColor: color
            });
          });
          return this.graficoRadar = new Chart(ctx, {
            type: 'radar',
            data: {
              labels: labels,
              datasets: datasets
            }
          });
        }

      };

      SprintResultadoView.prototype.el = ".mid-container";

      SprintResultadoView.prototype.template = _.template(template);

      SprintResultadoView.prototype.events = {
        "click #btn-atualizar-tudo": "atualizarTudo",
        "change .radio-grafico": "alterarGrafico"
      };

      return SprintResultadoView;

    }).call(this);
    return module.exports = SprintResultadoView;
  });

}).call(this);
