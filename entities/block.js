function Block(statements) {
  this.statements = statements;
}

Block.prototype.toString = function () {
  return '(Block ' + this.statements.join(' ') + ')'
}

Block.prototype.analyze = function (context) {
  var localContext = context.createChildContext()
  this.statements.forEach(function (statement) {
    statement.analyze(localContext)
  })
}

module.exports = Block
