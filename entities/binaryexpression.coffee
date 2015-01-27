Type = require './type'
IntegerLiteral = require './integerliteral'
BooleanLiteral = require './booleanliteral'
VariableReference = require './variablereference'

class BinaryExpression

  constructor: (@op, @left, @right) ->

  toString: ->
    "(#{@op.lexeme} #{@left} #{@op.right})"

  analyze: (context) ->
    @left.analyze(context)
    @right.analyze(context)
    op = @op.lexeme
    switch op
      when '<', '<=', '>=', '>'
        @mustHaveIntegerOperands()
        @type = Type.BOOL
      when '==', '!='
        @mustHaveCompatibleOperands()
        @type = Type.BOOL
      when 'and', 'or'
        @mustHaveBooleanOperands()
        @type = Type.BOOL
      else
        # All other binary operators are arithmetic
        @mustHaveIntegerOperands()
        @type = Type.INT

  optimize: ->
    @left = @left.optimize()
    @right = @right.optimize()
    if @left instanceof IntegerLiteral and @right instanceof IntegerLiteral
      return foldIntegerConstants @op.lexeme, +@left.value, +@right.value
    else if @left instanceof BooleanLiteral and @right instanceof BooleanLiteral
      return foldBooleanConstants @op.lexeme, @left.value(), @right.value()
    else
      switch @op.lexeme
        when '+'
          return @left if isIntegerLiteral(@right, 0)
          return @right if isIntegerLiteral(@left, 0)
        when '-'
          return @left if isIntegerLiteral(@right, 0)
          return new IntegerLiteral 0 if sameVariable(@left, @right)
        when '*'
          return @left if isIntegerLiteral(@right, 1)
          return @right if isIntegerLiteral(@left, 1)
          return new IntegerLiteral(0) if isIntegerLiteral(@right, 0)
          return new IntegerLiteral(0) if isIntegerLiteral(@left, 0)
        when '/'
          return @left if isIntegerLiteral(@right, 1)
          return new IntegerLiteral(1) if sameVariable(@left, @right)
    return this

  mustHaveIntegerOperands: () ->
    error = "#{@op.lexeme} must have integer operands"
    @left.type.mustBeCompatibleWith(Type.INT, error, @op)
    @right.type.mustBeCompatibleWith(Type.INT, error, @op)

  mustHaveBooleanOperands: () ->
    error = "#{@op.lexeme} must have boolean operands"
    @left.type.mustBeCompatibleWith(Type.BOOL, error, @op)
    @right.type.mustBeCompatibleWith(Type.BOOL, error, @op)

  mustHaveCompatibleOperands: () ->
    error = "#{@op.lexeme} must have mutually compatible operands"
    @left.type.mustBeMutuallyCompatibleWith(@right.type, error, @op)

isIntegerLiteral = (operand, value) ->
  operand instanceof IntegerLiteral and operand.value is value

sameVariable = (exp1, exp2) ->
  exp1 instanceof VariableReference and exp2 instanceof VariableReference and exp1.referent is exp2.referent

foldIntegerConstants = (op, x, y) ->
  switch op
    when '+' then new IntegerLiteral(x + y)
    when '-' then new IntegerLiteral(x - y)
    when '*' then new IntegerLiteral(x * y)
    when '/' then new IntegerLiteral(x / y)
    when '<' then new BooleanLiteral(x < y)
    when '<=' then new BooleanLiteral(x <= y)
    when '==' then new BooleanLiteral(x is y)
    when '!=' then new BooleanLiteral(x isnt y)
    when '>=' then new BooleanLiteral(x >= y)
    when '>' then new BooleanLiteral(x > y)

foldBooleanConstants = (op, x, y) ->
  switch op
    when '==' then new BooleanLiteral(x is y)
    when '!=' then new BooleanLiteral(x isnt y)
    when 'and' then new BooleanLiteral(x and y)
    when 'or' then new BooleanLiteral(x or y)

module.exports = BinaryExpression
