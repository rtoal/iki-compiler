var Type = require('./type')

function BooleanLiteral(name) {
  this.name = "" + name
}

BooleanLiteral.prototype.value = function () {
  return this.name === 'true'
}

BooleanLiteral.prototype.toString = function () {
  return this.name
}

BooleanLiteral.prototype.analyze = function (context) {
  this.type = Type.BOOL
}

BooleanLiteral.prototype.optimize = function () {
  return this
}

module.exports = BooleanLiteral
