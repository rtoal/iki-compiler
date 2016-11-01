Type = require './type'

class VariableDeclaration

  constructor: (@id, @type) ->

  toString: ->
    "(Var :#{@id} #{@type})"

  analyze: (context) ->
    context.variableMustNotBeAlreadyDeclared @id
    context.addVariable @id, this

  optimize: -> this

VariableDeclaration.ARBITRARY = new VariableDeclaration '<arbitrary>', Type.ARBITRARY

module.exports = VariableDeclaration
