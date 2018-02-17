define ["underscore"
  "backbone"
  "model"
], (_, Backbone, BaseModel) ->
  class UsuarioRedmineModel extends BaseModel
    defaults:
      nome: ""
    urlRoot: "/usuarioRedmine"
  
  UsuarioRedmineModel