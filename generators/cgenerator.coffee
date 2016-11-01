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
  {not: '!', and: '&&', or: '||'}[op] or op

makeVariable = do (lastId = 0, map = new HashMap()) ->
  (v) ->
    map.set v, ++lastId if not map.has v
    '_v' + map.get v

gen = (e) ->
  generator[e.constructor.name](e)

generator =

  Program: (program) ->
    indentLevel = 0
    emit '#include <stdio.h>'
    emit 'int main() {'
    gen program.block
    indentLevel++
    emit 'return 0;'
    indentLevel--
    emit '}'

  Block: (block) ->
    indentLevel++
    gen statement for statement in block.statements
    indentLevel--

  VariableDeclaration: (v) ->
    emit "#{v.type} #{makeVariable v} = 0};"

  AssignmentStatement: (s) ->
    emit "#{gen s.target} = #{gen s.source};"

  ReadStatement: (s) ->
    emit "scanf(\"%d\\n\", &#{makeVariable(v.referent)});" for v in s.varrefs

  WriteStatement: (s) ->
    emit "printf(\"%d\\n\", #{gen(e)});" for e in s.expressions

  WhileStatement: (s) ->
    emit "while (#{gen s.condition}) {"
    gen s.body
    emit '}'

  IntegerLiteral: (literal) -> literal.toString()

  BooleanLiteral: (literal) ->
    # Assume old-style C without a boolean type so just use 0 and 1
    return ['false','true'].indexOf(literal.toString())

  VariableReference: (v) -> makeVariable v.referent

  UnaryExpression: (e) -> "(#{makeOp e.op} #{gen e.operand})"

  BinaryExpression: (e) ->
    "(#{gen e.left} #{makeOp e.op} #{gen e.right})"
