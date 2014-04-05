var should = require('should')
var scan = require('../scanner')
var parse = require('../parser')
var error = require('../error')

function checkForSemanticErrors(check, baseFilename) {
  it(check, function (done) {
    scan('test/data/semantic-errors/' + baseFilename + '.iki', function (tokens) {
      var preParseErrorCount = error.count
      var program = parse(tokens)
      var postParseErrorCount = error.count;
      (postParseErrorCount-preParseErrorCount).should.equal(0)
      program.analyze();
      (error.count-preParseErrorCount).should.be.above(0)
      done()
    })
  })
}

describe('The parser', function () {

  var checks = {
    'detects undeclared variables': 'undeclared-variables',
    'detects writing of booleans': 'write-bool'
  };

  for (var check in checks) {
    if (checks.hasOwnProperty(check)) {
      checkForSemanticErrors(check, checks[check])
    }
  }
})
