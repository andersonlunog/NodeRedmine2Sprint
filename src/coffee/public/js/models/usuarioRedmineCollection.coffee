define ["underscore"
  "backbone"
  "collection"
  "models/usuarioRedmineModel"
], (_, Backbone, BaseCollection, UsuarioRedmineModel) ->
  class UsuarioRedmineCollection extends BaseCollection
    model: UsuarioRedmineModele
    url: "/usuariosRedmine"

  UsuarioRedmineCollection