var error = require('../error')

var cache = {}

function Type(name) {
  this.name = name
  cache[name] = this
}

Type.BOOL = new Type('bool')
Type.INT = new Type('int')
Type.ARBITRARY = new Type('<arbitrary_type>')

Type.prototype.toString = function () {
  return this.name
}

Type.prototype.mustBeInteger = function (message, location) {
  this.mustBeCompatibleWith(Type.INT, message)
}

Type.prototype.mustBeBoolean = function (message, location) {
  this.mustBeCompatibleWith(Type.BOOL, message)
}

Type.prototype.mustBeCompatibleWith = function (otherType, message, location) {
  if (! this.isCompatibleWith(otherType)) {
    error(message, location)
  }
}

Type.prototype.mustBeMutuallyCompatibleWith = function (otherType, message, location) {
  if (! (this.isCompatibleWith(otherType) || otherType.isCompatibleWith(this))) {
    error(message, location)
  }
}

Type.prototype.isCompatibleWith = function (otherType) {
  // In more sophisticated languages, comapatibility would be more complex
  return this === otherType || this === Type.ARBITRARY || otherType === Type.ARBITRARY;  
}

module.exports = {
  BOOL: Type.BOOL,
  INT: Type.INT,
  ARBITRARY: Type.ARBITRARY,
  forName: function (name) {return cache[name]}
}
