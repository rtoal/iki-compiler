const { initialContext } = require('./analyzer');

class Type {
  constructor(name) {
    this.name = name;
    Type.cache[name] = this;
  }
  mustBeInteger(message) {
    return this.mustBeCompatibleWith(Type.INT, message);
  }
  mustBeBoolean(message) {
    return this.mustBeCompatibleWith(Type.BOOL, message);
  }
  mustBeCompatibleWith(otherType, message) {
    if (!this.isCompatibleWith(otherType)) {
      throw message;
    }
  }
  mustBeMutuallyCompatibleWith(otherType, message) {
    if (!(this.isCompatibleWith(otherType) || otherType.isCompatibleWith(this))) {
      throw message;
    }
  }
  isCompatibleWith(otherType) {
    // In more sophisticated languages, comapatibility would be more complex
    return this === otherType;
  }
}

Type.cache = {};
Type.BOOL = new Type('bool');
Type.INT = new Type('int');
Type.forName = name => Type.cache[name];

class BooleanLiteral {
  constructor(name) {
    this.name = name;
  }
  value() {
    return this.name === true;
  }
  analyze() {
    this.type = Type.BOOL;
  }
}

class IntegerLiteral {
  constructor(value) {
    this.value = value;
  }
  analyze() {
    this.type = Type.INT;
  }
  optimize() {
    return this;
  }
}

class VariableDeclaration {
  constructor(id, type) {
    Object.assign(this, { id, type });
  }
  analyze(context) {
    context.variableMustNotBeAlreadyDeclared(this.id);
    context.addVariable(this.id, this);
  }
  optimize() {
    return this;
  }
}

class VariableExpression {
  constructor(name) {
    this.name = name;
  }
  analyze(context) {
    this.referent = context.lookupVariable(this.name);
    this.type = this.referent.type;
  }
  optimize() {
    return this;
  }
}

class UnaryExpression {
  constructor(op, operand) {
    Object.assign(this, { op, operand });
  }
  analyze(context) {
    this.operand.analyze(context);
    if (this.op === 'not') {
      this.operand.type.mustBeBoolean('The "not" operator requires a boolean operand', this.op);
      this.type = Type.BOOL;
    } else if (this.op === '-') {
      this.operand.type.mustBeInteger('Negation requires an integer operand', this.op);
      this.type = Type.INT;
    }
  }
  optimize() {
    this.operand = this.operand.optimize();
    if (this.op === 'not' && this.operand instanceof BooleanLiteral) {
      return new BooleanLiteral(!this.operand.value);
    } else if (this.op === '-' && this.operand instanceof IntegerLiteral) {
      return new IntegerLiteral(-this.operand.value);
    }
    return this;
  }
}

class BinaryExpression {
  constructor(op, left, right) {
    Object.assign(this, { op, left, right });
  }
  analyze(context) {
    this.left.analyze(context);
    this.right.analyze(context);
    if (['<', '<=', '>=', '>'].includes(this.op)) {
      this.mustHaveIntegerOperands();
      this.type = Type.BOOL;
    } else if (['==', '!='].includes(this.op)) {
      this.mustHaveCompatibleOperands();
      this.type = Type.BOOL;
    } else if (['and', 'or'].includes(this.op)) {
      this.mustHaveBooleanOperands();
      this.type = Type.BOOL;
    } else {
      // All other binary operators are arithmetic
      this.mustHaveIntegerOperands();
      this.type = Type.INT;
    }
  }
  optimize() {
    this.left = this.left.optimize();
    this.right = this.right.optimize();
    if (this.left instanceof IntegerLiteral && this.right instanceof IntegerLiteral) {
      return this.foldIntegerConstants();
    } else if (this.left instanceof BooleanLiteral && this.right instanceof BooleanLiteral) {
      return this.foldBooleanConstants();
    } else if (this.op === '+') {
      if (isZero(this.right)) return this.left;
      if (isZero(this.left)) return this.right;
    } else if (this.op === '-') {
      if (isZero(this.right)) return this.left;
      if (sameVariable(this.left, this.right)) return new IntegerLiteral(0);
    } else if (this.op === '*') {
      if (isOne(this.right)) return this.left;
      if (isOne(this.left)) return this.right;
      if (isZero(this.right)) return new IntegerLiteral(0);
      if (isZero(this.left)) return new IntegerLiteral(0);
    } else if (this.op === '/') {
      if (isOne(this.right, 1)) return this.left;
      if (sameVariable(this.left, this.right)) return new IntegerLiteral(1);
    }
    return this;
  }
  mustHaveIntegerOperands() {
    const errorMessage = `${this.op} must have integer operands`;
    this.left.type.mustBeCompatibleWith(Type.INT, errorMessage, this.op);
    this.right.type.mustBeCompatibleWith(Type.INT, errorMessage, this.op);
  }
  mustHaveBooleanOperands() {
    const errorMessage = `${this.op} must have boolean operands`;
    this.left.type.mustBeCompatibleWith(Type.BOOL, errorMessage, this.op);
    this.right.type.mustBeCompatibleWith(Type.BOOL, errorMessage, this.op);
  }
  mustHaveCompatibleOperands() {
    const errorMessage = `${this.op} must have mutually compatible operands`;
    this.left.type.mustBeMutuallyCompatibleWith(this.right.type, errorMessage, this.op);
  }
  foldIntegerConstants() {
    switch (this.op) {
      case '+': return new IntegerLiteral(+this.left + this.right);
      case '-': return new IntegerLiteral(+this.left - this.right);
      case '*': return new IntegerLiteral(+this.left * this.right);
      case '/': return new IntegerLiteral(+this.left / this.right);
      case '<': return new BooleanLiteral(+this.left < this.right);
      case '<=': return new BooleanLiteral(+this.left <= this.right);
      case '==': return new BooleanLiteral(+this.left === this.right);
      case '!=': return new BooleanLiteral(+this.left !== this.right);
      case '>=': return new BooleanLiteral(+this.left >= this.right);
      case '>': return new BooleanLiteral(+this.left > this.right);
      default: return this;
    }
  }
  foldBooleanConstants() {
    switch (this.op) {
      case '==': return new BooleanLiteral(this.left === this.right);
      case '!=': return new BooleanLiteral(this.left !== this.right);
      case 'and': return new BooleanLiteral(this.left && this.right);
      case 'or': return new BooleanLiteral(this.left || this.right);
      default: return this;
    }
  }
}

class AssignmentStatement {
  constructor(target, source) {
    Object.assign(this, { target, source });
  }
  analyze(context) {
    this.target.analyze(context);
    this.source.analyze(context);
    this.source.type.mustBeCompatibleWith(this.target.type, 'Type mismatch in assignment');
  }
  optimize() {
    this.target = this.target.optimize();
    this.source = this.source.optimize();
    if (this.source instanceof VariableExpression &&
        this.target.referent === this.source.referent) {
      return null;
    }
    return this;
  }
}

class ReadStatement {
  constructor(varexps) {
    this.varexps = varexps;
  }
  analyze(context) {
    this.varexps.forEach((v) => {
      v.analyze(context);
      v.type.mustBeInteger('Variables in "read" statement must have type integer');
    });
  }
  optimize() {
    return this;
  }
}

class WriteStatement {
  constructor(expressions) {
    this.expressions = expressions;
  }
  analyze(context) {
    this.expressions.forEach((e) => {
      e.analyze(context);
      e.type.mustBeInteger('Expressions in "write" statement must have type integer');
    });
  }
  optimize() {
    this.expressions = this.expressions.map(e => e.optimize());
    return this;
  }
}

class WhileStatement {
  constructor(condition, body) {
    Object.assign(this, { condition, body });
  }
  analyze(context) {
    this.condition.analyze(context);
    this.condition.type.mustBeBoolean('Condition in "while" statement must be boolean');
    this.body.analyze(context);
  }
  optimize() {
    this.condition = this.condition.optimize();
    this.body = this.body.optimize();
    if (this.condition instanceof BooleanLiteral && this.condition.value === false) {
      return null;
    }
    return this;
  }
}

class Block {
  constructor(statements) {
    this.statements = statements;
  }
  analyze(context) {
    const localContext = context.createChildContext();
    this.statements.forEach(s => s.analyze(localContext));
  }
  optimize() {
    this.statements = this.statements.map(s => s.optimize()).filter(s => s !== null);
    return this;
  }
}

class Program {
  constructor(block) {
    this.block = block;
  }
  analyze() {
    this.block.analyze(initialContext());
  }
  optimize() {
    this.block = this.block.optimize();
    return this;
  }
}

function isZero(entity) {
  return entity instanceof IntegerLiteral && entity.value === 0;
}

function isOne(entity) {
  return entity instanceof IntegerLiteral && entity.value === 1;
}

function sameVariable(e1, e2) {
  return e1 instanceof VariableExpression &&
         e2 instanceof VariableExpression &&
         e1.referent === e2.referent;
}

module.exports = {
  Type,
  BooleanLiteral,
  IntegerLiteral,
  VariableExpression,
  UnaryExpression,
  BinaryExpression,
  VariableDeclaration,
  AssignmentStatement,
  ReadStatement,
  WriteStatement,
  WhileStatement,
  Block,
  Program,
};
