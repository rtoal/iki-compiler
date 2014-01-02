function ReadStatement(varrefs) {
  this.varrefs = varrefs;
}

ReadStatement.prototype.analyze = function (context) {
  this.varrefs.forEach(function (v) {v.analyze(context)})
}

ReadStatement.prototype.toString = function () {
  return '(Read ' + this.varrefs.join(' ') + ')'
}

module.exports = ReadStatement;
