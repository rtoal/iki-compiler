function VariableDeclaration(id, type) {
  this.id = id;
  this.type = type
}

VariableDeclaration.prototype.analyze = function (context) {
  context.assertVariableNotAlreadyDeclared(this.id)
  context.addVariable(this.id.lexeme, this);
}

VariableDeclaration.prototype.toString = function () {
  return '(Var :' + this.id.lexeme + ' ' + this.type + ')'
}

module.exports = VariableDeclaration;
