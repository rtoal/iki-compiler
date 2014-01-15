var Type = require('./type')

var all = {}

function BooleanLiteral(name) {
  this.name = name;
  all[name] = this
}

exports.TRUE = BooleanLiteral.TRUE = new BooleanLiteral('true')
exports.FALSE = BooleanLiteral.FALSE = new BooleanLiteral('false')
exports.forName = function (name) {return all[name]}

BooleanLiteral.prototype.analyze = function (context) {
  this.type = Type.BOOL
}

BooleanLiteral.prototype.toString = function () {
  return this.name
}
