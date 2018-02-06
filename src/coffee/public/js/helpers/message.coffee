define ["jquery", "enums/messageType"], ($, MsgType) ->
	ret =		
		show: (message, type) ->
			
			# if(tipo == TipoMsg.erro){}
			alert message

		validateMessages: (model, errors) ->
			for err in errors
				field = $("input[name=" + err.path + "]")
				# field.focus()  if i is 0
				field.parent().parent().addClass "error"
				field.parent().append $("<span class=\"help-inline\">" + err.message + "</span>")

	ret