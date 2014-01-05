var should = require('should');
var scan = require('../scanner')
var i = require('util').inspect

describe('The scanner', function () {

  it('scans the simplest program', function (done) {
    scan('test/hello.iki', function (tokens) {
      tokens.length.should.eql(3)
      i(tokens[0]).should.equal(i({kind:'write',lexeme:'write',line:1,col:1}))
      i(tokens[1]).should.equal(i({kind:'INTLIT',lexeme:'0',line:1,col:7}))
      i(tokens[2]).should.equal(i({kind:';',lexeme:';',line:1,col:8}))
      done()
    });
  })

  it('does line numbers', function (done) {
    scan('test/hello.iki', function (tokens) {
      tokens[0].line.should.eql(1)
      tokens[0].col.should.eql(1)
      done()
    });
  });
  
});
