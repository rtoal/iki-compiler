const indentPadding = 4;
let indentLevel = 0;

function emit(line) {
  console.log(`${' '.repeat(indentPadding * indentLevel)}${line}`);
}

function makeOp(op) {
  return { not: '!', and: '&&', or: '||' }[op] || op;
}

// cName(e) takes any Iki object with an id property, such as a
// Variable, Parameter, or FunctionDeclaration, and produces a C
// name by appending a unique indentifying suffix, such as '_1' or '_503'.
// It uses a cache so it can return the same exact string each time it is
// called with a particular entity.
const cName = (() => {
  let lastId = 0;
  const map = new Map();
  return (v) => {
    if (!(map.has(v))) {
      map.set(v, ++lastId); // eslint-disable-line no-plusplus
    }
    return `${v.id}_${map.get(v)}`;
  };
})();

const generator = {
  Program(program) {
    indentLevel = 0;
    emit('#include <stdio.h>');
    emit('#include <stdbool.h>');
    emit('int main() {');
    gen(program.block);
    indentLevel += 1;
    emit('return 0;');
    indentLevel -= 1;
    emit('}');
  },
  Block(block) {
    indentLevel += 1;
    block.statements.forEach(gen);
    indentLevel -= 1;
  },
  VariableDeclaration(v) { emit(`${v.type.name} ${cName(v)} = 0;`); },
  AssignmentStatement(s) { emit(`${gen(s.target)} = ${gen(s.source)};`); },
  ReadStatement(s) { s.varexps.forEach(v => emit(`scanf("%d\\n", &${cName(v.referent)});`)); },
  WriteStatement(s) { s.expressions.forEach(e => emit(`printf("%d\\n", ${gen(e)});`)); },
  WhileStatement(s) {
    emit(`while (${gen(s.condition)}) {`);
    gen(s.body);
    emit('}');
  },
  IntegerLiteral(literal) { return literal.value; },
  BooleanLiteral(literal) { return literal.value; },
  VariableExpression(v) { return cName(v.referent); },
  UnaryExpression(e) { return `(${makeOp(e.op)} ${gen(e.operand)})`; },
  BinaryExpression(e) { return `(${gen(e.left)} ${makeOp(e.op)} ${gen(e.right)})`; },
};

function gen(e) {
  return generator[e.constructor.name](e);
}

module.exports = gen;
