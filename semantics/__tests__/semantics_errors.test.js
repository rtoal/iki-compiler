/*
 * Semantic Error Tests
 *
 * These tests check that the analyzer will reject programs whose syntax
 * is fine but that have various static semantic errors.
 */

const parse = require('../../ast/parser');
require('../analyzer');

const errors = [
  ['use of undeclared variable', 'x = 1;'],
  ['redeclared variable', 'var x: int; var x: int;'],
  ['non boolean while condition', 'while 3 loop write 0; end;'],
  ['non integer in add', 'write 3 + true;'],
  ['non integer in subtract', 'write false - 5;'],
  ['writing a boolean', 'write false;'],
  ['type mismatch in assignment', 'var x: int; x = true;'],
  ['another type mismatch in assignment', 'var x: bool; x = 0;'],
  ['types do not match in addition', 'write 3 + false;'],
  ['types do not match in subtraction', 'write 3 - false;'],
  ['types do not match in multiplication', 'write true * 2;'],
  ['types do not match in equality test', 'while 2 < true loop write 1; end;'],
  ['undeclared because in other scope', 'while false loop var x: int; end; write x;'],
  // Might need more here, depending on your test coverage report
];

describe('The semantic analyzer', () => {
  errors.forEach(([scenario, program]) => {
    test(`detects the error ${scenario}`, done => {
      const astRoot = parse(program);
      expect(astRoot).toBeTruthy();
      expect(() => astRoot.analyze()).toThrow();
      done();
    });
  });
});
