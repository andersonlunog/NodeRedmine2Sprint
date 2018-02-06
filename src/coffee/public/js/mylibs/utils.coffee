define ["jquery", "enums/messageType"], ($, TipoMsg) ->
	ret =
		url: "/"
		post: (data, local, success, error) ->
			that = this
			$.ajax
				url: that.url + local
				type: "POST"
				dataType: "json"
				
				#contentType: 'application/json',
				#crossDomain: true,
				cache: false
				
				# timeout: 5000,
				data: data
				success: success
				error: error


		mostraMensagem: (mensagem, tipo) ->
			
			# if(tipo == TipoMsg.erro){}
			alert mensagem

		validaModelCampos: (model, error) ->
			i = 0

			while i < error.length
				field = $("input[name=" + error[i].path + "]")
				field.focus()  if i is 0
				field.parent().parent().addClass "error"
				field.parent().append $("<span class=\"help-inline\">" + error[i].message + "</span>")
				i++

	ret