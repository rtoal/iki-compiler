const {
  Program,
  Block,
  VariableDeclaration,
  AssignmentStatement,
  ReadStatement,
  WriteStatement,
  WhileStatement,
  IntegerLiteral,
  BooleanLiteral,
  VariableExpression,
  UnaryExpression,
  BinaryExpression,
} = require('../ast');

const usedVariables = new Set();

const makeVariable = (() => {
  let lastId = 0;
  const map = new Map();
  return v => {
    if (!map.has(v)) map.set(v, ++lastId);
    return `_${v.id}_${map.get(v)}`;
  };
})();

const makeLabel = (() => {
  let labelsGenerated = 0;
  return () => `L${++labelsGenerated}`;
})();

Program.prototype.gen = function() {
  emit('.globl', '_main');
  emit('.text');
  emitLabel('_main');
  emit('push', '%rbp');
  this.block.gen();
  emit('pop', '%rbp');
  emit('ret');
  emit('.data');
  emitLabel('READ');
  emit('.ascii', '"%d\\0\\0"'); // extra 0 for alignment
  emitLabel('WRITE');
  emit('.ascii', '"%d\\n\\0"');
  usedVariables.forEach(s => {
    emitLabel(s);
    emit('.quad', '0');
  });
};

Block.prototype.gen = function() {
  this.statements.forEach(statement => {
    statement.gen();
    allocator.freeAllRegisters();
  });
};

VariableDeclaration.prototype.gen = function() {
  // Intentionally empty
};

AssignmentStatement.prototype.gen = function() {
  let source = this.source.gen();
  const destination = this.target.gen();
  if (source instanceof MemoryOperand && destination instanceof MemoryOperand) {
    const oldSource = source;
    source = allocator.makeRegisterOperand();
    emit('mov', oldSource, source);
  }
  emit('mov', source, destination);
};

ReadStatement.prototype.gen = function() {
  // Call scanf from C lib, format string in rdi, operand in rsi
  this.varexps.forEach(v => {
    emit('mov', v.gen(), '%rsi');
    emit('lea', 'READ(%rip)', '%rdi');
    emit('xor', '%rax', '%rax');
    emit('call', '_scanf');
  });
};

WriteStatement.prototype.gen = function() {
  // Call printf from C lib, format string in rdi, operand in rsi, rax=0
  this.expressions.forEach(e => {
    emit('mov', e.gen(), '%rsi');
    emit('lea', 'WRITE(%rip)', '%rdi');
    emit('xor', '%rax', '%rax');
    emit('call', '_printf');
  });
};

WhileStatement.prototype.gen = function() {
  const top = makeLabel();
  const bottom = makeLabel();
  emitLabel(top);
  const condition = this.condition.gen();
  emitJumpIfFalse(condition, bottom);
  allocator.freeAllRegisters();
  this.body.gen();
  emit('jmp', top);
  emitLabel(bottom);
};

IntegerLiteral.prototype.gen = function() {
  return new ImmediateOperand(this.value);
};

BooleanLiteral.prototype.gen = function() {
  return new ImmediateOperand([false, true].indexOf(this.value.toString()));
};

VariableExpression.prototype.gen = function() {
  const name = makeVariable(this.referent);
  usedVariables.add(name);
  return new MemoryOperand(name);
};

UnaryExpression.prototype.gen = function() {
  const result = allocator.ensureRegister(this.operand.gen());
  const instruction = { '-': 'neg', not: 'not' }[this.op];
  emit(instruction, result);
  return result;
};

BinaryExpression.prototype.gen = function() {
  const left = this.left.gen();
  const result =
    this.op === '/' ? allocator.makeRegisterOperandFor('rax') : allocator.ensureRegister(left);

  if (this.op === 'and') {
    emitShortCircuit('je', this, result);
    return result;
  }

  if (this.op === 'or') {
    emitShortCircuit('jne', this, result);
    return result;
  }

  const right = this.right.gen();

  if (this.op === '/') {
    emit('movq', left, result);
    emit('cqto');
    emit('idivq', allocator.nonImmediate(right));
  } else {
    switch (this.op) {
      case '+':
        emit('addq', right, result);
        break;
      case '-':
        emit('subq', right, result);
        break;
      case '*':
        emit('imulq', right, result);
        break;
      case '<':
        emitComparison('setl', right, result);
        break;
      case '<=':
        emitComparison('setle', right, result);
        break;
      case '==':
        emitComparison('sete', right, result);
        break;
      case '!=':
        emitComparison('setne', right, result);
        break;
      case '>=':
        emitComparison('setge', right, result);
        break;
      case '>':
        emitComparison('setg', right, result);
        break;
      default:
        break;
    }
  }
  return result;
};

function emitLabel(label) {
  console.log(`${label}:`);
}

function emit(op, x, y) {
  let line = `\t${op}`;
  if (x) line += `\t${x}`;
  if (y) line += `, ${y}`;
  console.log(line);
}

function emitShortCircuit(operation, expression, destination) {
  const skip = makeLabel();
  emit('cmp', '$0', destination);
  emit(operation, skip);
  const right = expression.right.gen();
  emit('mov', right, destination);
  emitLabel(skip);
}

function emitComparison(operation, right, destination) {
  emit('cmp', right, destination);
  const byteRegister = `%${allocator.byteRegisterFor(destination.register)}`;
  emit(operation, byteRegister);
  emit('movsbq', byteRegister, destination);
}

function emitJumpIfFalse(operand, label) {
  // Emits code to jump to a label if a given expression is 0. On the x86 this is done
  // with a comparison instruction and then a je instruction. The cmp instruction cannot
  // compare two immediate values, so if the operand is immediate we have to get a new
  // register for it.

  emit('cmpq', '$0', allocator.nonImmediate(operand));
  emit('je', label);
}

class RegisterAllocator {
  // A ridiculously simple register allocator. It throws an exception if there are no free
  // registers available.  Also, it never allocates %rdx, since that is used for division.
  // And it never allocates %rdi or %rsi, as those are used for reading and writing.  Also,
  // you can't mark individual registers free; you can only call freeAllRegisters().

  constructor() {
    this.names = ['rax', 'rcx', 'r8', 'r9', 'r10', 'r11'];
    this.bindings = new Map();
  }

  byteRegisterFor(registerName) {
    return ['al', 'cl', 'r8b', 'r9b', 'r10b', 'r11b'][this.names.indexOf(registerName)];
  }

  makeRegisterOperand() {
    // Returns a brand new register operand bound to the first available free register
    const operand = new RegisterOperand('');
    this.assignFreeRegisterTo(operand);
    return operand;
  }

  makeRegisterOperandFor(registerName) {
    // Returns a brand new register operand bound to a specific register.  If something is
    // already in that register, generates code to move it out and rebind to a new register.

    const existingRegisterOperand = this.bindings.get(registerName);
    if (existingRegisterOperand) {
      this.assignFreeRegisterTo(existingRegisterOperand);
      emit('movq', `%${registerName}`, existingRegisterOperand);
    }
    const operand = new RegisterOperand(registerName);
    this.bindings.set(registerName, operand);
    return operand;
  }

  nonImmediate(operand) {
    // If the operand is already non-immediate, return it, otherwise generate a new register
    // operand containing this value.

    if (operand instanceof ImmediateOperand) {
      const newOperand = this.makeRegisterOperand();
      emit('movq', `${operand}, ${newOperand}`);
      return newOperand;
    }
    return operand;
  }

  ensureRegister(operand) {
    // If the operand is already a register, return it, otherwise generate a new register
    // operand containing this value.

    if (!(operand instanceof RegisterOperand)) {
      const newOperand = this.makeRegisterOperand();
      emit('movq', operand, newOperand);
      return newOperand;
    }
    return operand;
  }

  assignFreeRegisterTo(registerOperand) {
    // Changes the register value of an existing register operand to the first available register.

    const register = this.names.find(r => !this.bindings.has(r));
    if (!register) {
      throw 'No more registers available';
    }
    this.bindings.set(register, registerOperand);
    registerOperand.register = register; // eslint-disable-line no-param-reassign
  }

  freeAllRegisters() {
    this.bindings.clear();
  }
}

const allocator = new RegisterAllocator();

class ImmediateOperand {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return `$${this.value}`;
  }
}

class RegisterOperand {
  constructor(register) {
    this.register = register;
  }
  toString() {
    return `%${this.register}`;
  }
}

class MemoryOperand {
  constructor(variable) {
    this.variable = variable;
  }
  toString() {
    return `${this.variable}(%rip)`;
  }
}
