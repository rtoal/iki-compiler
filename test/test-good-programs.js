var fs = require('fs')
var path = require('path')
var should = require('should')
var scan = require('../scanner')
var parse = require('../parser')
var error = require('../error')

var TEST_DIR = 'test/data/good-programs'

function checkFrontEndHasNoErrors(baseFilename) {
  it('should compile ' + baseFilename + ' without errors', function (done) {
    scan(path.join(TEST_DIR, baseFilename), function (tokens) {
      var priorErrorCount = error.count
      parse(tokens).analyze()
      error.count.should.eql(priorErrorCount)
      done()
    })
  })
}

describe('The compiler', function () {
  fs.readdirSync(TEST_DIR).forEach(function (name) {
    checkFrontEndHasNoErrors(name)
  })
})
