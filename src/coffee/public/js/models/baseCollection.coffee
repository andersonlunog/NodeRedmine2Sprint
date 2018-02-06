define ["underscore"
	"backbone"
], (_, Backbone) ->
	class BaseCollection extends Backbone.Collection
		modelsChanged: []

		initialize: ->
			@modelsChanged = []			
			@bind "remove", (model) =>
				@modelsChanged.push
					method: "remove"
					model: model
			@bind "add", (model) =>
				@modelsChanged.push
					method: "add"
					model: model

		save: ->
			for changed in @modelsChanged
				changed.model.destroy() if changed.method is "remove"
				changed.model.save() if changed.method is "add"
			@modelsChanged = []
			
	BaseCollection