mongoose = require('mongoose')
Schema = mongoose.Schema

sprintSchema = new Schema
  nome: String
  inicio: String
  fim: String
  usuarios: Array
    # redmineID: Number
    # horasPorDia: Number
    # diasAusencia: Number
  chamadosPlanejadosTxt: String
  statusAbertos: Array # Status das tarefas que são considerados abertos.
  tarefas: Array
    # chamadoNumero: Number
    # chamadoDescricao: String
    # chamadoFechado: Boolean
    # chamadoOrigem: String
    # chamadoGrupoCliente: String
    # chamadoTipoServico: String
    # chamadoComponente: String
    # chamadoTempoGasto: Boolean
    # chamadoTempoEstimado: Boolean
    # chamadoStatus: Boolean
    # data: String # Data do lançamento da hora
    # usuarioNome: String
    # usuarioRedmineID: Number
    # planejado: Boolean
    # entregue: Boolean
  fatorFoco: Number
  diasUteis: Number
  impedimentos: Array
    # data: String
    # usuarioNome: String
    # descricao: String
  retrospectiva: String


module.exports = mongoose.model('Sprint', sprintSchema)