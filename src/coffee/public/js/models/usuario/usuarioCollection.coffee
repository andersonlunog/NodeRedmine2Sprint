define ["underscore"
	"backbone"
	"collection"
	"models/usuario/usuarioModel"
], (_, Backbone, BaseCollection, UsuarioModel) ->
	class UsuarioCollection extends BaseCollection
		model: UsuarioModel
		url: "/usuarios"

	UsuarioCollection