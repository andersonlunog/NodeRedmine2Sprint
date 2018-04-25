define ["underscore"
  "backbone"
  "collection"
  "models/equipeModel"
], (_, Backbone, BaseCollection, EquipeModel) ->
  class EquipeCollection extends BaseCollection
    model: EquipeModel
    url: "/equipes"

  EquipeCollection