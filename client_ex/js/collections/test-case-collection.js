var app = app || {};

(function () {
  'use strict';

  app.TestCaseCollection = Backbone.Collection.extend({
    model: app.TestCaseModel,

    // Save all of the todo items under this example's namespace.
    localStorage: new Backbone.LocalStorage('test-cases-backbone'),

    // We keep the Todos in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    nextOrder: function () {
      return this.length ? this.last().get('order') + 1 : 1;
    },

    // Todos are sorted by their original insertion order.
    comparator: 'order'
  });
})();
