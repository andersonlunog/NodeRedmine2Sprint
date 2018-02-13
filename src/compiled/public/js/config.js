(function() {
  requirejs.config({
    paths: {
      jquery: "../libs/jquery/dist/jquery.min",
      backbone: "../libs/backbone/backbone-min",
      bootstrap: "../libs/bootstrap/dist/js/bootstrap.min",
      underscore: "../libs/underscore/underscore-min",
      text: "../libs/text/text",
      templates: "../templates",
      model: "models/baseModel",
      collection: "models/baseCollection"
    },
    shim: {
      jquery: {
        exports: "$"
      },
      underscore: {
        deps: ["jquery"],
        exports: "_"
      },
      backbone: {
        deps: ["jquery", "underscore"],
        exports: "Backbone"
      },
      bootstrap: {
        deps: ["jquery"]
      },
      datepicker: {
        deps: ["jquery", "bootstrap"]
      }
    }
  });

  // datepickerBR:
//   deps: ["datepicker"]
// maskedinput:
//   deps: ["jquery"]

}).call(this);
