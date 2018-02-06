var app = app || {};

(function ($) {
  'use strict';

  if (app.schemas == null)
    app.schemas = {};
  
  app.schemas["parametros-calculo"] = {
    "type": "object",
    "title": "Parâmetros para Cáclulos",
    "properties": {
      "dataCalculo": {
        "type": "string",
        "format": "date"
      },
      "servicos": {
        "type": "array",
        "format": "table",
        "items": {
          "type": "object",
          "properties": {
            "servicosPeriodicos": {
              "type": "array",
              "format": "table",
              "items": {
                "type": "object",
                "properties": {
                  "servico": {
                    "type": "string",
                    "enum": app.tiposServico
                  },
                  "tipoCobranca": {
                    "type": "string",
                    "enum": app.tiposCobranca
                  },
                  "tipoCarencia": {
                    "type": "string",
                    "enum": app.tiposCarencia
                  },
                  "carencia": {
                    "type": "integer"
                  },
                  "dataCarenciaFixa": {
                    "type": "string",
                    "format": "date"
                  },
                  "valor": {
                    "type": "string"
                  }
                }
              }
            },
            "servicosRecepcao": {
              "type": "array",
              "format": "table",
              "items": {
                "type": "object",
                "properties": {
                  "servico": {
                    "type": "string",
                    "enum": app.tiposServicoOcorrencia
                  },
                  "tipoEstoque": {
                    "type": "string",
                    "enum": app.tiposEstoque
                  },
                  "valor": {
                    "type": "string"
                  },
                  "fixo": {
                    "type": "boolean",
                    "format": "checkbox"
                  }
                }
              }
            },
            "servicosExpedicao": {
              "type": "array",
              "format": "table",
              "items": {
                "type": "object",
                "properties": {
                  "servico": {
                    "type": "string",
                    "enum": app.tiposServicoOcorrencia
                  },
                  "tipoEstoque": {
                    "type": "string",
                    "enum": app.tiposEstoque
                  },
                  "valor": {
                    "type": "string"
                  },
                  "fixo": {
                    "type": "boolean",
                    "format": "checkbox"
                  }
                }
              }
            }
          }
        }
      },
      "entradas": {
        "type": "array",
        "format": "table",
        "items": {
          "type": "object",
          "properties": {
            "dataEntrada": {
              "type": "string",
              "format": "date"
            },
            "dataAcobertamento": {
              "type": "string",
              "format": "date"
            },
            "estoquesQtd": {
              "type": "array",
              "format": "table",
              "items": {
                "type": "string"
              }
            },
            "classificacoes": {
              "type": "array",
              "format": "table",
              "items": {
                "type": "object",
                "properties": {
                  "tipo": {
                    "type": "string",
                    "enum": app.tiposClassificacao
                  },
                  "valor": {
                    "type": "number"
                  }
                }
              }
            }
          }
        }
      },
      "saidas": {
        "type": "array",
        "format": "table",
        "items": {
          "type": "object",
          "properties": {
            "data": {
              "type": "string",
              "format": "date"
            },
            "estoquesQtd": {
              "type": "array",
              "format": "table",
              "items": {
                "type": "string"
              }
            },
            "classificacoes": {
              "type": "array",
              "format": "table",
              "items": {
                "type": "object",
                "properties": {
                  "tipo": {
                    "type": "string",
                    "enum": app.tiposClassificacao
                  },
                  "valor": {
                    "type": "number"
                  }
                }
              }
            }
          }
        }
      }
    }
  }
})(jQuery);