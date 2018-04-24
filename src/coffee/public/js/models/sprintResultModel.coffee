define ["underscore"
  "backbone"
  "model"
], (_, Backbone, BaseModel) ->
  class SprintResultModel extends BaseModel
    defaults:
      lancamentos: []
    urlRoot: "/sprintResult"
  
  SprintResultModel