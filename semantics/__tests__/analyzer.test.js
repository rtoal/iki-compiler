/*
 * Semantic Analyzer Success Test
 *
 * These tests check that the semantic analyzer correctly accepts a program that
 * passes all of semantic constraints specified by the language.
 */

const parse = require('../../ast/parser');
require('../analyzer');

const program = String.raw`
-- This Iki program has close to all syntactic and semantic forms
var x: int;
var y: int;

read y, x;
while 4 - x <= 10 and 0 == 1 loop
  var x: int;
  while false and 1>2 and 1<3 or false!=(1>=100) loop
    var x: bool;
    x = x==x and not (y > 3) or x;
    write y * (3 + y);
  end;
  -- Looks like we can do a lot of optimizations here too
  x = -1 + 2 - 3;
end;

var test: bool; -- ok
test = false and 8 != 2 or test and not test;

write y;
write y * (3 + 44), 6 - -8;
`;

describe('The semantic analyzer', () => {
  test('accepts the mega program', done => {
    const astRoot = parse(program);
    expect(astRoot).toBeTruthy();
    astRoot.analyze();
    expect(astRoot).toBeTruthy();
    done();
  });
});
