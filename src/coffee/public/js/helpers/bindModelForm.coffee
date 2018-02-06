define ["underscore"
	"backbone"
	"jquery"
	"helpers/message"
	"enums/messageType"
], (_, Backbone, $, MsgHelper, MsgType) ->
	
	class BindModelForm
		
		constructor: (@model)	->
		
		fetchForm: (id, exceptions) ->			
			return unless id
			@model.set "_id", id
			@model.fetch
				success: (model) =>
					for key, value of model.attributes
						continue if exceptions and key in exceptions
						$("input[name=#{key}]").val value

		saveForm: ->
			$(".error").removeClass "error"
			$(".help-inline").detach()
			newModel = {}
			
			for attr of @model.attributes
				newModel[attr] = $("input[name=#{attr}]").val() if $("input[name=#{attr}]").length

			return unless Object.keys(newModel).length
			@model.set newModel			
			@saveModel()

		saveModel: ->
			@model.save `undefined`,
				wait: true
				success: (model, response) ->
					# console.log "sucesso save", model, response
					MsgHelper.show "Usuário registrado com sucesso.", MsgType.sucesso

				error: (model, error) ->
					# console.log "erro", model, JSON.parse error.responseText					
					return unless error.responseText
					err = JSON.parse error.responseText
					if err.errors
						errors = _.map err.errors, (val, prop) ->
							val
						MsgHelper.validateMessages model, errors
					else if err.err
						MsgHelper.show err.err, MsgType.erro

					# MsgHelper.mostraMensagem "Erro de conexão com o servidor.", MsgType.erro  if error.statusText and error.statusText is "error"

			
			# that.model.clear({
			# 	silent: true
			# });
	
	BindModelForm