var app = app || {};

(function ($) {
  'use strict';

  app.AppView = Backbone.View.extend({

    el: 'body',

    // statsTemplate: _.template($('#stats-template').html()),

    events: {
      'click .btn-add-new': 'createNew',
      'click .btn-import': 'clickImportFile',
      'click .btn-export': 'exportFileJson',
      'change .input-file': 'importFileJson',
      'click .btn-nfe-infos': 'nfeInfos',
      'click .btn-classificacoes-infos': 'classifInfos'
    },

    tipo: "parametros-calculo",

    initialize: function () {
      app.appView = this;
      this.collections = {};
      this.setTipo(this.tipo);

      this.$table = $(".table-json-root");

      // this.collection.fetch({reset: true});
    },

    render: function () {
      this.renderAllTable();
      this.$(".tipos-menu li").removeClass("active");
      this.$(".tipos-menu ." + this.tipo).addClass("active");
    },

    setTipo: function (tipo) {
      this.tipo = tipo;
      if ((this.collection = this.collections[tipo]) == null) {
        this.collection = this.collections[tipo] = new app.TestCaseCollection();
        this.listenTo(this.collection, 'add', this.addNewLine);
        this.listenTo(this.collection, 'add change reset', this.calcularSaldosNotas);
        this.listenTo(this.collection, 'reset', this.renderAllTable);
      }
    },

    createTableHeaders: function() {
      if (this.collection.length == 0)
        return;

      var obj = this.collection.at(0).toJSON();

      var $htr = this.$table.find("thead:first tr");
      $htr.empty();
      $htr.append("<th></th>");
      _.each(_.keys(obj), function(key) {
          $htr.append("<th>" + key + "</th>");
        });
    },

    createNew: function(e) {
      e.preventDefault();
      window.location.hash = "#new/" + this.tipo;
    },

    addNewLine: function (testCase) {
      var view = new app.TestCaseView({ model: testCase, targetTable: this.$table, tipo: this.tipo });
      view.render();
    },

    renderAllTable: function () {
      this.$table = $('\
        <table class="table table-bordered table-json table-striped table-json-root">\
          <thead>\
            <tr></tr>\
          </thead>\
          <tbody></tbody>\
        </table>');
      this.$(".test-case-container").html(this.$table);

      this.createTableHeaders();

      this.collection.each(this.addNewLine, this);
    },

    clickImportFile: function(e) {
      e.preventDefault();

      $(".input-file").click();
    },

    importFileJson: function(event) {
      var input = event.target;

      var fileName = input.files[0].name;
      var tipo = fileName.substring(5).replace(".json", "").replace(/([A-Z])/g, function (match, p1, i) {
        return (i == 0 ? "" : "-") + p1.toLowerCase();
      });
      this.setTipo(tipo);
      window.location.hash = "#" + tipo;

      var _this = this;

      var reader = new FileReader();
      reader.onload = function(){
        var text = reader.result;
        var obj = JSON.parse(text);
        _this.collection.reset(obj.Cases);
      };
      reader.readAsText(input.files[0]);
    },

    exportFileJson: function (e) {
      e.preventDefault();

      var tipoCaptalizado = this.tipo.replace(/^([\w\d])|[^\d\w]([\d\w])/g, function (match, p1, p2) { 
        return (p1||p2).toUpperCase() 
      });

      var cases = {
        Cases: this.collection.toJSON()
      }

      var element = $('<a>');
      element.attr('href', window.URL.createObjectURL(new Blob([JSON.stringify(cases)], {type: 'text/json'})));
      element.attr('download', "Casos" + tipoCaptalizado + ".json");
      element.css("display", 'none');
      $("body").append(element);
      element[0].click();
      element.remove();
    },

    nfeInfos: function (e) {
      e.preventDefault();

      $("#modal-info").modal();
      var nfeTbl = $("#infos").html("<table class='table'><thead><tr><th>Empresa</th><th>Chave Nfe</th><th>Peso Líquido</th><th>Itens</th></tr></thead><tbody></tbody></table>");
      var tbody = nfeTbl.find("tbody");

      _.each(app.nfeList, function (value, key) {
        tbody.append('<tr><td>' + value.empresa + '</td><td>' + key + '</td><td>' + value.peso + '</td><td>' + value.itens.join("<br>") + '</td></tr>');
      });     
    },

    classifInfos: function (e) {
      e.preventDefault();

      $("#modal-info").modal();
      var accordDiv = $("#infos").html('<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true"></div>');

      _.each(app.classificacaoList, function (value, key) {
        var accInt;
        accordDiv.append(accInt = $('<div class="panel panel-default"></div>'));
        accInt.append('<div class="panel-heading" role="tab" id="heading' + key + '">\
                    <h4 class="panel-title">\
                      <a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse' + key + '" aria-expanded="false" aria-controls="collapse' + key + '">' + key + '</a>\
                    </h4>\
                  </div>\
                  <div id="collapse' + key + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading' + key + '">\
                    <div class="panel-body">\
                      <table class="table"><thead><tr><th>Índice</th><th>Desconto</th><th>Servico</th></tr></thead><tbody></tbody></table>\
                    </div>\
                  </div>');

        var pnlBody = accInt.find(".panel-body tbody");

        _.each(value, function (value1, key1) {
          pnlBody.append('<tr><td>' + value1.valorIndice + '</td><td>' + value1.taxaDesconto + '</td><td>' + value1.valorServico + '</td></tr>');
        });
      });
    }
  });

  //Carrega os defaults
  app.nfeList = {};
  app.nfeList["31150209077252001084550050000008021001169957"] = {empresa: "NOVAAGRI PIRAPORA", peso: 12832, itens: [12832]};
  app.nfeList["31150209077252001084550050000008041001170160"] = {empresa: "NOVAAGRI PIRAPORA", peso: 120000, itens: [32420,32140,34370,21070]};
  app.nfeList["31150209077252001084550050000008121001176623"] = {empresa: "NOVAAGRI PIRAPORA", peso: 2220, itens: [2220]};
  app.nfeList["31150309077252001084550050000008201001180120"] = {empresa: "NOVAAGRI PIRAPORA", peso: 2220, itens: [2220]};
  app.nfeList["31150309077252001084550050000008221001182402"] = {empresa: "NOVAAGRI PIRAPORA", peso: 300000, itens: [300000]};
  app.nfeList["31150309077252001084550050000008271001184363"] = {empresa: "NOVAAGRI PIRAPORA", peso: 90000, itens: [12942,25015,10520,26000,15523]};
  app.nfeList["31150309077252001084550050000008291001185933"] = {empresa: "NOVAAGRI PIRAPORA", peso: 6209, itens: [6209]};
  app.nfeList["31150309077252001084550050000008301001186000"] = {empresa: "NOVAAGRI PIRAPORA", peso: 37042, itens: [24877,12165]};
  app.nfeList["31150309077252001084550050000008311001190625"] = {empresa: "NOVAAGRI PIRAPORA", peso: 75146, itens: [10477,26000,2500,22000,11949,2220]};
  app.nfeList["31150309077252001084550050000008321001190657"] = {empresa: "NOVAAGRI PIRAPORA", peso: 75146, itens: [75146]};
  app.nfeList["31150309077252001084550050000008331001191227"] = {empresa: "NOVAAGRI PIRAPORA", peso: 150000, itens: [19835,32000,32000,32000,32000,2165]};
  app.nfeList["31150309077252001084550050000008341001191267"] = {empresa: "NOVAAGRI PIRAPORA", peso: 150000, itens: [150000]};
  app.nfeList["31150309077252001084550050000008361001191334"] = {empresa: "NOVAAGRI PIRAPORA", peso: 600000, itens: [600000]};
  app.nfeList["31150309077252001084550050000008381001192173"] = {empresa: "NOVAAGRI PIRAPORA", peso: 43251, itens: [43251]};
  app.nfeList["31150309077252001084550050000008391001192189"] = {empresa: "NOVAAGRI PIRAPORA", peso: 43251, itens: [32000,11251]};
  app.nfeList["31150309077252001084550050000008421001193466"] = {empresa: "NOVAAGRI PIRAPORA", peso: 13405, itens: [5835,7570]};
  app.nfeList["31150309077252001084550050000008431001196764"] = {empresa: "NOVAAGRI PIRAPORA", peso: 3462, itens: [3462]};
  app.nfeList["31150309077252001084550050000008441001196770"] = {empresa: "NOVAAGRI PIRAPORA", peso: 17469, itens: [17469]};
  app.nfeList["31150409077252001084550050000008471001206894"] = {empresa: "NOVAAGRI PIRAPORA", peso: 900000, itens: [900000]};
  app.nfeList["31150409077252001084550050000008501001208434"] = {empresa: "NOVAAGRI PIRAPORA", peso: 300000, itens: [300000]};
  app.nfeList["31150409077252001084550050000008571001221121"] = {empresa: "NOVAAGRI PIRAPORA", peso: 4580, itens: [4580]};
  app.nfeList["31150409077252001084550050000008581001221668"] = {empresa: "NOVAAGRI PIRAPORA", peso: 300000, itens: [300000]};
  app.nfeList["31150409077252001084550050000008591001221673"] = {empresa: "NOVAAGRI PIRAPORA", peso: 600000, itens: [600000]};
  app.nfeList["31150409077252001084550050000008611001226037"] = {empresa: "NOVAAGRI PIRAPORA", peso: 55680, itens: [1919,26000,27761]};
  app.nfeList["31150409077252001084550050000008631001226147"] = {empresa: "NOVAAGRI PIRAPORA", peso: 300000, itens: [300000]};
  app.nfeList["31150409077252001084550050000008641001226152"] = {empresa: "NOVAAGRI PIRAPORA", peso: 55680, itens: [55680]};
  app.nfeList["31150409077252001084550050000008671001226332"] = {empresa: "NOVAAGRI PIRAPORA", peso: 300000, itens: [300000]};
  app.nfeList["31150409077252001084550050000008681001226348"] = {empresa: "NOVAAGRI PIRAPORA", peso: 547140, itens: [547140]};
  app.nfeList["31150509077252001084550050000008701001226960"] = {empresa: "NOVAAGRI PIRAPORA", peso: 480000, itens: [480000]};
  app.nfeList["31150509077252001084550050000008741001235267"] = {empresa: "NOVAAGRI PIRAPORA", peso: 1200000, itens: [1200000]};
  app.nfeList["31150509077252001084550050000008751001235337"] = {empresa: "NOVAAGRI PIRAPORA", peso: 1200000, itens: [1200000]};
  app.nfeList["31150509077252001084550050000008771001244012"] = {empresa: "NOVAAGRI PIRAPORA", peso: 21072, itens: [21072]};
  app.nfeList["31150509077252001084550050000008791001245560"] = {empresa: "NOVAAGRI PIRAPORA", peso: 16040, itens: [14790,1250]};
  app.nfeList["31150509077252001084550050000008801001245863"] = {empresa: "NOVAAGRI PIRAPORA", peso: 16040, itens: [16040]};
  app.nfeList["31150509077252001084550050000008811001246336"] = {empresa: "NOVAAGRI PIRAPORA", peso: 300000, itens: [300000]};
  app.nfeList["31150509077252001084550050000008821001246341"] = {empresa: "NOVAAGRI PIRAPORA", peso: 300000, itens: [300000]};
  app.nfeList["31150609077252001084550050000008851001252312"] = {empresa: "NOVAAGRI PIRAPORA", peso: 600000, itens: [600000]};
  app.nfeList["31150609077252001084550050000008901001258744"] = {empresa: "NOVAAGRI PIRAPORA", peso: 96663, itens: [38000,38000,20663]};
  app.nfeList["31150709077252001084550050000008951001261311"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000008961001261327"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000008971001261332"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000008981001261348"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000008991001261353"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009001001261372"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009011001261388"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009021001261393"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [26568,23432]};
  app.nfeList["31150709077252001084550050000009031001261404"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009041001261410"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009051001261425"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009061001261430"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009071001261446"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009081001261451"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009091001261467"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009101001261476"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009111001261481"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009121001261497"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009131001261508"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009141001261513"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009151001261529"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009161001261534"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009171001261540"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009181001261555"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009191001261560"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [11897,38103]};
  app.nfeList["31150709077252001084550050000009201001261570"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009211001261585"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009221001261590"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009231001261610"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009241001261625"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009251001261630"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [4045,45955]};
  app.nfeList["31150709077252001084550050000009261001261646"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50708, itens: [50708]};
  app.nfeList["31150709077252001084550050000009271001262623"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009281001262647"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009291001262652"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009301001262661"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009311001262677"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009321001262682"] = {empresa: "NOVAAGRI PIRAPORA", peso: 50000, itens: [50000]};
  app.nfeList["31150709077252001084550050000009341001269843"] = {empresa: "NOVAAGRI PIRAPORA", peso: 120000, itens: [12142,31900,31900,31900,12158]};
  app.nfeList["31150709077252001084550050000009361001269864"] = {empresa: "NOVAAGRI PIRAPORA", peso: 49279, itens: [49279]};
  app.nfeList["31150709077252001084550050000009371001269900"] = {empresa: "NOVAAGRI PIRAPORA", peso: 120000, itens: [120000]};
  app.nfeList["31150709077252001084550050000009381001269915"] = {empresa: "NOVAAGRI PIRAPORA", peso: 720000, itens: [720000]};
  app.nfeList["31150709077252001084550050000009391001269920"] = {empresa: "NOVAAGRI PIRAPORA", peso: 49279, itens: [49279]};
  app.nfeList["31150709077252001084550050000009441001272867"] = {empresa: "NOVAAGRI PIRAPORA", peso: 153998, itens: [153998]};
  app.nfeList["31150709077252001084550050000009451001272872"] = {empresa: "NOVAAGRI PIRAPORA", peso: 240260, itens: [240260]};
  app.nfeList["31150709077252001084550050000009481001276900"] = {empresa: "NOVAAGRI PIRAPORA", peso: 30874, itens: [17932,12942]};
  app.nfeList["31150709077252001084550050000009491001276931"] = {empresa: "NOVAAGRI PIRAPORA", peso: 35454, itens: [35454]};
  app.nfeList["31150709077252001084550050000009501001277580"] = {empresa: "NOVAAGRI PIRAPORA", peso: 39437, itens: [3983,35454]};
  app.nfeList["31150709077252001084550050000009511001277596"] = {empresa: "NOVAAGRI PIRAPORA", peso: 153380, itens: [19058,32000,32000,70322]};
  app.nfeList["31150709077252001084550050000009531001277779"] = {empresa: "NOVAAGRI PIRAPORA", peso: 193110, itens: [193110]};
  app.nfeList["31150709077252001084550050000009551001277960"] = {empresa: "NOVAAGRI PIRAPORA", peso: 191861, itens: [55000,55000,55000,26861]};
  app.nfeList["31150809077252001084550050000009561001285351"] = {empresa: "NOVAAGRI PIRAPORA", peso: 1500000, itens: [1500000]};
  app.nfeList["31150809077252001084550050000009571001285367"] = {empresa: "NOVAAGRI PIRAPORA", peso: 1500000, itens: [1500000]};
  app.nfeList["29150309077252000436550050000069091001184411"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 450000, itens: [450000]};
  app.nfeList["29150309077252000436550050000069101001184854"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 52725, itens: [52725]};
  app.nfeList["29150309077252000436550050000069111001184860"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 51642, itens: [51642]};
  app.nfeList["29150309077252000436550050000069121001185081"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 53288, itens: [53288]};
  app.nfeList["29150309077252000436550050000069131001185240"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 48000, itens: [48000]};
  app.nfeList["29150309077252000436550050000069141001185272"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 51700, itens: [51700]};
  app.nfeList["29150309077252000436550050000069151001185369"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 41960, itens: [41960]};
  app.nfeList["29150309077252000436550050000069161001186265"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 42926, itens: [42926]};
  app.nfeList["29150309077252000436550050000069171001186319"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 41974, itens: [41974]};
  app.nfeList["29150309077252000436550050000069181001186545"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 49859, itens: [49859]};
  app.nfeList["29150309077252000436550050000069191001187239"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 51340, itens: [51340]};
  app.nfeList["29150309077252000436550050000069201001187728"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 52725, itens: [52725]};
  app.nfeList["29150309077252000436550050000069201001187922"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 52725, itens: [52725]};
  app.nfeList["29150309077252000436550050000069211001188012"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 52725, itens: [52725]};
  app.nfeList["29150309077252000436550050000069221001188184"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 52725, itens: [52725]};
  app.nfeList["29150309077252000436550050000069231001188327"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 51642, itens: [51642]};
  app.nfeList["29150309077252000436550050000069241001188332"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 51642, itens: [51642]};
  app.nfeList["29150309077252000436550050000069251001188348"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 53268, itens: [53268]};
  app.nfeList["29150309077252000436550050000069261001188353"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 53288, itens: [53288]};
  app.nfeList["29150309077252000436550050000069271001188369"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 48000, itens: [48000]};
  app.nfeList["29150309077252000436550050000069281001188374"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 48000, itens: [48000]};
  app.nfeList["29150309077252000436550050000069291001188410"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 51700, itens: [51700]};
  app.nfeList["29150309077252000436550050000069301001188429"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 51700, itens: [51700]};
  app.nfeList["29150309077252000436550050000069311001188434"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 41960, itens: [41960]};
  app.nfeList["29150309077252000436550050000069321001188440"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 41960, itens: [41960]};
  app.nfeList["29150309077252000436550050000069331001188455"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 42926, itens: [42926]};
  app.nfeList["29150309077252000436550050000069341001188460"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 42926, itens: [42926]};
  app.nfeList["29150309077252000436550050000069351001188476"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 41974, itens: [41974]};
  app.nfeList["29150309077252000436550050000069361001188481"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 42700, itens: [42700]};
  app.nfeList["29150309077252000436550050000069371001189647"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 49859, itens: [49859]};
  app.nfeList["29150309077252000436550050000069381001189652"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 49859, itens: [49859]};
  app.nfeList["29150309077252000436550050000069391001189765"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 51340, itens: [51340]};
  app.nfeList["29150309077252000436550050000069401001189774"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 51340, itens: [51340]};
  app.nfeList["29150309077252000436550050000069411001193353"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 30000, itens: [30000]};
  app.nfeList["29150409077252000436550050000069431001200820"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 46580, itens: [38244,8336]};
  app.nfeList["29150409077252000436550050000069441001200835"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 47080, itens: [6393,39263,1424]};
  app.nfeList["29150409077252000436550050000069451001200840"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 44140, itens: [24015,20125]};
  app.nfeList["29150409077252000436550050000069461001200856"] = {empresa: "NOVAAGRI LUIS EDUARDO", peso: 31140, itens: [20391,10749]};

  app.tiposServico = ["quebraTecnica", "pesoBruto", "pesoLiquido", "pesoBrutoQuebra", "pesoLiquidoQuebra"];
  app.tiposCobranca = ["Diaria", "Quinzena_Fixa", "Quinzena_Movel_Calendario", "Quinzena_Movel_Comercial"];
  app.tiposCarencia = ["Diaria", "Quinzenal", "Mensal", "Data_Fixa"];
  app.tiposEstoque = [" ", "Materia_Estranha", "Bruto_Umido", "Mofado", "Nao_Gelatinizado", "Partido", "Correcao", "Retencao", "Estoque_Descoberto", "PH", "Picado_de_Inseto", "Polarizacao", "Quebrado", "Royalties", "Queimado", "Quirera", "Rajado", "Residuo_Insoluvel", "Umidade", "Verde", "Vermelho_e_Preto", "FisicoFiscal", "Quebra", "Fermentado", "NA", "Amarelo", "Nota_Descoberta", "Ardido", "Avariado", "BrotadoGerminado", "Carunchado", "Chocho", "Cinza", "Cor_Mops", "Danificado", "Gessado_e_Verde", "Residuos", "Imaturo", "Impureza", "Manchado"];
  app.tiposServicoOcorrencia = ["servicoSecagem", "servicoLimpeza", "servicoFixoBruto", "servicoFixoLiquido", "saidaFixoLiquido", "saidaUmidade"];
  app.tiposClassificacao = ["Umidade", "Impureza", "Ardido", "Partido", "Quebrado", "Avariado"];
  app.classificacaoList = {};

  var round = function(val) { return Math.round(val * 100) / 100 };

  var indices, taxa, servico;
  indices = [];
  for (var i = 10; i <= 18; i = round(i + 0.1)) {
    taxa = (i > 14) ? round((i - 14) * 1.5) : 0;
    servico = 0;
    if (i > 10 && i <= 15) servico = 20;
    else if (i > 15 && i <= 17) servico = 30;
    else if (i > 17) servico = 50;

    indices.push({valorIndice: i, taxaDesconto: taxa, valorServico: servico});
  }      
  app.classificacaoList["Umidade"] = indices;

  indices = [];
  for (var i = 0; i <= 10; i = round(i + 0.1)) {
    taxa = (i > 1 && i <= 10) ? round(i - 1) : 0;
    indices.push({valorIndice: i, taxaDesconto: taxa, valorServico: 25});
  }      
  app.classificacaoList["Impureza"] = indices;

  indices = [];
  for (var i = 5.1; i <= 15; i = round(i + 0.1)) indices.push({valorIndice: i, taxaDesconto: round(i - 5), valorServico: 0});
  app.classificacaoList["Ardido"] = indices;

  indices = [];
  for (var i = 6.1; i <= 15; i = round(i + 0.1)) indices.push({valorIndice: i, taxaDesconto: round(i - 6), valorServico: 0});
  app.classificacaoList["Partido"] = indices;

  indices = [];
  for (var i = 7.1; i <= 15; i = round(i + 0.1)) indices.push({valorIndice: i, taxaDesconto: round(i - 7), valorServico: 0});
  app.classificacaoList["Quebrado"] = indices;

  indices = [];
  for (var i = 8.1; i <= 20; i = round(i + 0.1)) indices.push({valorIndice: i, taxaDesconto: round(i - 8), valorServico: 0});
  app.classificacaoList["Avariado"] = indices;

})(jQuery);
