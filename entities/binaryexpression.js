var Type = require('./type')

function BinaryExpression(op, left, right) {
  this.op = op
  this.left = left
  this.right = right
}

BinaryExpression.prototype.toString = function () {
  return '(' + this.op.lexeme + ' ' + this.left + ' ' + this.right + ')'
}

BinaryExpression.prototype.analyze = function (context) {
  this.left.analyze(context)
  this.right.analyze(context)
  op = this.op.lexeme
  if (/<=?|>=?/.test(op)) {
    this.mustHaveIntegerOperands()
    this.type = Type.BOOL
  } else if (/==|!=/.test(op)) {
    this.mustHaveCompatibleOperands()
    this.type = Type.BOOL
  } else if (/and|or/.test(op)) {
    this.mustHaveBooleanOperands()
    this.type = Type.BOOL
  } else {
    // All other binary operators are arithmetic
    this.mustHaveIntegerOperands()
    this.type = Type.INT
  }
}

BinaryExpression.prototype.mustHaveIntegerOperands = function () {
  var error = this.op.lexeme + ' must have integer operands'
  this.left.type.mustBeCompatibleWith(Type.INT, error, this.op)
  this.right.type.mustBeCompatibleWith(Type.INT, error, this.op)
}

BinaryExpression.prototype.mustHaveBooleanOperands = function () {
  var error = this.op.lexeme + ' must have boolean operands'
  this.left.type.mustBeCompatibleWith(Type.BOOL, error, this.op)
  this.right.type.mustBeCompatibleWith(Type.BOOL, error, this.op)
}

BinaryExpression.prototype.mustHaveCompatibleOperands = function () {
  var error = this.op.lexeme + ' must have mutually compatible operands'
  this.left.type.mustBeMutuallyCompatibleWith(this.right.type, error, this.op)
}

module.exports = BinaryExpression
