function WriteStatement(expressions) {
  this.expressions = expressions;
}

WriteStatement.prototype.analyze = function (context) {
  this.expressions.forEach(function (e) {e.analyze(context)})
}

WriteStatement.prototype.toString = function () {
  return '(Write ' + this.expressions.join(' ') + ')'
}

module.exports = WriteStatement
