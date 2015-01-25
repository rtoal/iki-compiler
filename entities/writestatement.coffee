class WriteStatement

  constructor: (@expressions) ->

  toString: ->
    "(Write #{this.expressions.join(' ')})"

  analyze: (context) ->
    for e in @expressions
      e.analyze context
      e.type.mustBeInteger 'Expressions in "write" statement must have type integer'

  optimize: () ->
    @expressions = (e.optimize() for e in @expressions)
    this

module.exports = WriteStatement
