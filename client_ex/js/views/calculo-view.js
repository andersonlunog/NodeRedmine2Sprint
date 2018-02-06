var app = app || {};

(function ($) {
  'use strict';

  app.CalculoView = Backbone.View.extend({

    el:  '.test-case-container',

    // template: _.template($('#item-template').html()),

    events: {
      'click .btn-cancelar': 'cancelar',
      'click .btn-salvar': 'salvar'
    },

    initialize: function () {
      
    },

    render: function () {

      return this;
    },

    cancelar: function(e) {
      e.preventDefault();

      window.location = "#" + this.tipo;
    }
  });
})(jQuery);
