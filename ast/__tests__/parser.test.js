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
  VariableDeclaration,
  IntType,
  BoolType,
  AssignmentStatement,
  ReadStatement,
  WriteStatement,
  WhileStatement,
  BooleanLiteral,
  IntegerLiteral,
  VariableExpression,
  UnaryExpression,
  BinaryExpression,
} = require('..');

const fixture = {
  hello: [
    String.raw`write 0, x;`,
    new Program(
      new Block([new WriteStatement([new IntegerLiteral('0'), new VariableExpression('x')])])
    ),
  ],

  whiles: [
    String.raw`while false loop x = 3; end;`,
    new Program(
      new Block([
        new WhileStatement(
          new BooleanLiteral(false),
          new Block([new AssignmentStatement(new VariableExpression('x'), new IntegerLiteral('3'))])
        ),
      ])
    ),
  ],

  declarations: [
    String.raw`var x: int; var y: bool;`,
    new Program(
      new Block([new VariableDeclaration('x', IntType), new VariableDeclaration('y', BoolType)])
    ),
  ],

  math: [
    String.raw`read x, y; write 2 * (-5 > 7+1);`,
    new Program(
      new Block([
        new ReadStatement([new VariableExpression('x'), new VariableExpression('y')]),
        new WriteStatement([
          new BinaryExpression(
            '*',
            new IntegerLiteral('2'),
            new BinaryExpression(
              '>',
              new UnaryExpression('-', new IntegerLiteral('5')),
              new BinaryExpression('+', new IntegerLiteral('7'), new IntegerLiteral('1'))
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
          new BinaryExpression(
            'and',
            new VariableExpression('x'),
            new BinaryExpression(
              'or',
              new UnaryExpression('not', new VariableExpression('y')),
              new VariableExpression('x')
            )
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
