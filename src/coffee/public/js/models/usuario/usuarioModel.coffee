define ["underscore"
	"backbone"
	"model"
], (_, Backbone, BaseModel) ->
	class UsuarioModel extends BaseModel
		defaults:
			nome: ""
			email: ""
			senha: ""
			confirmacaoSenha: ""
		urlRoot: "/usuario"
	
	UsuarioModel