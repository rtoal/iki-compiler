function AssignmentStatement(varref, expression) {
  this.varref = varref;
  this.expression = expression;
}

AssignmentStatement.prototype.analyze = function (context) {
  this.varref.analyze(context);
  this.expression.analyze(context);
}

AssignmentStatement.prototype.toString = function () {
  return '(= ' + this.varref + ' ' + this.expression + ')'
}

module.exports = AssignmentStatement;
