const usedVariables = new Set();

module.exports = gen;

const makeVariable = (() => {
  let lastId = 0;
  const map = new Map();
  return (v) => {
    if (!map.has(v)) map.set(v, ++lastId); // eslint-disable-line no-plusplus
    return `_${v.id}_${map.get(v)}`;
  };
})();

const makeLabel = (() => {
  let labelsGenerated = 0;
  return () => `L${++labelsGenerated}`; // eslint-disable-line no-plusplus
})();

function gen(e) {
  return generator[e.constructor.name](e);
}

const generator = {

  Program(program) {
    emit('.globl', '_main');
    emit('.text');
    emitLabel('_main');
    emit('push', '%rbp');
    gen(program.block);
    emit('pop', '%rbp');
    emit('ret');
    emit('.data');
    emitLabel('READ');
    emit('.ascii', '"%d\\0\\0"'); // extra 0 for alignment
    emitLabel('WRITE');
    emit('.ascii', '"%d\\n\\0"');
    usedVariables.forEach((s) => {
      emitLabel(s);
      emit('.quad', '0');
    });
  },

  Block(block) {
    block.statements.forEach((statement) => {
      gen(statement);
      allocator.freeAllRegisters();
    });
  },

  VariableDeclaration() {
    // Intentionally empty
  },

  AssignmentStatement(s) {
    let source = gen(s.source);
    const destination = gen(s.target);
    if (source instanceof MemoryOperand && destination instanceof MemoryOperand) {
      const oldSource = source;
      source = allocator.makeRegisterOperand();
      emit('mov', oldSource, source);
    }
    emit('mov', source, destination);
  },

  ReadStatement(s) {
    // Call scanf from C lib, format string in rdi, operand in rsi
    s.varexps.forEach((v) => {
      emit('mov', gen(v), '%rsi');
      emit('lea', 'READ(%rip)', '%rdi');
      emit('xor', '%rax', '%rax');
      emit('call', '_scanf');
    });
  },

  WriteStatement(s) {
    // Call printf from C lib, format string in rdi, operand in rsi, rax=0
    s.expressions.forEach((e) => {
      emit('mov', gen(e), '%rsi');
      emit('lea', 'WRITE(%rip)', '%rdi');
      emit('xor', '%rax', '%rax');
      emit('call', '_printf');
    });
  },

  WhileStatement(s) {
    const top = makeLabel();
    const bottom = makeLabel();
    emitLabel(top);
    const condition = gen(s.condition);
    emitJumpIfFalse(condition, bottom);
    allocator.freeAllRegisters();
    gen(s.body);
    emit('jmp', top);
    emitLabel(bottom);
  },

  IntegerLiteral(literal) {
    return new ImmediateOperand(literal.value);
  },

  BooleanLiteral(literal) {
    return new ImmediateOperand([false, true].indexOf(literal.toString()));
  },

  VariableExpression(v) {
    const name = makeVariable(v.referent);
    usedVariables.add(name);
    return new MemoryOperand(name);
  },

  UnaryExpression(e) {
    const result = allocator.ensureRegister(gen(e.operand));
    const instruction = { '-': 'neg', not: 'not' }[e.op];
    emit(instruction, result);
    return result;
  },

  BinaryExpression(e) {
    const left = gen(e.left);
    const result = (e.op === '/') ?
      allocator.makeRegisterOperandFor('rax') :
      allocator.ensureRegister(left);

    if (e.op === 'and') {
      emitShortCircuit('je', e, result);
      return result;
    }

    if (e.op === 'or') {
      emitShortCircuit('jne', e, result);
      return result;
    }

    const right = gen(e.right);

    if (e.op === '/') {
      emit('movq', left, result);
      emit('cqto');
      emit('idivq', allocator.nonImmediate(right));
    } else {
      switch (e.op) {
        case '+': emit('addq', right, result); break;
        case '-': emit('subq', right, result); break;
        case '*': emit('imulq', right, result); break;
        case '<': emitComparison('setl', right, result); break;
        case '<=': emitComparison('setle', right, result); break;
        case '==': emitComparison('sete', right, result); break;
        case '!=': emitComparison('setne', right, result); break;
        case '>=': emitComparison('setge', right, result); break;
        case '>': emitComparison('setg', right, result); break;
        default: break;
      }
    }
    return result;
  },
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
  const right = gen(expression.right);
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
