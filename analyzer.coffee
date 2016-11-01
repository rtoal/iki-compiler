error = require './error'
VariableDeclaration = require './entities/VariableDeclaration'

class AnalysisContext

  constructor: (@parent) ->
    @symbolTable = {}

  @initialContext: () ->
    new AnalysisContext(null)

  createChildContext: ->
    new AnalysisContext(this)

  variableMustNotBeAlreadyDeclared: (name) ->
    if @symbolTable[name]
      error "Variable #{name} already declared", name

  addVariable: (name, entity) ->
    @symbolTable[name] = entity

  lookupVariable: (name) ->
    variable = @symbolTable[name]
    if variable
      variable
    else if not @parent
      error "Variable #{name} not found", name
      VariableDeclaration.ARBITRARY
    else
      @parent.lookupVariable name

exports.initialContext = AnalysisContext.initialContext
