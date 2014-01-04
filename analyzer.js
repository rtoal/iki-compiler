var error = require('./error')

function AnalysisContext(parent) {
  this.parent = parent;
  this.symbolTable = {}
}

AnalysisContext.initialContext = function () {
  return new AnalysisContext(null)
}

AnalysisContext.prototype.createChildContext = function () {
  return new AnalysisContext(this)
}

AnalysisContext.prototype.assertVariableNotAlreadyDeclared = function (v) {
  if (this.symbolTable[v.lexeme]) {
    error('Variable ' + v.lexeme + ' already declared', v)
  }
}

AnalysisContext.prototype.addVariable = function (v, entity) {
  this.symbolTable[v] = entity;
}

AnalysisContext.prototype.lookupVariable = function (v) {
  var variable = this.symbolTable[v.lexeme];
  if (variable) {
    return variable;
  } else if (!this.parent) {
    error('Variable ' + v.lexeme + ' not found', v)
  } else {
    return this.parent.lookupVariable(v)
  }
}

exports.initialContext = AnalysisContext.initialContext;
