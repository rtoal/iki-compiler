/*
 * Grammar Error Tests
 *
 * Checks that our grammar will reject programs with various syntax errors.
 */

const syntaxCheck = require('../syntax-checker');

const errors = [
  ['keyword as id', 'if = 5'],
  ['unclosed paren', 'x = (2 * 3;'],
  ['unknown operator', 'x = 2 ** 5'],
  ['chained relational operators', '1 < 3 < 5'],
  ['bad character in id', '$x = 1'],
  ['keyword in expression', 'x = while + 2;'],
  ['expression as statement', '9-2'],
  ['missing end', 'while true loop write 1;'],
  ['missing loop', 'while false or true write 0; end;'],
  ['missing semicolon', 'var x: int var y: int;'],
  ['empty program', ''],
  ['unknown type', 'var y: zzzzzzz;'],
  ['missing commas in read', 'var x: int; var y: int; read x y;'],
  ['missing commas in write', 'write 1 2;'],
  ['unbalanced parentheses', 'write 1 + (2 - 3));'],
];

describe('The syntax checker', () => {
  errors.forEach(([scenario, program]) => {
    test(`detects the error ${scenario}`, done => {
      expect(syntaxCheck(program)).toBe(false);
      done();
    });
  });
});
