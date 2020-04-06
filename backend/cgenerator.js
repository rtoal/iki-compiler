const {
  Program,
  Block,
  VarDec,
  AssignmentStatement,
  ReadStatement,
  WriteStatement,
  WhileStatement,
  IntLit,
  BoolLit,
  VarExp,
  UnaryExp,
  BinaryExp,
} = require('../ast');

const indentPadding = 4;
let indentLevel = 0;

function emit(line) {
  console.log(`${' '.repeat(indentPadding * indentLevel)}${line}`);
}

function makeOp(op) {
  return { not: '!', and: '&&', or: '||' }[op] || op;
}

// cName(e) takes any Iki object with an id property, and produces a C
// name by appending a unique suffix, such as '_1' or '_503'. It uses a
// a cache so it can return the same exact string each time it is called
// with a particular entity.
const cName = (() => {
  let lastId = 0;
  const map = new Map();
  return v => {
    if (!map.has(v)) {
      map.set(v, ++lastId);
    }
    return `${v.id}_${map.get(v)}`;
  };
})();

Program.prototype.gen = function() {
  indentLevel = 0;
  emit('#include <stdio.h>');
  emit('#include <stdbool.h>');
  emit('int main() {');
  this.block.gen();
  indentLevel += 1;
  emit('return 0;');
  indentLevel -= 1;
  emit('}');
};

Block.prototype.gen = function() {
  indentLevel += 1;
  this.statements.forEach(s => s.gen());
  indentLevel -= 1;
};

VarDec.prototype.gen = function() {
  emit(`${this.type.name} ${cName(this)} = 0;`);
};

AssignmentStatement.prototype.gen = function() {
  emit(`${this.target.gen()} = ${this.source.gen()};`);
};

ReadStatement.prototype.gen = function() {
  this.varexps.forEach(v => emit(`scanf("%d\\n", &${cName(v.referent)});`));
};

WriteStatement.prototype.gen = function() {
  this.expressions.forEach(e => emit(`printf("%d\\n", ${e.gen()});`));
};

WhileStatement.prototype.gen = function() {
  emit(`while (${this.condition.gen()}) {`);
  this.body.gen();
  emit('}');
};

IntLit.prototype.gen = function() {
  return this.value;
};

BoolLit.prototype.gen = function() {
  return this.value;
};

VarExp.prototype.gen = function() {
  return cName(this.referent);
};

UnaryExp.prototype.gen = function() {
  return `(${makeOp(this.op)} ${this.operand.gen()})`;
};

BinaryExp.prototype.gen = function() {
  return `(${this.left.gen()} ${makeOp(this.op)} ${this.right.gen()})`;
};
