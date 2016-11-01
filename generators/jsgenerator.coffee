util = require('util')
HashMap = require('hashmap').HashMap

module.exports = (program) ->
  gen program

indentPadding = 4
indentLevel = 0

emit = (line) ->
  pad = indentPadding * indentLevel
  console.log(Array(pad+1).join(' ') + line)

makeOp = (op) ->
  {not: '!', and: '&&', or: '||', '==': '===', '!=': '!=='}[op] or op

makeVariable = do (lastId = 0, map = new HashMap()) ->
  (v) ->
    map.set v, ++lastId if not map.has v
    '_v' + map.get v

gen = (e) ->
  generator[e.constructor.name](e)

generator =

  Program: (program) ->
    indentLevel = 0
    emit '(function () {'
    gen program.block
    emit '}());'

  Block: (block) ->
    indentLevel++
    gen statement for statement in block.statements
    indentLevel--

  VariableDeclaration: (v) ->
    initializer = {'int': '0', 'bool': 'false'}[v.type]
    emit "var #{makeVariable v} = #{initializer};"

  AssignmentStatement: (s) ->
    emit "#{gen s.target} = #{gen s.source};"

  ReadStatement: (s) ->
    emit "#{makeVariable(v.referent)} = prompt();" for v in s.varrefs

  WriteStatement: (s) ->
    emit "alert(#{gen(e)});" for e in s.expressions

  WhileStatement: (s) ->
    emit "while (#{gen s.condition}) {"
    gen s.body
    emit '}'

  IntegerLiteral: (literal) -> literal.toString()

  BooleanLiteral: (literal) -> literal.toString()

  VariableReference: (v) -> makeVariable v.referent

  UnaryExpression: (e) -> "(#{makeOp e.op} #{gen e.operand})"

  BinaryExpression: (e) ->
    "(#{gen e.left} #{makeOp e.op} #{gen e.right})"
