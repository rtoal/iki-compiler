const {
  Program,
  Block,
  VarDec,
  AssignmentStatement,
  ReadStatement,
  WriteStatement,
  WhileStatement,
  Expression,
  IntLit,
  BoolLit,
  VarExp,
  UnaryExpression,
  BinaryExpression,
} = require('../ast');

Program.prototype.optimize = function() {
  this.block = this.block.optimize();
  return this;
};

Block.prototype.optimize = function() {
  this.statements = this.statements.map(s => s.optimize()).filter(s => s !== null);
  return this;
};

VarDec.prototype.optimize = function() {
  return this;
};

AssignmentStatement.prototype.optimize = function() {
  this.target = this.target.optimize();
  this.source = this.source.optimize();
  if (this.source instanceof VarExp && this.target.referent === this.source.referent) {
    return null;
  }
  return this;
};

ReadStatement.prototype.optimize = function() {
  return this;
};

WriteStatement.prototype.optimize = function() {
  this.expressions = this.expressions.map(e => e.optimize());
  return this;
};

WhileStatement.prototype.optimize = function() {
  this.condition = this.condition.optimize();
  this.body = this.body.optimize();
  if (this.condition instanceof BoolLit && this.condition.value === false) {
    return null;
  }
  return this;
};

Expression.prototype.optimize = function() {
  return this;
};

UnaryExpression.prototype.optimize = function() {
  this.operand = this.operand.optimize();
  if (this.op === 'not' && this.operand instanceof BoolLit) {
    return new BoolLit(!this.operand.value);
  }
  if (this.op === '-' && this.operand instanceof IntLit) {
    return new IntLit(-this.operand.value);
  }
  return this;
};

BinaryExpression.prototype.optimize = function() {
  this.left = this.left.optimize();
  this.right = this.right.optimize();
  if (this.left instanceof IntLit && this.right instanceof IntLit) {
    return this.foldIntegerConstants();
  } else if (this.left instanceof BoolLit && this.right instanceof BoolLit) {
    return this.foldBooleanConstants();
  } else if (this.op === '+') {
    if (this.right.isZero()) return this.left;
    if (this.left.isZero()) return this.right;
  } else if (this.op === '-') {
    if (this.right.isZero()) return this.left;
    if (this.left.sameVariableAs(this.right)) return new IntLit(0);
  } else if (this.op === '*') {
    if (this.right.isOne()) return this.left;
    if (this.left.isOne()) return this.right;
    if (this.right.isZero()) return new IntLit(0);
    if (this.left.isZero()) return new IntLit(0);
  } else if (this.op === '/') {
    if (this.right.isOne()) return this.left;
    if (this.left.sameVariableAs(this.right)) return new IntLit(1);
  } else if (this.op === 'or') {
    if (this.right.isFalse()) return this.left;
    if (this.left.isFalse()) return this.right;
    if (this.left.isTrue() || this.right.isTrue()) return new BoolLit(true);
  } else if (this.op === 'and') {
    if (this.right.isTrue()) return this.left;
    if (this.left.isTrue()) return this.right;
    if (this.left.isFalse() || this.right.isFalse()) return new BoolLit(false);
  }
  return this;
};

Object.assign(Expression.prototype, {
  isZero() {
    return this instanceof IntLit && this.value === 0;
  },
  isOne() {
    return this instanceof IntLit && this.value === 1;
  },
  isFalse() {
    return this instanceof BoolLit && this.value === false;
  },
  isTrue() {
    return this instanceof BoolLit && this.value === true;
  },
  sameVariableAs(e) {
    return this instanceof VarExp && e instanceof VarExp && this.referent === e.referent;
  },
});

Object.assign(BinaryExpression.prototype, {
  foldIntegerConstants() {
    const x = Number(this.left.value);
    const y = Number(this.right.value);
    switch (this.op) {
      case '+':
        return new IntLit(x + y);
      case '-':
        return new IntLit(x - y);
      case '*':
        return new IntLit(x * y);
      case '/':
        return new IntLit(x / y);
      case '<':
        return new BoolLit(x < y);
      case '<=':
        return new BoolLit(x <= y);
      case '==':
        return new BoolLit(x === y);
      case '!=':
        return new BoolLit(x !== y);
      case '>=':
        return new BoolLit(x >= y);
      case '>':
        return new BoolLit(x > y);
      default:
        return this;
    }
  },
  foldBooleanConstants() {
    switch (this.op) {
      case '==':
        return new BoolLit(this.left === this.right);
      case '!=':
        return new BoolLit(this.left !== this.right);
      case 'and':
        return new BoolLit(this.left && this.right);
      case 'or':
        return new BoolLit(this.left || this.right);
      default:
        return this;
    }
  },
});
