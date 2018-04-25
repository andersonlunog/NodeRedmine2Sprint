define (require, exports, module) ->  
  _ = require "underscore"
  $ = require "jquery"

  exports.post = (url, data, callback, error)->
    unless error?
      error = (jqXHR, textStatus)->
        console.log "Erro chamada de serviço: ", jqXHR.responseText, jqXHR.status, jqXHR.statusText, textStatus
        
    $.post(url, data, callback, "json").fail error

  exports.aguardeBtn = (btnSel, labelEnabled, labelDisabled, enabled)->
    if enabled
      @$("#{btnSel}").html(labelEnabled).attr "disabled", false
    else
      @$("#{btnSel}").html(labelDisabled).attr("disabled", true).append """ <span class="glyphicon glyphicon-refresh" aria-hidden="true"></span>"""

  exports.trClick = (e)->
    target = @$(e.target)
    chk = target.closest("tr").find("input:checkbox")
    return if chk[0] is target[0]
    chk.prop("checked", !chk.is(":checked"))
    chk.trigger "change"

  return
