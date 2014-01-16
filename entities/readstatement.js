function ReadStatement(varrefs) {
  this.varrefs = varrefs
}

ReadStatement.prototype.toString = function () {
  return '(Read ' + this.varrefs.join(' ') + ')'
}

ReadStatement.prototype.analyze = function (context) {
  this.varrefs.forEach(function (v) {v.analyze(context)})
}

module.exports = ReadStatement
