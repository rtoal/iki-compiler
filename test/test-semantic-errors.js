const fs = require('fs');
const parse = require('../parser');
const assert = require('assert');

const TEST_DIR = 'test/data/semantic-errors';

describe('The compiler', () => {
  fs.readdirSync(TEST_DIR).forEach((name) => {
    const check = name.replace(/-/g, ' ').replace(/\.iki$/, '');
    it(check, (done) => {
      const program = parse(fs.readFileSync(`${TEST_DIR}/${name}`, 'utf-8'));
      assert.throws(() => program.analyze());
      done();
    });
  });
});
