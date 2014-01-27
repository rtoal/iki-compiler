function VariableDeclaration(id, type) {
  this.id = id
  this.type = type
}

VariableDeclaration.prototype.toString = function () {
  return '(Var :' + this.id.lexeme + ' ' + this.type + ')'
}

VariableDeclaration.prototype.analyze = function (context) {
  context.variableMustNotBeAlreadyDeclared(this.id)
  context.addVariable(this.id.lexeme, this)
}

module.exports = VariableDeclaration
