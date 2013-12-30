module.exports = function(message, token) {
  if (token && token.line) {
    message = message.concat(' at line ', token.line)
    if (token.pos) {
      message = message.concat(', column ', token.pos)
    }
  }
  console.log('Error: ', message)
  process.exit(1)
}
