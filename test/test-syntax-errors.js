var should = require('should')
var scan = require('../scanner')
var parse = require('../parser')
var error = require('../error')

function checkForParseErrors(tokens, done) {
  count = error.count
  parse(tokens);
  (error.count-count).should.be.above(0)
  done()
}

describe('The parser', function () {

  it('detects error at empty program', function (done) {
    scan('test/data/syntax-errors/empty.iki', function (tokens) {
      checkForParseErrors(tokens, done)
    })
  })

  it('detects errors at start of statement', function (done) {
    scan('test/data/syntax-errors/bad-statement.iki', function (tokens) {
      checkForParseErrors(tokens, done)
    })
  })

  it('detects bad type errors', function (done) {
    scan('test/data/syntax-errors/bad-type.iki', function (tokens) {
      checkForParseErrors(tokens, done)
    })
  })

  it('detects bad expressions in assignments', function (done) {
    scan('test/data/syntax-errors/bad-expr-in-assignment.iki', function (tokens) {
      checkForParseErrors(tokens, done)
    })
  })

  it('detects a missing loop keyword', function (done) {
    scan('test/data/syntax-errors/missing-loop.iki', function (tokens) {
      checkForParseErrors(tokens, done)
    })
  })

  it('detects a missing end keyword', function (done) {
    scan('test/data/syntax-errors/missing-end.iki', function (tokens) {
      checkForParseErrors(tokens, done)
    })
  })

  it('detects missing commas in read statements', function (done) {
    scan('test/data/syntax-errors/no-comma-in-read.iki', function (tokens) {
      checkForParseErrors(tokens, done)
    })
  })

  it('detects missing commas in write statements', function (done) {
    scan('test/data/syntax-errors/no-comma-in-write.iki', function (tokens) {
      checkForParseErrors(tokens, done)
    })
  })

  it('detects unbalanced parentheses', function (done) {
    scan('test/data/syntax-errors/unbalanced-parens.iki', function (tokens) {
      checkForParseErrors(tokens, done)
    })
  })
})
