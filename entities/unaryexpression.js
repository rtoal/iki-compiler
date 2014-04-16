var Type = require('./type')
var IntegerLiteral = require('./integerliteral')
var BooleanLiteral = require('./booleanliteral')

function UnaryExpression(op, operand) {
  this.op = op
  this.operand = operand
}

UnaryExpression.prototype.toString = function () {
  return '(' + this.op.lexeme + ' ' + this.operand + ')'
}

UnaryExpression.prototype.analyze = function (context) {
  this.operand.analyze(context)
  if (this.op.lexeme === 'not') {
    this.operand.type.mustBeBoolean('The "not" operator requires a boolean operand', this.op)
    this.type = Type.BOOL
  } else {
    // this.op.lexeme === '-'
    this.operand.type.mustBeInteger('The "negation" operator requires an integer operand', this.op)
    this.type = Type.INT
  }
}

UnaryExpression.prototype.optimize = function () {
  this.operand = operand.optimize()
  if (this.op.lexeme === 'not' && this.operand instanceof BooleanLiteral) {
      return new BooleanLiteral(! this.operand.value)
  } else if (this.op.lexeme === '-' && this.operand instanceof IntegerLiteral) {
      return new IntegerLiteral(-this.operand.value)
  }
  return this
}

module.exports = UnaryExpression
