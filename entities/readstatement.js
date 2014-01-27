function ReadStatement(varrefs) {
  this.varrefs = varrefs
}

ReadStatement.prototype.toString = function () {
  return '(Read ' + this.varrefs.join(' ') + ')'
}

ReadStatement.prototype.analyze = function (context) {
  this.varrefs.forEach(function (v) {
    v.analyze(context)
    v.type.mustBeInteger('Variables in "read" statement must have type integer')
  })
}

module.exports = ReadStatement
