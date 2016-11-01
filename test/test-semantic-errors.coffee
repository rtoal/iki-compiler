fs = require 'fs'
should = require 'should'
parse = require '../parser'
error = require '../error'

error.quiet = true

TEST_DIR = 'test/data/semantic-errors'

describe 'The analyzer detects an error for', () ->
  fs.readdirSync(TEST_DIR).forEach (name) ->
    check = name.replace(/-/g, ' ').replace(/\.iki$/, '')
    it check, (done) ->
      program = parse(fs.readFileSync("#{TEST_DIR}/#{name}", "utf-8"))
      priorErrorCount = error.count
      program.analyze()
      error.count.should.be.above(priorErrorCount)
      done()
