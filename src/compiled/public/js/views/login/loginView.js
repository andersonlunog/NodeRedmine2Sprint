(function() {
  define(["jquery", "underscore", "backbone", "text!templates/login/login.html", "helpers/message", "enums/messageType"], function($, _, Backbone, LoginTemplate, MessageHelper, TipoMsg) {
    var Login;
    Login = (function() {
      class Login extends Backbone.View {
        initialize() {}

        render() {
          return this.$el.html(this.template());
        }

        testeSessao(event) {
          return $.post("/sessao", data, function(data) {
            return alert(data.msg);
          }).fail(function() {
            return alert("erro");
          });
        }

        login(event) {
          var login;
          login = {
            email: $("#inputEmail").val(),
            senha: $("#inputPassword").val()
          };
          $.post("/login", login, function(data, status, request) {
            console.log(data);
            return alert("Autenticado");
          }).fail(function(request, status, error) {
            console.log(request, status, error);
            return MessageHelper.show(request.responseText, TipoMsg.erro);
          });
          return event.preventDefault();
        }

        cadastrar() {
          return window.location.hash = "#/usuario";
        }

        loginVerify(event) {
          return $.post("/ver", {
            teste: "qualquer coisa"
          }, function(data, status, request) {
            return console.log(data.msg);
          }).fail(function(request, status, error) {
            return console.log("erro");
          });
        }

        logout(event) {
          return $.post("/logout", {}, function(data, status, request) {
            return console.log(data.msg);
          }).fail(function(request, status, error) {
            return console.log("erro");
          });
        }

        validarCampos() {
          var erro;
          erro = void 0;
          this.$el.find("input").each(function(index) {
            $(this).parent().find(".help-inline").detach();
            if ($(this).val() === "") {
              $(this).parent().parent().addClass("error");
              $(this).parent().append("<span class=\"help-inline\">Campo requerido</span>");
              return erro = true;
            } else {
              return $(this).parent().parent().removeClass("error");
            }
          });
          return erro;
        }

      };

      Login.prototype.el = ".page";

      Login.prototype.template = _.template(LoginTemplate);

      
      // $(@.el).find('#frmLogin').submit(function(){
      // 	if(!that.validarCampos())	
      // 		window.location.hash = '#/sucesso';
      // 	return false;
      // });
      Login.prototype.events = {
        "submit #frmLogin": "login",
        "click #btnVer": "loginVerify",
        "click #btnLogout": "logout",
        "click #btnCadastrar": "cadastrar"
      };

      return Login;

    }).call(this);
    return Login;
  });

}).call(this);
