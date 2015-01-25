error = require './error'
VariableDeclaration = require './entities/VariableDeclaration'

class AnalysisContext

  constructor: (@parent) ->
    @symbolTable = {}

  @initialContext: () ->
    new AnalysisContext(null)

  createChildContext: ->
    new AnalysisContext(this)

  variableMustNotBeAlreadyDeclared: (token) ->
    if @symbolTable[token.lexeme]
      error "Variable #{token.lexeme} already declared", token

  addVariable: (name, entity) ->
    @symbolTable[name] = entity

  lookupVariable: (token) ->
    variable = @symbolTable[token.lexeme]
    if variable
      variable
    else if not this.parent
      error "Variable #{token.lexeme} not found", token
      VariableDeclaration.ARBITRARY
    else
      this.parent.lookupVariable token

exports.initialContext = AnalysisContext.initialContext
