Type = require './type'

class VariableDeclaration

  constructor: (@id, @type) ->

  toString = ->
    "(Var :#{@id.lexeme} #{@type})"

  analyze: (context) ->
    context.variableMustNotBeAlreadyDeclared @id
    context.addVariable @id.lexeme, this

  optimize: -> this

VariableDeclaration.ARBITRARY = new VariableDeclaration '<arbitrary>', Type.ARBITRARY

module.exports = VariableDeclaration
