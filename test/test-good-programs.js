const fs = require('fs');
const parse = require('../parser');

const TEST_DIR = 'test/data/good-programs';

describe('The compiler', () => {
  fs.readdirSync(TEST_DIR).forEach((name) => {
    it(`should compile ${name} without errors`, (done) => {
      const program = parse(fs.readFileSync(`${TEST_DIR}/${name}`, 'utf-8'));
      program.analyze();
      done();
    });
  });
});
