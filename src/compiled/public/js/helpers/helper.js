(function() {
  define(function(require, exports, module) {
    var $, _;
    _ = require("underscore");
    $ = require("jquery");
    exports.post = function(url, data, callback, error) {
      if (error == null) {
        error = function(jqXHR, textStatus) {
          return console.log("Erro chamada de serviço: ", jqXHR.responseText, jqXHR.status, jqXHR.statusText, textStatus);
        };
      }
      return $.post(url, data, callback, "json").fail(error);
    };
    exports.aguardeBtn = function(btnSel, labelEnabled, labelDisabled, enabled) {
      if (enabled) {
        return this.$(`${btnSel}`).html(labelEnabled).attr("disabled", false);
      } else {
        return this.$(`${btnSel}`).html(labelDisabled).attr("disabled", true).append(" <span class=\"glyphicon glyphicon-refresh\" aria-hidden=\"true\"></span>");
      }
    };
  });

}).call(this);
