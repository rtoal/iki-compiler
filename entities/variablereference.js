function VariableReference(token) {
  this.token = token;
}

VariableReference.prototype.analyze = function (context) {
  // TODO
}

VariableReference.prototype.toString = function () {
  return this.token.lexeme
}

module.exports = VariableReference;
