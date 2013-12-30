function ReadStatement(varrefs) {
  this.varrefs = varrefs;
}

ReadStatement.prototype.analyze = function (context) {
  // TODO
}

ReadStatement.prototype.toString = function () {
  return '(Read ' + this.varrefs.join(' ') + ')'
}

module.exports = ReadStatement;
