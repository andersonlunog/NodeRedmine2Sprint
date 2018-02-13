define (require, exports, module) ->  
  _ = require "underscore"
  $ = require "jquery"

  exports.post = (url, data, callback, error)->
    unless error?
      error = (jqXHR, textStatus)->
        console.log "Erro chamada de serviço: ", jqXHR.responseText, jqXHR.status, jqXHR.statusText, textStatus
        
    $.post(url, data, callback, "json").fail error

  return