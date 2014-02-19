/*
 * Generator module
 *
 *   var generate = require('./generator')(targetType)  // e.g. 'x86', 'c', 'js'
 *
 *   generate(program)
 */

var error = require('./error')

module.exports = function (targetType) {
  try {
    var generator = require('./generators/' + targetType + 'generator')
  } catch (e) {
    error('No such target type: ' + targetType)
  }
  return generator
}
