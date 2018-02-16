define ["underscore"
  "backbone"
  "model"
], (_, Backbone, BaseModel) ->
  class UsuarioRedmineModel extends BaseModel
    defaults:
      id: ""
      nome: ""
    urlRoot: "/usuarioRedmine"
  
  UsuarioRedmineModel