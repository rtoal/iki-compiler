# Generator module
#
#   var generate = require('./generator')(targetType)  // e.g. 'x86', 'c', 'js'
#
#   generate(program)

error = require './error'

module.exports = (targetType) ->
  try
    generator = require "./generators/#{targetType}generator"
  catch e
    error "No such target type: #{targetType}"
  generator
