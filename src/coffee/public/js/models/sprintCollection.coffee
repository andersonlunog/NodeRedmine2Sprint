define ["underscore"
  "backbone"
  "collection"
  "models/sprintModel"
], (_, Backbone, BaseCollection, SprintModel) ->
  class SprintCollection extends BaseCollection
    model: SprintModel
    url: "/sprints"

  SprintCollection