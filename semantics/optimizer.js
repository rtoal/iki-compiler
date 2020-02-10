const {
  Program,
  Block,
  VariableDeclaration,
  AssignmentStatement,
  ReadStatement,
  WriteStatement,
  WhileStatement,
  Expression,
  IntegerLiteral,
  BooleanLiteral,
  VariableExpression,
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

VariableDeclaration.prototype.optimize = function() {
  return this;
};

AssignmentStatement.prototype.optimize = function() {
  this.target = this.target.optimize();
  this.source = this.source.optimize();
  if (this.source instanceof VariableExpression && this.target.referent === this.source.referent) {
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
  if (this.condition instanceof BooleanLiteral && this.condition.value === false) {
    return null;
  }
  return this;
};

Expression.prototype.optimize = function() {
  return this;
};

UnaryExpression.prototype.optimize = function() {
  this.operand = this.operand.optimize();
  if (this.op === 'not' && this.operand instanceof BooleanLiteral) {
    return new BooleanLiteral(!this.operand.value);
  }
  if (this.op === '-' && this.operand instanceof IntegerLiteral) {
    return new IntegerLiteral(-this.operand.value);
  }
  return this;
};

BinaryExpression.prototype.optimize = function() {
  this.left = this.left.optimize();
  this.right = this.right.optimize();
  if (this.left instanceof IntegerLiteral && this.right instanceof IntegerLiteral) {
    return this.foldIntegerConstants();
  } else if (this.left instanceof BooleanLiteral && this.right instanceof BooleanLiteral) {
    return this.foldBooleanConstants();
  } else if (this.op === '+') {
    if (this.right.isZero()) return this.left;
    if (this.left.isZero()) return this.right;
  } else if (this.op === '-') {
    if (this.right.isZero()) return this.left;
    if (this.left.sameVariableAs(this.right)) return new IntegerLiteral(0);
  } else if (this.op === '*') {
    if (this.right.isOne()) return this.left;
    if (this.left.isOne()) return this.right;
    if (this.right.isZero()) return new IntegerLiteral(0);
    if (this.left.isZero()) return new IntegerLiteral(0);
  } else if (this.op === '/') {
    if (this.right.isOne()) return this.left;
    if (this.left.sameVariableAs(this.right)) return new IntegerLiteral(1);
  }
  return this;
};

Object.assign(Expression.prototype, {
  isZero() {
    return this instanceof IntegerLiteral && this.value === 0;
  },
  isOne() {
    return this instanceof IntegerLiteral && this.value === 1;
  },
  sameVariableAs(e) {
    return (
      this instanceof VariableExpression &&
      e instanceof VariableExpression &&
      this.referent === e.referent
    );
  },
});

Object.assign(BinaryExpression.prototype, {
  foldIntegerConstants() {
    switch (this.op) {
      case '+':
        return new IntegerLiteral(+this.left + this.right);
      case '-':
        return new IntegerLiteral(+this.left - this.right);
      case '*':
        return new IntegerLiteral(+this.left * this.right);
      case '/':
        return new IntegerLiteral(+this.left / this.right);
      case '<':
        return new BooleanLiteral(+this.left < this.right);
      case '<=':
        return new BooleanLiteral(+this.left <= this.right);
      case '==':
        return new BooleanLiteral(+this.left === this.right);
      case '!=':
        return new BooleanLiteral(+this.left !== this.right);
      case '>=':
        return new BooleanLiteral(+this.left >= this.right);
      case '>':
        return new BooleanLiteral(+this.left > this.right);
      default:
        return this;
    }
  },
  foldBooleanConstants() {
    switch (this.op) {
      case '==':
        return new BooleanLiteral(this.left === this.right);
      case '!=':
        return new BooleanLiteral(this.left !== this.right);
      case 'and':
        return new BooleanLiteral(this.left && this.right);
      case 'or':
        return new BooleanLiteral(this.left || this.right);
      default:
        return this;
    }
  },
});
