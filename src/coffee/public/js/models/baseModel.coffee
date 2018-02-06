define ["underscore"
	"backbone"
	"jquery"
	"helpers/message"
	"enums/messageType"
], (_, Backbone, $, MsgHelper, MsgType) ->
	class BaseModel extends Backbone.Model
		idAttribute: "_id"
				
	BaseModel