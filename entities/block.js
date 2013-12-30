function Block(declarations, statements) {
  this.declarations = declarations;
  this.statements = statements;
}

Block.prototype.analyze = function (context) {
  // TODO
}

Block.prototype.toString = function () {
  return '(Block ' + this.declarations.join(' ') + ' ' + this.statements.join(' ') + ')'
}

module.exports = Block
