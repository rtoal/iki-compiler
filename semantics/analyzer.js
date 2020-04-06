const {
  Program,
  Block,
  VarDec,
  Type,
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
const { initialContext } = require('./context');
const { BoolType, IntType } = require('./builtins');

module.exports = function(program) {
  program.analyze(initialContext);
};

Program.prototype.analyze = function() {
  this.block.analyze(initialContext());
};

Block.prototype.analyze = function(context) {
  const localContext = context.createChildContext();
  this.statements.forEach(s => s.analyze(localContext));
};

VarDec.prototype.analyze = function(context) {
  context.variableMustNotBeAlreadyDeclared(this.id);
  this.type = this.type === 'int' ? IntType : BoolType;
  context.addVariable(this.id, this);
};

Object.assign(Type.prototype, {
  mustBeInteger(message) {
    return this.mustBeCompatibleWith(IntType, message);
  },
  mustBeBoolean(message) {
    return this.mustBeCompatibleWith(BoolType, message);
  },
  mustBeCompatibleWith(otherType, message) {
    if (!this.isCompatibleWith(otherType)) {
      throw message;
    }
  },
  mustBeMutuallyCompatibleWith(otherType, message) {
    if (!(this.isCompatibleWith(otherType) || otherType.isCompatibleWith(this))) {
      throw message;
    }
  },
  isCompatibleWith(otherType) {
    // In more sophisticated languages, comapatibility would be more complex
    return this === otherType;
  },
});

AssignmentStatement.prototype.analyze = function(context) {
  this.target.analyze(context);
  this.source.analyze(context);
  this.source.type.mustBeCompatibleWith(this.target.type, 'Type mismatch in assignment');
};

ReadStatement.prototype.analyze = function(context) {
  this.varexps.forEach(v => {
    v.analyze(context);
    v.type.mustBeInteger('Variables in "read" statement must have type integer');
  });
};

WriteStatement.prototype.analyze = function(context) {
  this.expressions.forEach(e => {
    e.analyze(context);
    e.type.mustBeInteger('Expressions in "write" statement must have type integer');
  });
};

WhileStatement.prototype.analyze = function(context) {
  this.condition.analyze(context);
  this.condition.type.mustBeBoolean('Condition in "while" statement must be boolean');
  this.body.analyze(context);
};

IntLit.prototype.analyze = function() {
  this.type = IntType;
};

BoolLit.prototype.analyze = function() {
  this.type = BoolType;
};

VarExp.prototype.analyze = function(context) {
  this.referent = context.lookupVariable(this.name);
  this.type = this.referent.type;
};

UnaryExp.prototype.analyze = function(context) {
  this.operand.analyze(context);
  if (this.op === 'not') {
    this.operand.type.mustBeBoolean('The "not" operator requires a boolean operand', this.op);
    this.type = BoolType;
  } else {
    this.operand.type.mustBeInteger('Negation requires an integer operand', this.op);
    this.type = IntType;
  }
};

BinaryExp.prototype.analyze = function(context) {
  this.left.analyze(context);
  this.right.analyze(context);
  if (['<', '<=', '>=', '>'].includes(this.op)) {
    this.mustHaveIntegerOperands();
    this.type = BoolType;
  } else if (['==', '!='].includes(this.op)) {
    this.mustHaveCompatibleOperands();
    this.type = BoolType;
  } else if (['and', 'or'].includes(this.op)) {
    this.mustHaveBooleanOperands();
    this.type = BoolType;
  } else {
    // All other binary operators are arithmetic
    this.mustHaveIntegerOperands();
    this.type = IntType;
  }
};

Object.assign(BinaryExp.prototype, {
  mustHaveIntegerOperands() {
    const errorMessage = `${this.op} must have integer operands`;
    this.left.type.mustBeCompatibleWith(IntType, errorMessage, this.op);
    this.right.type.mustBeCompatibleWith(IntType, errorMessage, this.op);
  },
  mustHaveBooleanOperands() {
    const errorMessage = `${this.op} must have boolean operands`;
    this.left.type.mustBeCompatibleWith(BoolType, errorMessage, this.op);
    this.right.type.mustBeCompatibleWith(BoolType, errorMessage, this.op);
  },
  mustHaveCompatibleOperands() {
    const errorMessage = `${this.op} must have mutually compatible operands`;
    this.left.type.mustBeMutuallyCompatibleWith(this.right.type, errorMessage, this.op);
  },
});
