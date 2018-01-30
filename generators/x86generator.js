const HashMap = require('hashmap').HashMap;

const usedVariables = {};

module.exports = gen;

const makeVariable = (() => {
  const lastId = 0;
  const map = new HashMap();
  return (v) => {
    if (!map.has(v)) map.set(v, ++lastId);
    return '_v' + map.get(v);
  }
})();

const makeLabel = (function () {
  const labelsGenerated = 0
  return function () {
    return 'L' + (++labelsGenerated)
  }
}())

function gen(e) {
  return generator[e.constructor.name](e);
}

const generator = {

  'Program': function (program) {
    emit('.globl', '_main')
    emit('.text')
    emitLabel('_main')
    emit('push', '%rbp')
    gen(program.block)
    emit('pop', '%rbp')
    emit('ret')
    emit('.data')
    emitLabel('READ')
    emit('.ascii', '"%d\\0\\0"') // extra 0 for alignment
    emitLabel('WRITE')
    emit('.ascii', '"%d\\n\\0"')
    for (const s in usedVariables) {
      emitLabel(s)
      emit('.quad', '0');
    }
  },

  'Block': function (block) {
    block.statements.forEach(function (statement) {
      gen(statement)
      allocator.freeAllRegisters()
    })
  },

  'VariableDeclaration': function (v) {
    // Intentionally empty
  },

  'AssignmentStatement': function (s) {
    source = gen(s.source)
    destination = gen(s.target)
    if (source instanceof MemoryOperand && destination instanceof MemoryOperand) {
      const oldSource = source
      source = allocator.makeRegisterOperand()
      emit('mov', oldSource, source)
    }
    emit('mov', source, destination)
  },

  'ReadStatement': function (s) {
    // Call scanf from C lib, format string in rdi, operand in rsi
    s.varexps.forEach(function (v) {
      emit('mov', gen(v), '%rsi')
      emit('lea', 'READ(%rip)', '%rdi')
      emit('xor', '%rax', '%rax')
      emit('call', '_scanf')
    })
  },

  'WriteStatement': function (s) {
    // Call printf from C lib, format string in rdi, operand in rsi, rax=0
    s.expressions.forEach(function (e) {
      emit('mov', gen(e), '%rsi')
      emit('lea', 'WRITE(%rip)', '%rdi')
      emit('xor', '%rax', '%rax')
      emit('call', '_printf')
    })
  },

  'WhileStatement': function (s) {
    const top = makeLabel();
    const bottom = makeLabel();
    emitLabel(top);
    const condition = gen(s.condition);
    emitJumpIfFalse(condition, bottom);
    allocator.freeAllRegisters();
    gen(s.body)
    emit('jmp', top);
    emitLabel(bottom);
  },

  'IntegerLiteral': function (literal) {
    return new ImmediateOperand(literal.toString());
  },

  'BooleanLiteral': function (literal) {
    return new ImmediateOperand(['false','true'].indexOf(literal.toString()))
  },

  'VariableExpression': function (v) {
    const name = makeVariable(v.referent);
    usedVariables[name] = true;
    return new MemoryOperand(name);
  },

  'UnaryExpression': function (e) {
    const result = allocator.ensureRegister(gen(e.operand))
    const instruction = {'-':'neg', 'not':'not'}[e.op]
    emit(instruction, result)
    return result
  },

  'BinaryExpression': function (e) {
    const left = gen(e.left)
    const result = (e.op === '/') ?
      allocator.makeRegisterOperandFor("rax") :
      allocator.ensureRegister(left)

    if (e.op === 'and') {
      emitShortCircuit('je', e, result)
      return result
    }

    if (e.op === 'or') {
      emitShortCircuit('jne', e, result)
      return result
    }

    const right = gen(e.right)

    if (e.op === '/') {
      emit("movq", left, result);
      emit("cqto");
      emit("idivq", allocator.nonImmediate(right));
    } else {
      switch (e.op) {
        case '+': emit("addq", right, result); break
        case '-': emit("subq", right, result); break
        case '*': emit("imulq", right, result); break
        case '<': emitComparison("setl", right, result); break
        case '<=': emitComparison("setle", right, result); break
        case '==': emitComparison("sete", right, result); break
        case '!=': emitComparison("setne", right, result); break
        case '>=': emitComparison("setge", right, result); break
        case '>': emitComparison("setg", right, result); break
      }
    }
    return result;
  }
}

function emitLabel(label) {
  console.log(label + ':')
}

function emit(op, x, y) {
  const line = '\t' + op
  if (x) line += '\t' + x
  if (y) line += ', ' + y
  console.log(line)
}

function emitShortCircuit(operation, expression, destination) {
  const skip = makeLabel()
  emit("cmp", "$0", destination)
  emit(operation, skip)
  const right = gen(expression.right)
  emit("mov", right, destination)
  emitLabel(skip)
}

function emitComparison(operation, right, destination) {
  emit("cmp", right, destination)
  const byteRegister = '%' + allocator.byteRegisterFor(destination.register)
  emit(operation, byteRegister)
  emit("movsbq", byteRegister, destination)
}

function emitJumpIfFalse(operand, label) {
  // Emits code to jump to a label if a given expression is 0. On the x86 this is done
  // with a comparison instruction and then a je instruction. The cmp instruction cannot
  // compare two immediate values, so if the operand is immediate we have to get a new
  // register for it.

  emit('cmpq', '$0', allocator.nonImmediate(operand))
  emit('je', label)
}


function RegisterAllocator () {
  // A ridiculously simple register allocator. It throws an exception if there are no free
  // registers available.  Also, it never allocates %rdx, since that is used for division.
  // And it never allocates %rdi or %rsi, as those are used for reading and writing.  Also,
  // you can't mark individual registers free; you can only call freeAllRegisters().

  this.names = ['rax','rcx','r8','r9','r10','r11']
  this.bindings = new HashMap()
}

RegisterAllocator.prototype.byteRegisterFor = function (registerName) {
  return ['al', 'cl', 'r8b', 'r9b', 'r10b', 'r11b'][this.names.indexOf(registerName)]
}

RegisterAllocator.prototype.makeRegisterOperand = function () {
  // Returns a brand new register operand bound to the first available free register

  const operand = new RegisterOperand("");
  this.assignFreeRegisterTo(operand);
  return operand;
}

RegisterAllocator.prototype.makeRegisterOperandFor = function (registerName) {
  // Returns a brand new register operand bound to a specific register.  If something is
  // already in that register, generates code to move it out and rebind to a new register.

  const existingRegisterOperand = this.bindings.get(registerName);
  if (existingRegisterOperand) {
    this.assignFreeRegisterTo(existingRegisterOperand);
    emit("movq", "%" + registerName, existingRegisterOperand);
  }
  const operand = new RegisterOperand(registerName);
  this.bindings.set(registerName, operand);
  return operand;
}

RegisterAllocator.prototype.nonImmediate = function (operand) {
  // If the operand is already non-immediate, return it, otherwise generate a new register
  // operand containing this value.

  if (operand instanceof ImmediateOperand) {
    const newOperand = this.makeRegisterOperand();
    emit("movq", operand + ", " + newOperand);
    return newOperand;
  }
  return operand;
}

RegisterAllocator.prototype.ensureRegister = function (operand) {
  // If the operand is already a register, return it, otherwise generate a new register
  // operand containing this value.

  if (! (operand instanceof RegisterOperand)) {
    const newOperand = this.makeRegisterOperand();
    emit("movq", operand, newOperand);
    return newOperand;
  }
  return operand;
}

RegisterAllocator.prototype.assignFreeRegisterTo = function (registerOperand) {
  // Changes the register value of an existing register operand to the first available register.

  for (const i = 0; i < this.names.length; i++) {
    const register = this.names[i]
    if (!this.bindings.has(register)) {
      this.bindings.set(register, registerOperand);
      registerOperand.register = register;
      return;
    }
  }
  throw 'No more registers available';
}

RegisterAllocator.prototype.freeAllRegisters = function () {
  this.bindings.clear()
}

const allocator = new RegisterAllocator()


function ImmediateOperand(value) {
  this.value = value
}

ImmediateOperand.prototype.toString = function () {
  return '$' + this.value
}

function RegisterOperand(register) {
  this.register = register
}

RegisterOperand.prototype.toString = function () {
  return '%' + this.register
}

function MemoryOperand(variable) {
  this.variable = variable
}

MemoryOperand.prototype.toString = function () {
  return this.variable + '(%rip)'
}
