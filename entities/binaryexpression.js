var Type = require('./type')
var IntegerLiteral = require('./integerliteral')
var BooleanLiteral = require('./booleanliteral')
var VariableReference = require('./variablereference')

function BinaryExpression(op, left, right) {
  this.op = op
  this.left = left
  this.right = right
}

BinaryExpression.prototype.toString = function () {
  return '(' + this.op.lexeme + ' ' + this.left + ' ' + this.right + ')'
}

BinaryExpression.prototype.analyze = function (context) {
  this.left.analyze(context)
  this.right.analyze(context)
  op = this.op.lexeme
  if (/<=?|>=?/.test(op)) {
    this.mustHaveIntegerOperands()
    this.type = Type.BOOL
  } else if (/==|!=/.test(op)) {
    this.mustHaveCompatibleOperands()
    this.type = Type.BOOL
  } else if (/and|or/.test(op)) {
    this.mustHaveBooleanOperands()
    this.type = Type.BOOL
  } else {
    // All other binary operators are arithmetic
    this.mustHaveIntegerOperands()
    this.type = Type.INT
  }
}

BinaryExpression.prototype.optimize = function () {
  this.left = this.left.optimize()
  this.right = this.right.optimize()
  if (this.left instanceof IntegerLiteral && this.right instanceof IntegerLiteral) {
    return foldIntegerConstants(this.op.lexeme, +this.left.value, +this.right.value)
  } else if (this.left instanceof BooleanLiteral && this.right instanceof BooleanLiteral) {
    return foldBooleanConstants(this.op.lexeme, this.left.value(), this.right.value())
  } else {
    switch (this.op.lexeme) {
      case '+':
        if (isIntegerLiteral(this.right, 0)) return this.left
        if (isIntegerLiteral(this.left, 0)) return this.right
      case '-':
        if (isIntegerLiteral(this.right, 0)) return this.left
        if (sameVariable(this.left, this.right)) return new IntegerLiteral(0)
      case '*':
        if (isIntegerLiteral(this.right, 1)) return this.left
        if (isIntegerLiteral(this.left, 1)) return this.right
        if (isIntegerLiteral(this.right, 0)) return new IntegerLiteral(0)
        if (isIntegerLiteral(this.left, 0)) return new IntegerLiteral(0)
      case '/':
        if (isIntegerLiteral(this.right, 1)) return this.left
        if (sameVariable(this.left, this.right)) return new IntegerLiteral(1)
    }
  }
  return this
}

BinaryExpression.prototype.mustHaveIntegerOperands = function () {
  var error = this.op.lexeme + ' must have integer operands'
  this.left.type.mustBeCompatibleWith(Type.INT, error, this.op)
  this.right.type.mustBeCompatibleWith(Type.INT, error, this.op)
}

BinaryExpression.prototype.mustHaveBooleanOperands = function () {
  var error = this.op.lexeme + ' must have boolean operands'
  this.left.type.mustBeCompatibleWith(Type.BOOL, error, this.op)
  this.right.type.mustBeCompatibleWith(Type.BOOL, error, this.op)
}

BinaryExpression.prototype.mustHaveCompatibleOperands = function () {
  var error = this.op.lexeme + ' must have mutually compatible operands'
  this.left.type.mustBeMutuallyCompatibleWith(this.right.type, error, this.op)
}

function isIntegerLiteral(operand, value) {
  return operand instanceof IntegerLiteral && operand.value === value
}

function sameVariable(exp1, exp2) {
  return exp1 instanceof VariableReference &&
         exp2 instanceof VariableReference &&
         exp1.referent === exp2.referent
}

function foldIntegerConstants(op, x, y) {
  switch (op) {
    case '+': return new IntegerLiteral(x + y)
    case '-': return new IntegerLiteral(x - y)
    case '*': return new IntegerLiteral(x * y)
    case '/': if (y !== 0) return new IntegerLiteral(x / y)
    case '<': return new BooleanLiteral(x < y)
    case '<=': return new BooleanLiteral(x <= y)
    case '==': return new BooleanLiteral(x === y)
    case '!=': return new BooleanLiteral(x !== y)
    case '>=': return new BooleanLiteral(x >= y)
    case '>': return new BooleanLiteral(x > y)
  }
}

function foldBooleanConstants(op, x, y) {
  switch (op) {
    case '==': return new BooleanLiteral(x === y)
    case '!=': return new BooleanLiteral(x !== y)
    case 'and': return new BooleanLiteral(x && y)
    case 'or': return new BooleanLiteral(x || y)
  }
}

module.exports = BinaryExpression
