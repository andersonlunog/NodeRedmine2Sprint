(function() {
  var indexOf = [].indexOf;

  define(["underscore", "backbone", "jquery", "helpers/message", "enums/messageType"], function(_, Backbone, $, MsgHelper, MsgType) {
    var BindModelForm;
    BindModelForm = class BindModelForm {
      constructor(model1) {
        this.model = model1;
      }

      fetchForm(id, exceptions, success, error) {
        if (!id) {
          return;
        }
        this.model.set("_id", id);
        return this.model.fetch({
          success: (model) => {
            var key, ref, value;
            ref = model.attributes;
            for (key in ref) {
              value = ref[key];
              if (exceptions && indexOf.call(exceptions, key) >= 0) {
                continue;
              }
              $(`input[name=${key}]`).val(value);
            }
            return typeof success === "function" ? success() : void 0;
          },
          error: function(err) {
            return typeof error === "function" ? error() : void 0;
          }
        });
      }

      saveForm() {
        var attr, newModel;
        $(".error").removeClass("error");
        $(".help-inline").detach();
        newModel = {};
        for (attr in this.model.attributes) {
          if ($(`input[name=${attr}]`).length) {
            newModel[attr] = $(`input[name=${attr}]`).val();
          }
        }
        if (!Object.keys(newModel).length) {
          return;
        }
        this.model.set(newModel);
        return this.saveModel();
      }

      saveModel() {
        return this.model.save(undefined, {
          wait: true,
          success: function(model, response) {
            // console.log "sucesso save", model, response
            return MsgHelper.show("Usuário registrado com sucesso.", MsgType.sucesso);
          },
          error: function(model, error) {
            var err, errors;
            // console.log "erro", model, JSON.parse error.responseText          
            if (!error.responseText) {
              return;
            }
            err = JSON.parse(error.responseText);
            if (err.errors) {
              errors = _.map(err.errors, function(val, prop) {
                return val;
              });
              return MsgHelper.validateMessages(model, errors);
            } else if (err.err) {
              return MsgHelper.show(err.err, MsgType.erro);
            }
          }
        });
      }

    };
    // MsgHelper.mostraMensagem "Erro de conexão com o servidor.", MsgType.erro  if error.statusText and error.statusText is "error"

    // that.model.clear({
    //   silent: true
    // });
    return BindModelForm;
  });

}).call(this);
