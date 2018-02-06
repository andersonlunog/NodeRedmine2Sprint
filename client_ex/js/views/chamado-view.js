var app = app || {};

(function ($) {
  'use strict';

  app.ChamadoView = Backbone.View.extend({
    tagName:  'tr',

    // template: _.template($('#item-template').html()),

    events: {
      'click .btn-action-calcular': 'calcular',
      'click .btn-action-edit': 'editCase',
      'click .btn-action-remove': 'removeCase',
      'click .btn-action-up': 'upCase',
      'click .btn-action-add-basead': 'addBasead',
      'click .btn-action-add-basead-below': 'addBaseadBelow',
      'click .btn-colorir': 'colorir'
    },

    initialize: function (options) {
      this.$table = options.targetTable;
      this.tipo = options.tipo;
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },

    render: function () {

      this.$el.empty();
      var obj = this.model.toJSON();
      delete obj.id;
      this.createTable(this.$table, obj, this.$el);

      var _this = this;
      this.$("td.cell_ativo").css("cursor", "pointer").click(function(e) {
        e.preventDefault();
        _this.model.set("ativo", !_this.model.get("ativo"));
      });

      this.$el.prepend('<td>\
                        <div class="dropdown">\
                          <button class="btn btn-acoes btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">\
                            <span class="glyphicon glyphicon-option-horizontal" aria-hidden="true"></span>\
                          </button>\
                          <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">\
                            <li><a class="btn-action-calcular" href="#">Calcular</a></li>\
                            <li><a class="btn-action-edit" href="#">Editar</a></li>\
                            <li><a class="btn-action-add-basead" href="#">Adicionar baseado neste</a></li>\
                            <li><a class="btn-action-add-basead-below" href="#">Adicionar abaixo baseado neste</a></li>\
                            <li><a class="btn-action-add-below" href="#" style="display: none;">Adicionar abaixo</a></li>\
                            <li><a class="btn-action-add-above" href="#" style="display: none;">Adicionar acima</a></li>\
                            <li><a class="btn-action-duplicate" href="#" style="display: none;">Duplicar</a></li>\
                            <li><a class="btn-action-copy" href="#" style="display: none;">Copiar</a></li>\
                            <li><a class="btn-action-past-above" href="#" style="display: none;">Colar acima</a></li>\
                            <li><a class="btn-action-past-below" href="#" style="display: none;">Colar abaixo</a></li>\
                            <li><a class="btn-action-up" href="#">Subir</a></li>\
                            <li role="separator" class="divider"></li>\
                            <li><a class="btn-action-remove" href="#">Remover</a></li>\
                            <li role="separator" class="divider"></li>\
                            <li><a class="btn-colorir" href="#" style="color:#eac4b6">Colorir</a></li>\
                            <li><a class="btn-colorir" href="#" style="color:#fdfdc2">Colorir</a></li>\
                            <li><a class="btn-colorir" href="#" style="color:#b5ecfb">Colorir</a></li>\
                            <li><a class="btn-colorir" href="#" style="color:#c0efc0">Colorir</a></li>\
                            <li><a class="btn-colorir" href="#" style="color:white">Colorir</a></li>\
                          </ul>\
                        </div>\
                      </td>');

      return this;
    },

    createTable: function($target, obj, $btr) {
      var newTable = $target[0].tagName.toUpperCase() != "TABLE";
      var $table;

      if (newTable) {
        $table = $("<table class=\"table table-bordered table-json table-interna\">\
          <thead>\
            <tr></tr>\
          </thead>\
          <tbody></tbody>\
        </table>");

        $target.html($table);
        var $htr = $table.find("thead:first tr");

        $table.closest("td").css("padding", 0);
      } else {
        $table = $target;
      }

      $btr = $btr || $("<tr></tr>");
      if (!$table.find($btr).length) $table.find("tbody:first").append($btr);
      var _this = this;
      
      _.each(obj, function(val, key) {
        if (newTable)
          $htr.append("<th>" + key + "</th>");
        var $td = $("<td class='cell_" + key + "'></td>");
        $btr.append($td);

        if (_.isObject(val) && !_.isArray(val)) {
          _this.createTable($td, val);
        } else if (_.isArray(val) && val.length > 0 && _.isObject(val[0]) && !_.isArray(val[0])) {
          var $tableArr;
          for (var i = 0; i < val.length; i++) {
            if (i == 0) {
              $tableArr = _this.createTable($td, val[i]);
            } else {
              _this.createTable($tableArr, val[i]);
            }
          }
        } else if (val != null) {
          if (_.isNumber(val) && val < 0)
            $td.css("color", "red");

          var str = _.isArray(val) ? val.join("<br>") : val.toString();
          $td.append(str);
        }
      });

      return $table;
    },

    upCase: function (e) {      
      e.preventDefault();
      var collection = this.model.collection;
      var idx = collection.indexOf(this.model);
      if (idx > 0)
      {
        var mdlAnterior = collection.at(idx - 1);
        collection.remove(mdlAnterior);
        collection.add(mdlAnterior, {at: idx});
      }
    },

    removeCase: function (e) {
      e.preventDefault();
      if (window.confirm("Deseja realmente excluir o registro?"))
        this.model.destroy();
    },

    editCase: function (e) {
      e.preventDefault();
      window.location.hash = "#edit/" + this.tipo + "/" + this.model.cid;
    },

    addBasead: function (e) {
      e.preventDefault();
      window.location.hash = "#new/" + this.tipo + "/" + this.model.cid;
    },

    addBaseadBelow: function (e) {
      e.preventDefault();
      window.location.hash = "#new-below/" + this.tipo + "/" + this.model.cid;
    },

    colorir: function (e) {
      e.preventDefault();
      var color = $(e.target).css("color");
      $(e.target).closest("tr").css("background-color", color);
    },

    calcular: function (e) {
      e.preventDefault();
      window.location.hash = "#calcular/" + this.tipo + "/" + this.model.cid;
    }
  });
})(jQuery);
