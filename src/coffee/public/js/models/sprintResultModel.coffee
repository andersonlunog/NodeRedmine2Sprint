define ["underscore"
  "backbone"
  "model"
], (_, Backbone, BaseModel) ->
  class SprintResultModel extends BaseModel
    defaults:
      sprintID: null
      lancamentos: []
    urlRoot: "/sprintResult"
  
  SprintResultModel