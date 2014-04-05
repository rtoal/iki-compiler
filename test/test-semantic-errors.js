var fs = require('fs')
var path = require('path')
var should = require('should')
var scan = require('../scanner')
var parse = require('../parser')
var error = require('../error')

error.quiet = true

var TEST_DIR = 'test/data/semantic-errors'

describe('The analyzer detects an error for', function () {
  fs.readdirSync(TEST_DIR).forEach(function (name) {
    var check = name.replace(/-/g, ' ').replace(/\.iki$/, '')
    it(check, function (done) {
      scan(path.join(TEST_DIR, name), function (tokens) {
        var priorErrorCount = error.count
        var program = parse(tokens)
        error.count.should.equal(priorErrorCount)
        program.analyze()
        error.count.should.be.above(priorErrorCount)
        done()
      })
    })
  })
})
