# Scanner module
#
#   scan = require './scanner'
#
#   scan filename, (tokens) -> processTheTokens(tokens)

fs = require 'fs'
byline = require 'byline'
{XRegExp} = require 'xregexp'
error = require './error'

LETTER = XRegExp '[\\p{L}]'
DIGIT = XRegExp '[\\p{Nd}]'
WORD_CHAR = XRegExp '[\\p{L}\\p{Nd}_]'
KEYWORDS = /^(?:int|bool|var|read|write|while|loop|end|and|or|not|true|false)$/

module.exports = (filename, callback) ->
  baseStream = fs.createReadStream filename, {encoding: 'utf8'}
  baseStream.on 'error', (err) -> error(err)

  stream = byline baseStream, {keepEmptyLines: true}
  tokens = []
  linenumber = 0
  stream.on 'readable', () ->
    scan stream.read(), ++linenumber, tokens
  stream.once 'end', () ->
    tokens.push {kind: 'EOF', lexeme: 'EOF'}
    callback tokens

scan = (line, linenumber, tokens) ->
  return if not line

  [start, pos] = [0, 0]

  emit = (kind, lexeme) ->
    tokens.push {kind, lexeme: lexeme or kind, line: linenumber, col: start+1}

  while true
    # Skip spaces
    pos++ while /\s/.test line[pos]
    start = pos

    # Nothing on the line
    break if pos >= line.length

    # Comment
    break if line[pos] is '-' and line[pos+1] is '-'

    # Two-character tokens
    if /<=|==|>=|!=/.test line.substring(pos, pos+2)
      emit line.substring pos, pos+2
      pos += 2

    # One-character tokens
    else if /[+\-*\/(),:;=<>]/.test line[pos]
      emit line[pos++]

    # Reserved words or identifiers
    else if LETTER.test line[pos]
      pos++ while WORD_CHAR.test(line[pos]) and pos < line.length
      word = line.substring start, pos
      emit (if KEYWORDS.test word then word else 'ID'), word

    # Numeric literals
    else if DIGIT.test line[pos]
      pos++ while DIGIT.test line[pos]
      emit 'INTLIT', line.substring start, pos

    else
      error "Illegal character: #{line[pos]}", {line: linenumber, col: pos+1}
      pos++
