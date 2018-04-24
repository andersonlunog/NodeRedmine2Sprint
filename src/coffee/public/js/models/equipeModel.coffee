define ["underscore"
  "backbone"
  "model"
], (_, Backbone, BaseModel) ->
  class UsuarioRedmineModel extends BaseModel
    defaults:
      redmineID: null
      nome: ""
    urlRoot: "/usuarioRedmine"
  
  UsuarioRedmineModel