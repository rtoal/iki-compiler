// Parser module
//
//   const parse = require('./parser');
//   const ast = parse(sourceCodeString);

const ohm = require('ohm-js');
const fs = require('fs');

const {
  Program,
  Block,
  IntType,
  BoolType,
  VarDec,
  AssignmentStatement,
  ReadStatement,
  WriteStatement,
  WhileStatement,
  IntLit,
  BoolLit,
  VarExp,
  BinaryExpression,
  UnaryExpression,
} = require('.');

const grammar = ohm.grammar(fs.readFileSync('./grammar/iki.ohm'));

/* eslint-disable no-unused-vars */
const astBuilder = grammar.createSemantics().addOperation('ast', {
  Program(b) {
    return new Program(b.ast());
  },
  Block(s, _) {
    return new Block(s.ast());
  },
  Stmt_declaration(_1, id, _2, type) {
    return new VarDec(id.sourceString, type.ast());
  },
  Stmt_assignment(varexp, _, exp) {
    return new AssignmentStatement(varexp.ast(), exp.ast());
  },
  Stmt_read(_1, v, _2, more) {
    return new ReadStatement([v.ast(), ...more.ast()]);
  },
  Stmt_write(_1, e, _2, more) {
    return new WriteStatement([e.ast(), ...more.ast()]);
  },
  Stmt_while(_1, e, _2, b, _3) {
    return new WhileStatement(e.ast(), b.ast());
  },
  Type(typeName) {
    return typeName.sourceString === 'int' ? IntType : BoolType;
  },
  Exp_binary(e1, _, e2) {
    return new BinaryExpression('or', e1.ast(), e2.ast());
  },
  Exp1_binary(e1, _, e2) {
    return new BinaryExpression('and', e1.ast(), e2.ast());
  },
  Exp2_binary(e1, op, e2) {
    return new BinaryExpression(op.sourceString, e1.ast(), e2.ast());
  },
  Exp3_binary(e1, op, e2) {
    return new BinaryExpression(op.sourceString, e1.ast(), e2.ast());
  },
  Exp4_binary(e1, op, e2) {
    return new BinaryExpression(op.sourceString, e1.ast(), e2.ast());
  },
  Exp5_unary(op, e) {
    return new UnaryExpression(op.sourceString, e.ast());
  },
  Exp6_parens(_1, e, _2) {
    return e.ast();
  },
  boollit(_) {
    return new BoolLit(this.sourceString === 'true');
  },
  intlit(_) {
    return new IntLit(this.sourceString);
  },
  VarExp(_) {
    return new VarExp(this.sourceString);
  },
});
/* eslint-enable no-unused-vars */

module.exports = text => {
  const match = grammar.match(text);
  if (!match.succeeded()) {
    throw match.message;
  }
  return astBuilder(match).ast();
};
