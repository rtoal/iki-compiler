var error = require('../error')

var allTypes = {}

function Type(name) {
  this.name = name
  allTypes[name] = this
}

// In Iki there are only two types
exports.BOOL = Type.BOOL = new Type('bool')
exports.INT = Type.INT = new Type('int')
exports.forName = function (name) {return allTypes[name]}


Type.prototype.toString = function () {
  return this.name
}

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
