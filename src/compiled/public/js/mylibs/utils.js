(function() {
  define(["jquery", "enums/messageType"], function($, TipoMsg) {
    var ret;
    ret = {
      url: "/",
      post: function(data, local, success, error) {
        var that;
        that = this;
        return $.ajax({
          url: that.url + local,
          type: "POST",
          dataType: "json",
          
          //contentType: 'application/json',
          //crossDomain: true,
          cache: false,
          
          // timeout: 5000,
          data: data,
          success: success,
          error: error
        });
      },
      mostraMensagem: function(mensagem, tipo) {
        
        // if(tipo == TipoMsg.erro){}
        return alert(mensagem);
      },
      validaModelCampos: function(model, error) {
        var field, i, results;
        i = 0;
        results = [];
        while (i < error.length) {
          field = $("input[name=" + error[i].path + "]");
          if (i === 0) {
            field.focus();
          }
          field.parent().parent().addClass("error");
          field.parent().append($("<span class=\"help-inline\">" + error[i].message + "</span>"));
          results.push(i++);
        }
        return results;
      }
    };
    return ret;
  });

}).call(this);
