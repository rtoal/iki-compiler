function IntegerLiteral(token) {
  this.token = token;
}

IntegerLiteral.prototype.analyze = function (context) {
  // TODO
}

IntegerLiteral.prototype.toString = function () {
  return this.token.lexeme;
}

module.exports = IntegerLiteral;
