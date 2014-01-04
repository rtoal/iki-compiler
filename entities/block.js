function Block(statements) {
  this.statements = statements;
}

Block.prototype.analyze = function (context) {
  localContext = context.createChildContext()
  this.statements.forEach(function (statement) {
    statement.analyze(localContext)
  })
}

Block.prototype.toString = function () {
  return '(Block ' + this.statements.join(' ') + ')'
}

module.exports = Block
