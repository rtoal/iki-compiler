function VariableDeclaration(token) {
  this.token = token;
}

VariableDeclaration.prototype.analyze = function (context) {
  // TODO
}

VariableDeclaration.prototype.toString = function () {
  return '(Var :' + this.token.lexeme + ')'
}

module.exports = VariableDeclaration;
