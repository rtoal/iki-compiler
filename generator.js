var error = require('./error')

module.exports = function (targetType) {
  try {
    var generator = require('./generators/' + targetType + 'generator')
  } catch (e) {
    error('No such target type: ' + targetType)
  }
  // TODO needs an output stream
  return generator
}
