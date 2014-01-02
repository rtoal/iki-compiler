var Type = require('./type')

function BinaryExpression(op, left, right) {
  this.op = op;
  this.left = left;
  this.right = right;
}

BinaryExpression.prototype.analyze = function (context) {
  this.left.analyze(context);
  this.right.analyze(context);
  op = this.op.lexeme;
  if (/<=?|>=?|!?=/.test(op)) {
    // TODO typecheck('int', [this.left, this.right], op + ' requires integer operands')
    this.type = Type.BOOL
  } else if (/and|or/.test(op)) {
    // TODO typecheck('bool', [this.left, this.right], op + ' requires boolean operands')
    this.type = Type.BOOL
  } else {
    // All other binary operators are arithmetic
    // TODO typecheck('int', [this.left, this.right], op + ' requires integer operands')
    this.type = Type.INT
  }
};

BinaryExpression.prototype.toString = function () {
  return '(' + this.op.lexeme + ' ' + this.left + ' ' + this.right + ')'
}

module.exports = BinaryExpression
