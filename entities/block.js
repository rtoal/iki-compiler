var AnalysisContext = require('../analyzer').AnalysisContext

function Block(statements) {
  this.statements = statements;
}

Block.prototype.analyze = function (parent_context) {
  context = new AnalysisContext(parent_context)
  this.statements.forEach(function (statement) {statement.analyze(context)})
}

Block.prototype.toString = function () {
  return '(Block ' + this.statements.join(' ') + ')'
}

module.exports = Block
