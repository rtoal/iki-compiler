module.exports = function(message, location) {
  if (location && location.line) {
    message = message.concat(' at line ', location.line)
    if (location.pos) {
      message = message.concat(', column ', location.pos)
    }
  }
  console.log('Error: ' + message)
  process.exit(1)
}
