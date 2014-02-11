var util = require('util')
var HashMap = require('hashmap').HashMap

var usedVariables = new HashMap()

module.exports = function (program) {
  // TODO - set up output stream
  gen(program)  
}

function emit(line) {
  console.log(line)
}

var makeVariable = (function () {
  var lastId = 0
  var map = new HashMap()
  return function (v) {
    if (!map.has(v)) map.set(v, ++lastId)
    return '_v' + map.get(v)
  }
}())

var makeLabel = (function () {
  var labelsGenerated = 0
  return function () {
    return 'L' + (++labelsGenerated)
  }
}())

function gen(e) {
  return generator[e.constructor.name](e)
}

var generator = {

  'Program': function (program) {
    emit('\t.globl\t_main')
    emit('\t.text')
    emit('_main:')
    emit('\tpush\t%rbp')
    gen(program.block)
    emit('\tpop\t%rbp')
    emit('\tret')
    emit('\t.data')
    emit('READ:\t.ascii\t"%d\\0\\0"') // extra 0 for alignment
    emit('WRITE:\t.ascii\t"%d\\n\\0"')
    usedVariables.forEach(function (s) {
      emit(s + ':\t.quad\t0');
    })
  },

  'Block': function (block) {
    block.statements.forEach(function (statement) {
      gen(statement)
    })
    allocator.freeAllRegisters()
  },

  'VariableDeclaration': function (v) {
    // makeVariable(v)
  },

  'AssignmentStatement': function (s) {
    source = gen(s.source)
    target = gen(s.target)
    if (source instanceof MemoryOperand && destination instanceof MemoryOperand) {
      var oldSource = source
      source = allocator.makeRegisterOperand()
      emitMove(oldSource, source)
    }
    emitMove(source, destination)
  },

  'ReadStatement': function (s) {
    // Call scanf from C lib, format string in rdi, operand in rsi
    s.varrefs.forEach(function (v) {
      emit("\tmov\t" + gen(v.referent).address() + ", %rsi");
      emit("\tlea\tREAD(%rip), %rdi");
      emit("\txor\t%rax, %rax");
      emit("\tcall\tscanf");
    })
  },

  'WriteStatement': function (s) {
    // Call printf from C lib, format string in rdi, operand in rsi, rax=0
    s.expressions.forEach(function (e) {
      emit("\tmov\t" + gen(e) + ", %rsi");
      emit("\tlea\tWRITE(%rip), %rdi");
      emit("\txor\t%rax, %rax");
      emit("\tcall\t_printf");
    })
  },

  'WhileStatement': function (s) {
    var top = makeLabel();
    var bottom = makeLabel();
    emitLabel(top);
    var condition = gen(s.condition);
    emitJumpIfFalse(condition, bottom);
    allocator.freeAllRegisters();
    gen(s.body)
    emitJump(top);
    emitLabel(bottom);
  },

  'IntegerLiteral': function (literal) {
    return new ImmediateOperand(literal.toString());
  },

  'BooleanLiteral': function (literal) {
    return new ImmediateOperand(['false','true'].indexOf(literal.toString()))
  },

  'VariableReference': function (v) {
    var name = makeVariable(v.getReferent());
    usedVariables.add(name);
    return new MemoryOperand(name);
  },

  'UnaryExpression': function (e) {
    var operand = gen(e.operand)
    var instruction = {'-':'neg', 'not':'not'}[e.op.lexeme]
    if (! (operand instanceof RegisterOperand)) {
      // TODO operand = move into register
    }
    emit('\t' + instruction + '\t' + operand)
  },

  'BinaryExpression': function (e) {
    // gen(e.left), makeOp(e.op.lexeme), gen(e.right))
  }
}



//     private Operand generateBinaryExpression(BinaryExpression e) {
//         Operand left = generateExpression(e.getLeft());
//         Operand right = generateExpression(e.getRight());
//         Operand result;
//         if (e.getOperator() != BinaryExpression.Operator.DIVIDE) {
//             if (left instanceof RegisterOperand) {
//                 result = left;
//             } else {
//                 result = allocator.makeRegisterOperand();
//                 emitMove(left, result);
//             }
//             switch (e.getOperator()) {
//             case PLUS: emitBinary("addq", right, result); break;
//             case MINUS: emitBinary("subq", right, result); break;
//             case TIMES: emitBinary("mulq", right, result); break;
//             }
//         } else {
//             result = allocator.makeRegisterOperandFor("rax");
//             emit("\tmovq\t" + left + ", " + result);
//             emit("\tcqto");
//             emit("\tidivq\t" + allocator.nonImmediate(right));
//         }
//         return result;
//     }

function emitLabel(label) {
  emit(label + ':')
}

function emitMove(source, destination) {
  emit('\tmovq\t' + source + ', ' + destination)
}

function emitJump(label) {
  emit('\tjmp\t' + label)
}

function emitJumpIfFalse(operand, label) {
  // Emits code to jump to a label if a given expression is 0. On the x86 this is done
  // with a comparison instruction and then a je instruction. The cmp instruction cannot
  // compare two immediate values, so if the operand is immediate we have to get a new
  // register for it.
  emit('\tcmpq\t$0, ' + allocator.nonImmediate(operand));
  emit('\tje\t' + label);
}

function emitBinary(instruction, source, destination) {
  emit('\t' + instruction + '\t' + source + ', ' + destination);
}


// A ridiculously simple register allocator. It thrown an exception thrown there are no free
// registers available.  Also, it never allocates %rdx, since that is used for division.
// You can't mark individual registers free; you can only call freeAllRegisters().

function RegisterAllocator () {
  this.names = ['rax','rcx','r8','r9','r10','r11']
  this.used = new HashMap()
}

RegisterAllocator.prototype.makeRegisterOperandFor = function (registerName) {
  // Returns a brand new register operand bound to a specific register.  If something is
  // already in that register, generates code to move it out and rebind to a new register.
  var whatsAlreadyThere = used.get(registerName);
  if (whatsAlreadyThere != null) {
    this.assignRegister(whatsAlreadyThere);
    emit("\tmovq\t%" + registerName + ", " + whatsAlreadyThere);
  }
  var operand = new RegisterOperand(registerName);
  this.used.put(registerName, operand);
  return operand;
}

RegisterAllocator.prototype.makeRegisterOperand = function () {
  // Returns a brand new register operand bound to the first available free register
  var operand = new RegisterOperand("");
  this.assignRegister(operand);
  return operand;
}

RegisterAllocator.prototype.nonImmediate = function (operand) {
  // If the operand is already non-immediate, return it, otherwise generate a new register
  // operand containing this value.
  if (operand instanceof ImmediateOperand) {
    var newOperand = allocator.makeRegisterOperand();
    emit("\tmovq\t" + operand + ", " + newOperand);
    return newOperand;
  }
  return operand;
}

//         /**
//          * Changes the register value of an existing register operand to the first available
//          * register.
//          */
RegisterAllocator.prototype.assignRegister = function(operand) {
//             for (String register: names) {
//                 if (!used.containsKey(register)) {
//                     used.put(register, operand);
//                     operand.register = register;
//                     return;
//                 }
//             }
//             throw new RuntimeException("No more registers available");
}

RegisterAllocator.prototype.freeAllRegisters = function () {
  this.used.clear();
}

var allocator = new RegisterAllocator()


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

// Assembly language memory operands. Although the x86 has a variety of addressing modes, Iki
// programs require only direct operands. All Iki variables will be stored in a data section.
// The assembly language name of a variable is its Iki name suffixed with a '$' (to prevent
// clashes with assembly language reserved words).

function MemoryOperand(variable) {
  this.variable = variable
}

MemoryOperand.prototype.address = function () {
  return '$' + variable
}

MemoryOperand.prototype.toString = function () {
  return variable
}
