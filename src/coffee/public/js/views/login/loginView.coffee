define ["jquery"
"underscore"
"backbone"
"text!templates/login/login.html"
"helpers/message"
"enums/messageType"
], ($, _, Backbone, LoginTemplate, MessageHelper, TipoMsg) ->
	class Login extends Backbone.View

		el: ".page"

		template: _.template LoginTemplate

		initialize: ->

		render: ->
			@$el.html @template()

		
		# $(@.el).find('#frmLogin').submit(function(){
		# 	if(!that.validarCampos())	
		# 		window.location.hash = '#/sucesso';
		# 	return false;
		# });
		events:
			"submit #frmLogin": "login"
			"click #btnVer": "loginVerify"
			"click #btnLogout": "logout"
			"click #btnCadastrar": "cadastrar"

		testeSessao: (event) ->
			$.post("/sessao", data, (data)->
				alert data.msg
			).fail () ->				
					alert "erro"

		login: (event) ->
			login =
				email: $("#inputEmail").val()
				senha: $("#inputPassword").val()

			$.post("/login", login, (data, status, request) ->
				console.log data
				alert "Autenticado"
			).fail (request, status, error) ->
				console.log request, status, error
				MessageHelper.show request.responseText, TipoMsg.erro

			event.preventDefault()

		cadastrar: ->
			window.location.hash = "#/usuario"

		loginVerify: (event) ->
			$.post("/ver",
				teste: "qualquer coisa"
			, (data, status, request) ->
				console.log data.msg
			).fail (request, status, error) ->
				console.log "erro"

		logout: (event) ->
			$.post("/logout", {},
			(data, status, request) ->
				console.log data.msg
			).fail (request, status, error) ->
				console.log "erro"

		validarCampos: ->
			erro = undefined
			@$el.find("input").each (index) ->
				$(@).parent().find(".help-inline").detach()
				if $(@).val() is ""
					$(@).parent().parent().addClass "error"
					$(@).parent().append "<span class=\"help-inline\">Campo requerido</span>"
					erro = true
				else
					$(@).parent().parent().removeClass "error"

			erro
	
	Login
