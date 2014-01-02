var Type = require('./type')

function WhileStatement(condition, body) {
  this.condition = condition;
  this.body = body;
}

WhileStatement.prototype.analyze = function (context) {
  this.condition.analyze(context);
  this.condition.type.assertBoolean('Condition in while statement must be boolean')
  this.body.analyze(context);
}

WhileStatement.prototype.toString = function () {
  return '(While ' + this.condition + ' ' + this.body + ')'
}

module.exports = WhileStatement;
