function Program(block) {
  this.block = block
}

Program.prototype.analyze = function (context) {
  this.block.analyze(context)
}

Program.prototype.optimize = function () {
  this.block.optimize();
  // TODO removeUnusedVariables();
}

Program.prototype.toString = function () {
  return '(Program ' + this.block + ')' 
}

module.exports = Program
