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

Block.prototype.optimize = function () {
  this.statements = this.statements.map(function (s) {return s.optimize()})
  this.statements = this.statements.filter(function (s) {return s !== null})
  return this
}

module.exports = Block
