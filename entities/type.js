var error = require('../error')

var cache = {}

function Type(name) {
  this.name = name
  cache[name] = this
}

Type.prototype.toString = function () {
  return this.name
}

exports.BOOL = Type.BOOL = new Type('bool')
exports.INT = Type.INT = new Type('int')
exports.forName = function (name) {return cache[name]}

Type.prototype.assertInteger = function (message, location) {
  if (this !== Type.INT) {
    error(message, location)
  }
}

Type.prototype.assertBoolean = function (message, location) {
  if (this !== Type.BOOL) {
    error(message, location)
  }
}

Type.prototype.assertCompatibleWith = function (sourceType, message, location) {
  // In more sophisticated languages, comapatibility would be more complex
  if (this !== sourceType) {
    error(message, location)
  }
}
