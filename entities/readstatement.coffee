class ReadStatement

  constructor: (@varrefs) ->

  toString: ->
    "(Read #{this.varrefs.join(' ')})"

  analyze: (context) ->
    for v in @varrefs
      v.analyze(context)
      v.type.mustBeInteger 'Variables in "read" statement must have type integer'

  optimize: ->
    this

module.exports = ReadStatement
