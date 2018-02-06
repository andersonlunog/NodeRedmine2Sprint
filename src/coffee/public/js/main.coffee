require.config paths:
	jquery: "libs/jquery/jquery.min"
	backbone: "libs/backbone/backbone"
	bootstrap: "libs/bootstrap/bootstrap.min"
	underscore: "libs/underscore/underscore"
	text: "libs/require/text"
	templates: "../templates"
	model: "models/baseModel"
	collection: "models/baseCollection"
	utils: "mylibs/utils"

require ["views/app"
	"router"
	"vm"
], (AppView, Router, Vm) ->
	appView = Vm.create {}, "AppView", AppView
	appView.render()
	
	Router.initialize appView: appView
