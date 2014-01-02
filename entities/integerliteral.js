var Type = require('./type')

function IntegerLiteral(token) {
  this.token = token;
}

IntegerLiteral.prototype.analyze = function (context) {
  this.type = Type.INT
}

IntegerLiteral.prototype.toString = function () {
  return this.token.lexeme;
}

module.exports = IntegerLiteral;
