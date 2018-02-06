var app = app || {};

(function ($) {
  'use strict';

  app.AppView = Backbone.View.extend({

    el: 'body',

    // statsTemplate: _.template($('#stats-template').html()),

    events: {
      'click .btn-buscar': 'buscar',
      // 'click .btn-add-new': 'createNew',
      // 'click .btn-import': 'clickImportFile',
      // 'click .btn-export': 'exportFileJson',
      // 'change .input-file': 'importFileJson',
      // 'click .btn-nfe-infos': 'nfeInfos',
      // 'click .btn-classificacoes-infos': 'classifInfos'
    },

    tipo: "parametros-calculo",

    initialize: function () {
      app.appView = this;
      this.collection = new app.ChamadoCollection();
      this.listenTo(this.collection, 'add', this.addNewLine);
      // this.listenTo(this.collection, 'add change reset', this.calcularSaldosNotas);
      this.listenTo(this.collection, 'reset', this.renderAllTable);

      this.$table = $(".table-json-root");

      // this.collection.fetch({reset: true});
    },

    render: function () {
      this.renderAllTable();
      // this.$(".tipos-menu li").removeClass("active");
      // this.$(".tipos-menu ." + this.tipo).addClass("active");
    },

    setTipo: function (tipo) {
      // this.tipo = tipo;
      // if ((this.collection = this.collections[tipo]) == null) {
      //   this.collection = this.collections[tipo] = new app.TestCaseCollection();
      //   this.listenTo(this.collection, 'add', this.addNewLine);
      //   this.listenTo(this.collection, 'add change reset', this.calcularSaldosNotas);
      //   this.listenTo(this.collection, 'reset', this.renderAllTable);
      // }
    },

    buscar: function (e) {
      e.preventDefault();
      var _this = this;

      var issuesList = this.$("#txt-chamados").val();
            
      var issuesArr = issuesList.split(/[^\d]/);

      _.each(issuesArr, function(issue) {
        if (!issue)
          return;

        console.log("Buscando" + issue);
        _this.buscaIssue(issue);
      });
    },

    buscaIssue: function (id) {
      var redmine = {
        user: "anogueira",
        pass: "Master.007,1",
        host: "siacon.redmineup.com"
      };
      var auth = 'Basic ' + btoa(redmine.user + ':' + redmine.pass);
      //var auth = "Basic YW5vZ3VlaXJhOk1hc3Rlci4wMDcsMQ==";

      var jqxhr = $.ajax({
        url: "https://" + redmine.host + "/issues/" + id + ".json",
        type: "GET",
        contentType: "application/json",
        dataType: "jsonp",
        beforeSend: function( xhr ) {
          xhr.setRequestHeader("Authorization", auth);
        }
      })
        .done(function() {
          alert( "success" );
        })
        .fail(function() {
          alert( "error" );
        })
        .always(function() {
          alert( "complete" );
        });

      // var auth, redmineReq;
      //   console.log("Fazendo a requisição...");
      //   redmineReq = https.request({
      //     host: environment.redmine.host,
      //     port: 443,
      //     path: `/issues/${issue}.json`,
      //     method: 'GET',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       "Authorization": auth
      //     }
      //   // agent: false  # create a new agent just for this one request
      //   }, (redmineRes) => {
      //     redmineRes.setEncoding("utf8");
      //     if (redmineRes.statusCode !== 200) {
      //       console.log("statusCode:", redmineRes.statusCode);
      //       console.log("headers:", redmineRes.headers);
      //       if (typeof callback === "function") {
      //         callback(null, redmineRes.statusCode);
      //       }
      //     }
      //     redmineRes.on("data", (d) => {
      //       var obj;
      //       obj = JSON.parse(d);
      //       console.log(obj.issue.id);
      //       console.log(JSON.stringify(obj, null, 2));
      //       return typeof callback === "function" ? callback(obj, 200) : void 0;
      //     });
      //     // process.stdout.write(obj);
      //     return redmineRes.on("end", () => {
      //       return console.log("Acabou");
      //     });
      //   });
      //   redmineReq.on("error", (e) => {
      //     console.error(e);
      //     return typeof error === "function" ? error(e) : void 0;
      //   });
      //   redmineReq.end();
    },

    createTableHeaders: function() {
      if (this.collection.length == 0)
        return;

      var obj = this.collection.at(0).toJSON();

      var $htr = this.$table.find("thead:first tr");
      $htr.empty();
      $htr.append("<th>#</th><th>Titulo</th>");
    },

    createNew: function(e) {
      e.preventDefault();
      window.location.hash = "#new/" + this.tipo;
    },

    addNewLine: function (testCase) {
      var view = new app.ChamadoView({ model: testCase, targetTable: this.$table, tipo: this.tipo });
      view.render();
    },

    renderAllTable: function () {
      this.$table = $('\
        <form role="form">\
          <div class="form-group">\
            <label for="txt-chamados">Chamados</label>\
            <input type="text" class="form-control" id="txt-chamados" placeholder="Chamados separados" value="12753">\
          </div>\
          <button type="submit" class="btn btn-default btn-buscar">Buscar</button>\
        </form>\
        <table class="table table-bordered table-json table-striped table-json-root">\
          <thead>\
            <tr></tr>\
          </thead>\
          <tbody></tbody>\
        </table>');
      this.$(".test-case-container").html(this.$table);

      this.createTableHeaders();

      this.collection.each(this.addNewLine, this);
    }
  });  
})(jQuery);
