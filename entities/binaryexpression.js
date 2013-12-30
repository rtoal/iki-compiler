function BinaryExpression(op, left, right) {
  this.op = op;
  this.left = left;
  this.right = right;
}

BinaryExpression.prototype.analyze = function (context) {
  // TODO
};

BinaryExpression.prototype.toString = function () {
  return '(' + this.op.lexeme + ' ' + this.left + ' ' + this.right + ')'
}

module.exports = BinaryExpression
