var Type = require('./type')

function IntegerLiteral(token) {
  this.token = token
}

IntegerLiteral.prototype.toString = function () {
  return this.token.lexeme
}

IntegerLiteral.prototype.analyze = function (context) {
  this.type = Type.INT
}

module.exports = IntegerLiteral
