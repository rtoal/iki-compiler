var fs = require('fs');
var byline = require('byline')
var error = require('./error')

var tokens = []

module.exports = function (filename, callback) {
  var stream = byline(fs.createReadStream(filename, {encoding: 'utf8'}), {keepEmptyLines: true});
  var linenumber = 0;
  stream.on('readable', function () {
    scan(stream.read(), ++linenumber)
  });
  stream.once('end', function () {
    callback(tokens)
  });
}

function scan(line, linenumber) {
  if (!line) return

  var start, pos = 0;

  function emit(kind, lexeme) {
    tokens.push({kind: kind, lexeme: lexeme || kind, line: linenumber, pos: start+1})
  }

  while (true) {
    while (/[ \n\r\t]/.test(line[pos])) pos++
    if (pos >= line.length) break;

    start = pos;

    if (/[,+\-*\/();=]/.test(line[pos])) {
      emit(line[pos++])

    } else if (/[A-Za-z]/.test(line[pos])) {
      while (/\w/.test(line[pos]) && pos < line.length) pos++;
      var word = line.substring(start, pos)
      if (/begin|end|var|read|write|while|loop/.test(word)) {
        emit(word)
      } else {
        emit('ID', word)
      }
    
    } else if (/\d/.test(line[pos])) {
      while (/\d/.test(line[pos])) pos++
      emit('INTLIT', line.substring(start, pos))
    
    } else {
      error('Illegal character in source code: ' + line[pos], {line: linenumber})
    }
  }
}
