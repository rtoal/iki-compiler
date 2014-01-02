var should = require('should');
var scan = require('../scanner')

describe('Scanner', function() {

  describe('tokens', function () {
    it('recognizes a couple of tokens', function (done) {
      scan('test/hello.iki', function (tokens) {
        tokens.length.should.eql(2)
        tokens[0].kind.should.eql('write')
        tokens[0].lexeme.should.eql('write')
        tokens[1].kind.should.eql('INTLIT')
        tokens[1].lexeme.should.eql('0')
        done();
      })
    });
  });

})
