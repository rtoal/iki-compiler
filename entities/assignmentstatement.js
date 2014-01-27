function AssignmentStatement(target, source) {
  this.target = target
  this.source = source
}

AssignmentStatement.prototype.toString = function () {
  return '(= ' + this.target + ' ' + this.source + ')'
}

AssignmentStatement.prototype.analyze = function (context) {
  this.target.analyze(context)
  this.source.analyze(context)
  this.source.type.mustBeCompatibleWith(this.target.type, 'Type mismatch in assignment')
}

module.exports = AssignmentStatement
