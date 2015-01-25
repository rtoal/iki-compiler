Type = require './type'

class BooleanLiteral

  constructor: (name) ->
    @name = "#{name}"

  value: ->
    this.name is 'true'

  toString: -> @name

  analyze: (context) ->
    @type = Type.BOOL

  optimize: -> this

module.exports = BooleanLiteral
