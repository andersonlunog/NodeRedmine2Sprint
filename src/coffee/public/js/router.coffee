define ["backbone", "vm"], (Backbone, Vm) ->
	AppRouter = Backbone.Router.extend routes:
		"sucesso": "sucesso"
		"usuarios": "usuarios"
		"usuario": "usuario"
		"usuario/:id": "usuario"
		"*actions": "defaultAction"

	initialize = (options) ->
		appView = options.appView
		router = new AppRouter(options)

		router.on "route:sucesso", ->
			require ["views/login/sucesso"], (ViewPage) ->
				viewPage = Vm.create appView, "SucessoView", ViewPage
				viewPage.render()

		router.on "route:usuario", (id) ->
			require ["views/usuario/cadastroView"], (ViewPage) ->
				viewPage = Vm.create appView, "CadastroUsuarioView", ViewPage, 
					id : id
				viewPage.render()

		router.on "route:usuarios", (id) ->
			require ["views/usuario/listaView"], (ViewPage) ->
				viewPage = Vm.create appView, "ListaUsuarioView", ViewPage
				viewPage.render()

		router.on "route:defaultAction", ->
			require ["views/login/loginView"], (ViewPage) ->
				viewPage = Vm.create appView, "LoginView", ViewPage
				viewPage.render()

		Backbone.history.start()

	initialize: initialize
