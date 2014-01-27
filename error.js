/*
 * Error module
 *
 *   var error = require('./error')
 *
 *   error('Something happened', {line: 7, col: 22})
 *   error('Something else happened', {line: 70, col: 1})
 *   error('That\'s strange')
 *   console.log(error.count)
 */

function error(message, location) {
  if (location && location.line) {
    message = message.concat(' at line ', location.line)
    if (location.col) {
      message = message.concat(', column ', location.col)
    }
  }
  console.log('Error: ' + message)
  error.count++
}

error.count = 0

module.exports = error
