Type = require './type'
IntegerLiteral = require './integerliteral'
BooleanLiteral = require './booleanliteral'

class UnaryExpression

  constructor: (@op, @operand) ->

  toString: ->
    "(#{this.op.lexeme} #{this.operand})"

  analyze: (context) ->
    @operand.analyze context
    if @op.lexeme is 'not'
      @operand.type.mustBeBoolean 'The "not" operator requires a boolean operand', @op
      @type = Type.BOOL
    else
      # this.op.lexeme === '-'
      @operand.type.mustBeInteger 'The "negation" operator requires an integer operand', @op
      this.type = Type.INT

  optimize: ->
    @operand = @operand.optimize()
    if @op.lexeme is 'not' and @operand instanceof BooleanLiteral
      new BooleanLiteral(not @operand.value)
    else if @op.lexeme is '-' and @operand instanceof IntegerLiteral
      new IntegerLiteral(- @operand.value)
    this

module.exports = UnaryExpression
