var should = require('should')
var scan = require('../scanner')
var parse = require('../parser')
var error = require('../error')

function checkForParseErrors(check, baseFilename) {
  it(check, function (done) {
    scan('test/data/syntax-errors/' + baseFilename + '.iki', function (tokens) {
      var priorErrorCount = error.count
      parse(tokens);
      (error.count-priorErrorCount).should.be.above(0)
      done()
    })
  })
}

describe('The parser', function () {

  var checks = {
    'detects error at empty program': 'empty',
    'detects errors at start of statement': 'bad-statement',
    'detects unknown types': 'bad-type',
    'detected bad expressions in assignments': 'bad-expr-in-assignment',
    'detects a missing loop keyword': 'missing-loop',
    'detects a missing end keyword': 'missing-end',
    'detects missing commas in read statements': 'no-comma-in-read',
    'detects missing commas in write statements': 'no-comma-in-write',
    'detects unbalanced parentheses': 'unbalanced-parens',
    'detects a missing semicolon after a variable declaration': 'no-semicolon',
    'detects multiple relational operators without parentheses': 'multiple-relationals'
  };

  for (var check in checks) {
    if (checks.hasOwnProperty(check)) {
      checkForParseErrors(check, checks[check])
    }
  }
})
