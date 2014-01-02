var error = require('../error')

var allTypes = {}

function Type(name) {
  this.name = name;
  allTypes[name] = this;
}

Type.BOOL = new Type('bool')
Type.INT = new Type('int')

Type.prototype.analyze = function (context) {
  // Intentionally empty - nothing to do in Iki
}

Type.prototype.toString = function () {
  return this.name;
}

Type.prototype.compatibleWith = function (other) {
  // Iki only has int and bool, and they aren't compatible at all
  return this === other;
}

Type.prototype.assertInteger = function (message, location) {
  if (!Type.INT.compatibleWith(this)) {
    error(message, location)
  }
}

Type.prototype.assertBoolean = function (message, location) {
  if (!Type.BOOL.compatibleWith(this)) {
    error(message, location)
  }
}

Type.prototype.assertCompatibleWith = function (source, message, location) {
  if (!this.compatibleWith(source.type)) {
    error(message, location)
  }
}

exports.BOOL = Type.BOOL;
exports.INT = Type.INT;
exports.forName = function (name) {console.log(allTypes, name); return allTypes[name]};
