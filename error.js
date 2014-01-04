module.exports = function(message, location) {
  if (location && location.line) {
    message = message.concat(' at line ', location.line)
    if (location.col) {
      message = message.concat(', column ', location.col)
    }
  }
  console.log('Error: ' + message)
  process.exit(1)
}
