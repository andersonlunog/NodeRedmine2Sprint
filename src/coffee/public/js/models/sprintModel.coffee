define ["underscore"
  "backbone"
  "model"
], (_, Backbone, BaseModel) ->
  class SprintModel extends BaseModel
    defaults:
      nome: ""
      inicio: ""
      fim: ""
    urlRoot: "/sprint"
  
  SprintModel