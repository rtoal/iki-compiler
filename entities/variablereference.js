function VariableReference(token) {
  this.token = token;
}

VariableReference.prototype.analyze = function (context) {
  console.log('context is %j', context)
  console.log('looking up', this.token.lexeme)
  this.referent = context.lookupVariable(this.token);
  this.type = this.referent.type;
}

VariableReference.prototype.toString = function () {
  return this.token.lexeme;
}

module.exports = VariableReference;
