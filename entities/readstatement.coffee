class ReadStatement

  constructor: (@varexps) ->

  toString: ->
    "(Read #{@varexps.join(' ')})"

  analyze: (context) ->
    for v in @varexps
      v.analyze(context)
      v.type.mustBeInteger 'Variables in "read" statement must have type integer'

  optimize: ->
    this

module.exports = ReadStatement
