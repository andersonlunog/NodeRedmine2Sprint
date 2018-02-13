(function() {
  define(function(require, exports, module) {
    var $, Backbone, MenuView, _, template;
    _ = require("underscore");
    $ = require("jquery");
    Backbone = require("backbone");
    template = require("text!templates/menu.html");
    MenuView = (function() {
      class MenuView extends Backbone.View {
        initialize(options) {
          this.options = options;
        }

        // @listenTo Backbone.Events, "menu.home", () ->
        render() {
          var $template, ref;
          $template = $(this.template());
          $template.find("#menu li").removeClass("active").closest(`#${this.options.activeMenu}`).addClass("active");
          if ((ref = app.resources) != null ? ref.userName : void 0) {
            $template.find("#user-name").html(this.shortName(app.resources.userName));
          }
          this.$el.html($template);
          return this;
        }

        setActiveMenu(menu) {
          return $("#menu li").removeClass("active").closest(`#${menu}`).addClass("active");
        }

        shortName(name) {
          var firstName;
          if (!name.trim()) {
            return "";
          }
          firstName = name.trim().split(" ")[0];
          return firstName.substring(0, Math.min(firstName.length, 25));
        }

        testeSessao(event) {
          return $.post("/sessao", data, function(data) {
            return alert(data.msg);
          }).fail(function() {
            return alert("erro");
          });
        }

        verSessoes(event) {
          return $.post("/verSessoes", {
            a: null
          }, function(data, status, request) {
            return console.log(data);
          }).fail(function(request, status, error) {
            return console.log("erro");
          });
        }

        loginVerify(event) {
          return $.post("/ver", {
            a: null
          }, function(data, status, request) {
            return console.log(data);
          }).fail(function(request, status, error) {
            return console.log("erro");
          });
        }

        logout(event) {
          return $.post("/logout", {}, function(data, status, request) {
            Backbone.Events.trigger("resources.reload");
            return window.location.hash = "#login";
          }).fail(function(request, status, error) {
            return console.log("Erro ao tentar realizar o logout.");
          });
        }

      };

      MenuView.prototype.el = ".menu-area";

      MenuView.prototype.template = _.template(template);

      MenuView.prototype.events = {
        "click #logout": "logout"
      };

      return MenuView;

    }).call(this);
    return module.exports = MenuView;
  });

}).call(this);
