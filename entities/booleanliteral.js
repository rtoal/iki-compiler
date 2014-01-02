var Type = require('./type')

function BooleanLiteral(token) {
  this.token = token;
}

BooleanLiteral.prototype.analyze = function (context) {
  this.type = Type.BOOL
}

BooleanLiteral.prototype.toString = function () {
  return this.token.lexeme;
}

module.exports = BooleanLiteral;
