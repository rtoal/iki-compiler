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

module.exports = {
  TRUE: new BooleanLiteral('true'),
  FALSE: new BooleanLiteral('false'),
  forName: function (name) {return cache[name]}
}
