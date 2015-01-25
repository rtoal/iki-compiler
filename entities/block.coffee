class Block

  constructor: (@statements) ->

  toString: () ->
    "(Block #{@statements.join(' ')})"

  analyze: (context) ->
    localContext = context.createChildContext()
    statement.analyze(localContext) for statement in @statements

  optimize: ->
    @statements = (s.optimize() for s in @statements)
    @statements = (s for s in @statements when s isnt null)
    this

module.exports = Block
