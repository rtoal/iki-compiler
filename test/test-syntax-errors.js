const fs = require('fs');
const assert = require('assert');
const parse = require('../parser');

const TEST_DIR = 'test/data/syntax-errors';

describe('The parser detects a syntax error for', () => {
  fs.readdirSync(TEST_DIR).forEach((name) => {
    const check = name.replace(/-/g, ' ').replace(/\.iki$/, '');
    it(check, (done) => {
      const sourceCode = fs.readFileSync(`${TEST_DIR}/${name}`, 'utf-8');
      assert.throws(() => parse(sourceCode));
      done();
    });
  });
});
