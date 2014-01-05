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

  it('properly handles comments and blank lines', function (done) {
    scan('test/simple.iki', function (tokens) {
      tokens[0].line.should.eql(2)
      tokens[0].col.should.eql(1)
      tokens[8].line.should.eql(4)
      tokens[8].col.should.eql(7)
      tokens[15].line.should.eql(5)
      tokens[15].col.should.eql(8)
      done()
    });
  });
  
});
