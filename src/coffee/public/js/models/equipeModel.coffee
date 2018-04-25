define ["underscore"
  "backbone"
  "model"
], (_, Backbone, BaseModel) ->
  class EquipeModel extends BaseModel
    defaults:
      nome: ""
      usuarios: []
    urlRoot: "/equipe"
  
  EquipeModel