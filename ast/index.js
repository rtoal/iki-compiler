class Program {
  constructor(block) {
    this.block = block;
  }
}

class Block {
  constructor(statements) {
    this.statements = statements;
  }
}

class VariableDeclaration {
  constructor(id, type) {
    Object.assign(this, { id, type });
  }
}

class Type {
  constructor(name) {
    this.name = name;
  }
}

const IntType = new Type('int');
const BoolType = new Type('bool');

class AssignmentStatement {
  constructor(target, source) {
    Object.assign(this, { target, source });
  }
}

class ReadStatement {
  constructor(varexps) {
    this.varexps = varexps;
  }
}

class WriteStatement {
  constructor(expressions) {
    this.expressions = expressions;
  }
}

class WhileStatement {
  constructor(condition, body) {
    Object.assign(this, { condition, body });
  }
}

class Expression {}

class BooleanLiteral extends Expression {
  constructor(value) {
    super();
    this.value = value;
  }
}

class IntegerLiteral extends Expression {
  constructor(value) {
    super();
    this.value = value;
  }
}

class VariableExpression extends Expression {
  constructor(name) {
    super();
    this.name = name;
  }
}

class UnaryExpression extends Expression {
  constructor(op, operand) {
    super();
    Object.assign(this, { op, operand });
  }
}

class BinaryExpression extends Expression {
  constructor(op, left, right) {
    super();
    Object.assign(this, { op, left, right });
  }
}

module.exports = {
  Program,
  Block,
  VariableDeclaration,
  Type,
  IntType,
  BoolType,
  AssignmentStatement,
  ReadStatement,
  WriteStatement,
  WhileStatement,
  Expression,
  BooleanLiteral,
  IntegerLiteral,
  VariableExpression,
  UnaryExpression,
  BinaryExpression,
};
