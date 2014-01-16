var Type = require('./type')

var cache = {}

function BooleanLiteral(name) {
  this.name = name
  cache[name] = this
}

BooleanLiteral.prototype.toString = function () {
  return this.name
}

BooleanLiteral.prototype.analyze = function (context) {
  this.type = Type.BOOL
}

exports.TRUE = new BooleanLiteral('true')
exports.FALSE = new BooleanLiteral('false')
exports.forName = function (name) {return cache[name]}
