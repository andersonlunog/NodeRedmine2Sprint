var app = app || {};

(function ($) {
  'use strict';

  app.TestCaseEditorView = Backbone.View.extend({

    el:  '.test-case-container',

    // template: _.template($('#item-template').html()),

    events: {
      'click .btn-cancelar': 'cancelar',
      'click .btn-salvar': 'salvar'
    },

    initialize: function () {
      JSONEditor.plugins.selectize.enable = true;
      // JSONEditor.plugins.select2.width = "300px";
    },

    render: function () {

      this.$el.html('<div id="editor_holder"></div>\
        <div class="modal-footer" style="border-top: 0;">\
          <a class="btn btn-default btn-cancelar" href="#">Cancelar</a>\
          <button type="button" class="btn btn-primary btn-salvar">Salvar</button>\
        </div>');

      if (this.editor)
        this.editor.destroy()

      this.createEditor();

      return this;
    },

    createEditor: function() {
      this.editor = new JSONEditor(this.$('#editor_holder')[0], {
        schema: this.getSchema(),
        theme: "bootstrap3",
        iconlib: "bootstrap3",
        disable_properties: true,
        disable_array_delete_last_row: true,
      });

      var _this = this;
      this.editor.on("ready", function(){
        if (_this.model) {
          var obj = _this.model.toJSON();
          delete obj.id;
          _this.editor.setValue(obj);
        }
      });
    },

    salvar: function(e) {
      e.preventDefault();

      if (!this.validar()) return;

      if (this.model) {
        this.model.set(this.editor.getValue());
      } else {
        this.model = new app.TestCaseModel(this.editor.getValue());
      }

      var collOption = {remove: false};
      if (this.addAt != null) 
        collOption["at"] = this.addAt;

      app.appView.collection.set(this.model, collOption);
      // this.model.save();

      this.addAt = null;

      window.location = "#" + this.tipo;
    },

    cancelar: function(e) {
      e.preventDefault();

      window.location = "#" + this.tipo;
    },

    validar: function() {
      if (this.tipo == "calculo-servico") {
        var obj = this.editor.getValue();

        //O total dos acobertamentos deve ser igual a soma do físico fiscal
        var valorAcobertamentos = _.reduce(obj.recepcoes, function(mem, recep) { return mem + (recep.acobertamento > 0 ? recep.acobertamento : recep.pesoBruto); }, 0);
        for (var i = 0; i < obj.calculos.length; i++) {
          var calculo = obj.calculos[i];
          var valorFisicoFiscal = _.reduce(calculo.saldoEsperadoPorContrato, function(mem, saldo) { return mem + saldo.fisicoFiscal; }, 0);
          if (valorAcobertamentos != valorFisicoFiscal) {
            return window.confirm("A soma dos saldos físico/fiscal não é igual à soma dos acobertamentos. \r\nDeseja continuar mesmo assim?");
          }
        }
      }
      return true;
    },

    getSchema: function() {
      if(this.tipo)
        return app.schemas[this.tipo];
    }
  });
})(jQuery);
