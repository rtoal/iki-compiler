var should = require('should')
var scan = require('../scanner')
var parse = require('../parser')
var error = require('../error')

error.quiet = true

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

describe('The parser detects an error for', function () {

  var checks = {
    'an empty program': 'empty',
    'an illegal of statement': 'bad-statement',
    'an unknown type': 'bad-type',
    'bad expressions in assignments': 'bad-expr-in-assignment',
    'a missing loop keyword': 'missing-loop',
    'a missing end keyword': 'missing-end',
    'missing commas in read statements': 'no-comma-in-read',
    'missing commas in write statements': 'no-comma-in-write',
    'unbalanced parentheses': 'unbalanced-parens',
    'a missing semicolon after a variable declaration': 'no-semicolon',
    'multiple relational operators without parentheses': 'multiple-relationals'
  };

  for (var check in checks) {
    if (checks.hasOwnProperty(check)) {
      checkForParseErrors(check, checks[check])
    }
  }
})
