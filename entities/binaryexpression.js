var Type = require('./type')
var error = require('../error')

function BinaryExpression(op, left, right) {
  this.op = op
  this.left = left
  this.right = right
}

BinaryExpression.prototype.analyze = function (context) {
  this.left.analyze(context)
  this.right.analyze(context)
  op = this.op.lexeme
  if (/<=?|>=?/.test(op)) {
    this.assertBothOperands(Type.INT)
    this.type = Type.BOOL
  } else if (/==|!=/.test(op)) {
    this.left.type.assertCompatibleWith(this.right.type, 'Operands of "' + op + '" must have same type', this.op)
    this.type = Type.BOOL
  } else if (/and|or/.test(op)) {
    this.assertBothOperands(Type.BOOL)
    this.type = Type.BOOL
  } else {
    // All other binary operators are arithmetic
    this.assertBothOperands(Type.INT)
    this.type = Type.INT
  }
}

BinaryExpression.prototype.toString = function () {
  return '(' + this.op.lexeme + ' ' + this.left + ' ' + this.right + ')'
}

BinaryExpression.prototype.assertBothOperands = function (type) {
  if (type !== this.left.type || type !== this.right.type) {
    error('Operands to "' + this.op.lexeme + '" must both have type ' + type, this.op)
  }
}

module.exports = BinaryExpression
