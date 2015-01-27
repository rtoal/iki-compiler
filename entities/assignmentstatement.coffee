VariableReference = require './variablereference'

class AssignmentStatement

  constructor: (@target, @source) ->

  toString: ->
    "(= #{@target} #{@source})"

  analyze: (context) ->
    @target.analyze context
    @source.analyze context
    @source.type.mustBeCompatibleWith @target.type, 'Type mismatch in assignment'

  optimize: ->
    @target = @target.optimize()
    @source = @source.optimize()
    if @source instanceof VariableReference and @target.referent is @source.referent
      null
    this

module.exports = AssignmentStatement
