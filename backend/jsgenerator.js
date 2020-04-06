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
  UnaryExpression,
  BinaryExpression,
} = require('../ast');

const indentPadding = 2;
let indentLevel = 0;

function emit(line) {
  console.log(`${' '.repeat(indentPadding * indentLevel)}${line}`);
}

// The JavaScript operator corresponding to the given Iki operator.
function jsOp(op) {
  return { not: '!', and: '&&', or: '||', '==': '===', '!=': '!==' }[op] || op;
}

// jsName(e) takes any Iki object with an id property, and produces a JS
// name by appending a unique suffix, such as '_1' or '_503'. It uses a
// a cache so it can return the same exact string each time it is called
// with a particular entity.
const jsName = (() => {
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
  emit('(function () {');
  this.block.gen();
  emit('}());');
};

Block.prototype.gen = function() {
  indentLevel += 1;
  this.statements.forEach(s => s.gen());
  indentLevel -= 1;
};

VarDec.prototype.gen = function() {
  const initializer = { int: '0', bool: 'false' }[this.type.name];
  emit(`let ${jsName(this)} = ${initializer};`);
};

AssignmentStatement.prototype.gen = function() {
  emit(`${this.target.gen()} = ${this.source.gen()};`);
};

ReadStatement.prototype.gen = function() {
  this.varexps.forEach(v => emit(`${jsName(v.referent)} = prompt();`));
};

WriteStatement.prototype.gen = function() {
  this.expressions.forEach(e => emit(`console.log(${e.gen()});`));
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
  return jsName(this.referent);
};

UnaryExpression.prototype.gen = function() {
  return `(${jsOp(this.op)} ${this.operand.gen()})`;
};

BinaryExpression.prototype.gen = function() {
  return `(${this.left.gen()} ${jsOp(this.op)} ${this.right.gen()})`;
};
