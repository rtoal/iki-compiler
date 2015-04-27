BooleanLiteral = require './booleanliteral'

class IfStatement

  constructor: (@condition, @body) ->

  toString: () ->
    "(if #{@condition} then #{@body})"

  analyze: (context) ->
    @condition.analyze context
    @condition.type.mustBeBoolean 'Condition in "if" statement must be boolean'
    @body.analyze context

  optimize: () ->
    @condition = @condition.optimize()
    @body = @body.optimize()
    if @condition instanceof BooleanLiteral and @condition.value() is false
      return null
    return this

module.exports = IfStatement