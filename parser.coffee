# Parser module
#
#   parse = require './parser'
#   program = parse tokens

scanner = require './scanner'
error = require './error'

Program = require './entities/program'
Block = require './entities/block'
Type = require './entities/type'
VariableDeclaration = require './entities/variabledeclaration'
AssignmentStatement = require './entities/assignmentstatement'
ReadStatement = require './entities/readstatement'
WriteStatement = require './entities/writestatement'
WhileStatement = require './entities/whilestatement'
IntegerLiteral = require './entities/integerliteral'
BooleanLiteral = require './entities/booleanliteral'
VariableReference = require './entities/variablereference'
BinaryExpression = require './entities/binaryexpression'
UnaryExpression = require './entities/unaryexpression'

# Collect tokens into this array, global to the module. Hmmm.
tokens = []

module.exports = (scannerOutput) ->
  tokens = scannerOutput
  program = parseProgram()
  match 'EOF'
  program

parseProgram = ->
  new Program(parseBlock())

parseBlock = ->
  statements = []
  loop
    statements.push parseStatement()
    match ';'
    break unless at ['var','ID','read','write','while']
  new Block(statements)

parseStatement = ->
  if at 'var'
    parseVariableDeclaration()
  else if at 'ID'
    parseAssignmentStatement()
  else if at 'read'
    parseReadStatement()
  else if at 'write'
    parseWriteStatement()
  else if at 'while'
    parseWhileStatement()
  else
    error 'Statement expected', tokens[0]

parseVariableDeclaration = ->
  match 'var'
  id = match 'ID'
  match ':'
  type = parseType()
  new VariableDeclaration(id, type)

parseType = ->
  if at ['int','bool']
    Type.forName match().lexeme
  else
    error 'Type expected', tokens[0]

parseAssignmentStatement = ->
  target = new VariableReference(match 'ID')
  match '='
  source = parseExpression()
  new AssignmentStatement(target, source)

parseReadStatement = ->
  match('read')
  variables = []
  variables.push(new VariableReference(match 'ID'))
  while at ','
    match()
    variables.push(new VariableReference(match('ID')))
  new ReadStatement(variables)

parseWriteStatement = ->
  match('write')
  expressions = []
  expressions.push(parseExpression())
  while at(',')
    match()
    expressions.push(parseExpression())
  new WriteStatement(expressions)

parseWhileStatement = ->
  match('while')
  condition = parseExpression()
  match('loop')
  body = parseBlock()
  match('end')
  new WhileStatement(condition, body)

parseExpression = ->
  left = parseExp1()
  while at 'or'
    op = match()
    right = parseExp1()
    left = new BinaryExpression(op, left, right)
  left

parseExp1 = ->
  left = parseExp2()
  while at 'and'
    op = match()
    right = parseExp2()
    left = new BinaryExpression(op, left, right)
  left

parseExp2 = ->
  left = parseExp3()
  if at ['<','<=','==','!=','>=','>']
    op = match()
    right = parseExp3()
    left = new BinaryExpression(op, left, right)
  left

parseExp3 = ->
  left = parseExp4()
  while at ['+','-']
    op = match()
    right = parseExp4()
    left = new BinaryExpression(op, left, right)
  left

parseExp4 = ->
  left = parseExp5()
  while at ['*','/']
    op = match()
    right = parseExp5()
    left = new BinaryExpression(op, left, right)
  left

parseExp5 = ->
  if at ['-','not']
    op = match()
    operand = parseExp6()
    new UnaryExpression(op, operand)
  else
    parseExp6()

parseExp6 = ->
  if at ['true','false']
    new BooleanLiteral(match().lexeme)
  else if at 'INTLIT'
    new IntegerLiteral(match().lexeme)
  else if at 'ID'
    new VariableReference(match())
  else if at '('
    match()
    expression = parseExpression()
    match ')'
    expression
  else
    error 'Illegal start of expression', tokens[0]

at = (kind) ->
  if tokens.length is 0
    false
  else if Array.isArray kind
    kind.some(at)
  else
    kind is tokens[0].kind

match = (kind) ->
  if tokens.length is 0
    error 'Unexpected end of source program'
  else if kind is undefined or kind is tokens[0].kind
    tokens.shift()
  else
    error "Expected #{kind} but found #{tokens[0].kind}", tokens[0]
