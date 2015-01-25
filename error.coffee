# Error module
#
#   var error = require('./error')
#
#   error('Something happened', {line: 7, col: 22})
#   error('Illegal start of expression', token)
#   error.quiet = true
#   error('That\'s strange')
#   error('Type mismatch', {line: 100})
#   console.log(error.count)   // 3

error = (message, location) ->
  if location and location.line
    message = message.concat ' at line ', location.line
    if location.col
      message = message.concat ', column ', location.col
  if not error.quiet
    console.log "Error: #{message}"
  error.count++

error.quiet = false

error.count = 0

module.exports = error
