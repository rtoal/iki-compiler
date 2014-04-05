var fs = require('fs')
var path = require('path')
var should = require('should')
var scan = require('../scanner')
var parse = require('../parser')
var error = require('../error')

error.quiet = true

var TEST_DIR = 'test/data/syntax-errors'

describe('The parser detects an error for', function () {
  fs.readdirSync(TEST_DIR).forEach(function (name) {
    var check = name.replace(/-/g, ' ').replace(/\.iki$/, '')
    it(check, function (done) {
      scan(path.join(TEST_DIR, name), function (tokens) {
        var priorErrorCount = error.count
        parse(tokens)
        error.count.should.be.above(priorErrorCount)
        done()
      })
    })
  })
})
