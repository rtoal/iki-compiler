/*
 * Parser Tests
 *
 * These tests check that the parser produces the AST that we expect.
 *
 * Note we are only checking syntactic forms here, so our test programs
 * may have semantic errors.
 */

const parse = require('../parser');

const {
  Program,
  Block,
  VarDec,
  AssignmentStatement,
  ReadStatement,
  WriteStatement,
  WhileStatement,
  BoolLit,
  IntLit,
  VarExp,
  UnaryExp,
  BinaryExp,
} = require('..');

const fixture = {
  hello: [
    String.raw`write 0, x;`,
    new Program(new Block([new WriteStatement([new IntLit('0'), new VarExp('x')])])),
  ],

  whiles: [
    String.raw`while false loop x = 3; end;`,
    new Program(
      new Block([
        new WhileStatement(
          new BoolLit(false),
          new Block([new AssignmentStatement(new VarExp('x'), new IntLit('3'))])
        ),
      ])
    ),
  ],

  declarations: [
    String.raw`var x: int; var y: bool;`,
    new Program(new Block([new VarDec('x', 'int'), new VarDec('y', 'bool')])),
  ],

  math: [
    String.raw`read x, y; write 2 * (-5 > 7+1);`,
    new Program(
      new Block([
        new ReadStatement([new VarExp('x'), new VarExp('y')]),
        new WriteStatement([
          new BinaryExp(
            '*',
            new IntLit('2'),
            new BinaryExp(
              '>',
              new UnaryExp('-', new IntLit('5')),
              new BinaryExp('+', new IntLit('7'), new IntLit('1'))
            )
          ),
        ]),
      ])
    ),
  ],

  logic: [
    String.raw`write x and (not y or x);`,
    new Program(
      new Block([
        new WriteStatement([
          new BinaryExp(
            'and',
            new VarExp('x'),
            new BinaryExp('or', new UnaryExp('not', new VarExp('y')), new VarExp('x'))
          ),
        ]),
      ])
    ),
  ],
};

describe('The parser', () => {
  Object.entries(fixture).forEach(([name, [source, expected]]) => {
    test(`produces the correct AST for ${name}`, done => {
      expect(parse(source)).toEqual(expected);
      done();
    });
  });

  test('throws an exception on a syntax error', done => {
    // We only need one test here that an exception is thrown.
    // Specific syntax errors are tested in the grammar test.
    expect(() => parse('as$df^&%*$&')).toThrow();
    done();
  });
});
