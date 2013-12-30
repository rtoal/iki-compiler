var scanner = require('./scanner')
var error = require('./error')

var Program = require('./entities/program')
var Block = require('./entities/block')
var VariableDeclaration = require('./entities/variabledeclaration')
var AssignmentStatement = require('./entities/assignmentstatement')
var ReadStatement = require('./entities/readstatement')
var WriteStatement = require('./entities/writestatement')
var WhileStatement = require('./entities/whilestatement')
var IntegerLiteral = require('./entities/integerliteral')
var VariableReference = require('./entities/variablereference')
var BinaryExpression = require('./entities/binaryexpression')

var tokens;

function at(symbol) {
  if (tokens.length === 0) {
    return false
  }
  if (Array.isArray(symbol)) {
    return symbol.some(function (s) {return at(s)})
  } else {
    return symbol === tokens[0].kind
  }  
}

function match (symbol) {
  if (tokens.length === 0) {
    error('Unexpected end of input')
  } else if (symbol === undefined || symbol === tokens[0].kind) {
    return tokens.shift();
  } else {
    error('Expected ' + symbol + ' but found ' + tokens[0], tokens[0])
  }
}

function parseProgram() {
  match('begin')
  var block = parseBlock()
  match('end')
  return new Program(block)
}

function parseBlock() {
  var declarations = []
  var statements = []
  while (at('var')) {
    declarations.push(parseDeclaration())
    match(';')
  }
  do {
    statements.push(parseStatement())
    match(';')
 } while (at(['ID','read','write','while']))
  return new Block(declarations, statements)
}

function parseDeclaration() {
  match('var')
  var id = match('ID')
  return new VariableDeclaration(id)
}

function parseStatement() {
  if (at('ID')) {
    var id = match()
    match('=')
    var exp = parseExpression()
    return new AssignmentStatement(new VariableReference(id), exp)
  
  } else if (at('read')) {
    var ids = []
    match()
    var id = match('ID')
    ids.push(new VariableReference(id))
    while (at(',')) {
      match()
      id = match('ID')
      ids.push(new VariableReference(id))
    }
    return new ReadStatement(ids)
  
  } else if (at('write')) {
    var expressions = []
    match()
    var exp = parseExpression()
    expressions.push(exp)
    while (at(',')) {
      match()
      var exp = parseExpression()
      expressions.push(exp)
    }
    return new WriteStatement(expressions)
  
  } else if (at('while')) {
    match()
    condition = parseExpression()
    match('loop')
    body = parseBlock()
    match('end')
    return new WhileStatement(condition, body)
  
  } else {
    error('Illegal start of statement', tokens[0])
  }
}

function parseExpression() {
  var left = parseTerm()
  while (at(['+','-'])) {
    var op = match()
    var right = parseTerm()
    left = new BinaryExpression(op, left, right)
  }
  return left
}

function parseTerm() {
  var left = parseFactor()
  while (at(['*','/'])) {
    op = match()
    right = parseFactor()
    left = new BinaryExpression(op, left, right)
  }
  return left
}

function parseFactor() {
  if (at('INTLIT')) {
    return new IntegerLiteral(match())
  } else if (at('ID')) {
    return new VariableReference(match())
  } else if (at('(')) {
    match();
    var expression = parseExpression();
    match(')');
    return expression;
  } else {
    error('Illegal start of expression', tokens[0])
  }
}

module.exports = function (t, callback) {
  tokens = t
  callback(parseProgram())
}
