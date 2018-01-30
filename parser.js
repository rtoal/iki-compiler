// Parser module
//
//   const parse = require('./parser');
//   const program = parse(sourceCodeString);

const ohm = require('ohm-js');
const fs = require('fs');

const { Program, Block, Type, VariableDeclaration, AssignmentStatement, ReadStatement,
  WriteStatement, WhileStatement, IntegerLiteral, BooleanLiteral, VariableExpression,
  BinaryExpression, UnaryExpression,
} = require('./entities');

const grammar = ohm.grammar(fs.readFileSync('./iki.ohm'));

/* eslint-disable no-unused-vars */
const semantics = grammar.createSemantics().addOperation('ast', {
  Program(b) { return new Program(b.ast()); },
  Block(s, _) { return new Block(s.ast()); },
  Stmt_decl(_1, id, _2, type) { return new VariableDeclaration(id.sourceString, type.ast()); },
  Stmt_assignment(varexp, _, exp) { return new AssignmentStatement(varexp.ast(), exp.ast()); },
  Stmt_read(_1, v, _2, more) { return new ReadStatement([v.ast(), ...more.ast()]); },
  Stmt_write(_1, e, _2, more) { return new WriteStatement([e.ast(), ...more.ast()]); },
  Stmt_while(_1, e, _2, b, _3) { return new WhileStatement(e.ast(), b.ast()); },
  Type(typeName) { return Type.forName(typeName.sourceString); },
  Exp_binary(e1, _, e2) { return new BinaryExpression('or', e1.ast(), e2.ast()); },
  Exp1_binary(e1, _, e2) { return new BinaryExpression('and', e1.ast(), e2.ast()); },
  Exp2_binary(e1, op, e2) { return new BinaryExpression(op.sourceString, e1.ast(), e2.ast()); },
  Exp3_binary(e1, op, e2) { return new BinaryExpression(op.sourceString, e1.ast(), e2.ast()); },
  Exp4_binary(e1, op, e2) { return new BinaryExpression(op.sourceString, e1.ast(), e2.ast()); },
  Exp5_unary(op, e) { return new UnaryExpression(op.sourceString, e.ast()); },
  Exp6_parens(_1, e, _2) { return e.ast(); },
  boollit(_) { return new BooleanLiteral(this.sourceString === 'true'); },
  intlit(_) { return new IntegerLiteral(this.sourceString); },
  VarExp(_) { return new VariableExpression(this.sourceString); },
});
/* eslint-enable no-unused-vars */

module.exports = (text) => {
  const match = grammar.match(text);
  if (!match.succeeded()) {
    throw match.message;
  }
  return semantics(match).ast();
};
