define ["jquery"
	"underscore"
	"backbone"
	"text!templates/usuario/lista.html"
	"models/usuario/usuarioCollection"
], ($, _, Backbone, Template, UsuarioCollection) ->
	class UsuariosView extends Backbone.View
		el: ".page"		
		template: _.template Template
		
		initialize: ->
			@collection = new UsuarioCollection
			@collection.fetch
				success: (collection, response) =>
					@collection.reset response
					@render()
				error: (e) ->
					alert JSON.stringify e

			@collection.on "remove", @render, @

		render: ->
			@$el.html @template usuarios : @collection.models

			that = @
			$(".btn-delete").click ()->
				if $(@).data("id")
					that.collection.remove $(@).data("id")

			$("#btn-salvar").click ()->
				that.collection.save()

	UsuariosView