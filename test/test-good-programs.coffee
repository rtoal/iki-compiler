fs = require 'fs'
should = require 'should'
parse = require '../parser'
error = require '../error'

TEST_DIR = 'test/data/good-programs'

describe 'The compiler', ->
  fs.readdirSync(TEST_DIR).forEach (name) ->
    it "should compile #{name} without errors", (done) ->
      program = parse(fs.readFileSync("#{TEST_DIR}/#{name}", "utf-8"))
      priorErrorCount = error.count
      program.analyze()
      error.count.should.eql(priorErrorCount)
      done()
