(function() {
  define(["jquery", "enums/messageType"], function($, MsgType) {
    var ret;
    ret = {
      show: function(message, type) {
        
        // if(tipo == TipoMsg.erro){}
        return alert(message);
      },
      validateMessages: function(model, errors) {
        var err, field, i, len, results;
        results = [];
        for (i = 0, len = errors.length; i < len; i++) {
          err = errors[i];
          field = $("input[name=" + err.path + "]");
          // field.focus()  if i is 0
          field.parent().parent().addClass("error");
          results.push(field.parent().append($("<span class=\"help-inline\">" + err.message + "</span>")));
        }
        return results;
      }
    };
    return ret;
  });

}).call(this);
