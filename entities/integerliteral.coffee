Type = require './type'

class IntegerLiteral

  constructor: (@value) ->

  toString: -> @value

  analyze: (context) ->
    @type = Type.INT

  optimize: -> this

module.exports = IntegerLiteral
