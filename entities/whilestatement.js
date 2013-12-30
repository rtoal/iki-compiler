function WhileStatement(condition, body) {
  this.condition = condition;
  this.body = body;
}

WhileStatement.prototype.analyze = function (context) {
  this.condition.analyze();
  this.body.analyze();
}

WhileStatement.prototype.toString = function () {
  return '(While ' + this.condition + ' ' + this.body + ')'
}

module.exports = WhileStatement;
