var app = app || {};

(function ($) {
  'use strict';

  app.CalculoUtil = {
    calcular: function(params) {
      var resultados = [];
      // var datasIdxEntradas = _.reduce(params.entradas, function(memo, entrada, i) { 
      //   if (memo[entrada.dataEntrada])
      //     memo[entrada.dataEntrada].put(i);
      //   else
      //     memo[entrada.dataEntrada] = [i];
      //   return memo;
      // }, {});

      var dtInicio = new Date(params.entradas[0].dataEntrada);
      var dtFim = new Date(params.dataCalculo);

      while(dtInicio <= dtFim) {
        var entradas = _.filter(params.entradas, function(itm) { return new Date(itm.dataEntrada) <= dtInicio; });
        _.each(entradas, function(entrada) {
          if(entrada.dataEntrada == dtInicio) {
            aplicarServicosOcorrencia(entrada, params.servicosRecepcao, resultados);
          }
          aplicarServicosPeriodicos(entrada, params.servicosPeriodicos, resultados)
        });
        dtInicio.setDate(dtInicio.getDate() + 1);
      }
    },

    aplicarServicosPeriodicos: function(entrada, servicosPeriodicos, resultados) {
      // "servicosPeriodicos": {
      //       "servico": {
      //         "type": "string",
      //         "enum": app.tiposServico
      //       },
      //       "tipoCobranca": {
      //         "type": "string",
      //         "enum": app.tiposCobranca
      //       },
      //       "tipoCarencia": {
      //         "type": "string",
      //         "enum": app.tiposCarencia
      //       },
      //       "carencia": {
      //         "type": "integer"
      //       },
      //       "dataCarenciaFixa": {
      //         "type": "string",
      //         "format": "date"
      //       },
      //       "valor": {
      //         "type": "string"
      //       }
      _.each(entrada.estoquesQtd, function(estoqueQtd) {
        
      });
    },

    aplicarServicosOcorrencia: function(entrada, servicos, resultados) {
      _.each(entrada.estoquesQtd, function(estoqueQtd) {
        _.each(entrada.classificacoes, function(classificacao) {
          // "tipo": {
          //   "type": "string",
          //   "enum": app.tiposClassificacao
          // },
          // "valor": {
          //   "type": "number"
          // }
          _.each(servicos, function(servico) {
            // if(servico.tipoEstoque == classificacao.tipo) {
            //   var qtd = estoqueQtd / 1000;
            //   var valor = 0d;
            //   if (servico.fixo)
            //     valor = servico.valor;
            //   else
            //      servico.valor
            // }            

            // "servico": {
            //     "type": "string",
            //     "enum": app.tiposServicoOcorrencia
            //   },
            //   "tipoEstoque": {
            //     "type": "string",
            //     "enum": app.tiposEstoque
            //   },
            //   "valor": {
            //     "type": "string"
            //   },
            //   "fixo": {
            //     "type": "boolean",
            //     "format": "checkbox"
            //   }
          });
        });
      });      
    },

    pegaDatas: function(params) {
      
    }
  }

})(jQuery);
