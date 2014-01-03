function VariableReference(token) {
  this.token = token;
}

VariableReference.prototype.analyze = function (context) {
  this.referent = context.lookupVariable(this.token);
  this.type = this.referent.type;
}

VariableReference.prototype.toString = function () {
  return this.token.lexeme;
}

module.exports = VariableReference;
