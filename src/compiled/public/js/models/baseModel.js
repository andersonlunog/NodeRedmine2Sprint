(function() {
  define(["underscore", "backbone", "jquery", "helpers/message", "enums/messageType"], function(_, Backbone, $, MsgHelper, MsgType) {
    var BaseModel;
    BaseModel = (function() {
      class BaseModel extends Backbone.Model {};

      BaseModel.prototype.idAttribute = "_id";

      return BaseModel;

    }).call(this);
    return BaseModel;
  });

}).call(this);
