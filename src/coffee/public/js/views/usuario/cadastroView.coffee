define ["jquery"
	"underscore"
	"backbone"
	"text!templates/usuario/cadastro.html"
	"models/usuario/usuarioModel"
	"helpers/bindModelForm"
], ($, _, Backbone, Template, UsuarioModel, BindModelForm) ->
	class UsuarioView extends Backbone.View
		el: ".page"
		
		initialize: ->
			@model = new UsuarioModel
			@modelForm = new BindModelForm @model
			@model.on "change", @render, @

		render: ->
			that = this
			template = _.template(Template)
			$(@el).html template()
			@modelForm.fetchForm @options.id, ["senha"]

		events:
			"submit #frmUsuario": "submit"

		submit: (event) ->
			@modelForm.saveForm()
			event.preventDefault()

	UsuarioView
