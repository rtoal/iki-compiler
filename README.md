This is a compiler for the little programming language called Iki. The compiler is a node.js app.  It's intented to be useful for people teaching or learning about compiler writing &mdash; at least the front-end parts. Parsing is done by hand with a simple recursive-descent parser.

**This project is very much under development.**

## Usage

```
iki.js [-t] [-a] [-o] [-i] [--target [js|c|x86]] filename

  -t scans, prints the tokens, then exits
  -a scans, parses, prints the abstract syntax tree, then exits
  -o does optimizations
  -i goes up to semantic analysis, prints the semantic graph, then exits
  --target selects the output format (default is `js`)
```

## Grammar

Iki programs are free-format.  Comments start with `--` and extend to the end of the line.  The predefined tokens are `Intlit`, a sequence of one or more Basic Latin decimal digits, and `Id`, a sequence of Basic Latin letters, Basic Latin decimal digits, and underscores, beginning with a letter, that is not a reserved word (`int`, `bool`, `var`, `read`, `write`, `while`, `loop`, `end`, `and`, `or`, `not`, `true`, `false`).  Tokenization uses maximal much, where the space characters are U+0009 through U+000D, U+2028, U+2029, and any character in the Unicode Zs category.

The macrosyntax is given below, in a form that can be directly input into Gunther Rademacher's [Railroad Diagram Generator](http://www.bottlecaps.de/rr/ui)

```
Program  ::=  Block
Block    ::=  (Stmt ';')+
Stmt     ::=  'var' Id ':' Type
          |   Id '=' Exp
          |   'read' Id (',' Id)*
          |   'write' Exp (',' Exp)*
          |   'while' Exp 'loop' Block 'end'
Type     ::=  'int' | 'bool'
Exp      ::=  Exp1 ('or' Exp1)*
Exp1     ::=  Exp2 ('and' Exp2)*
Exp2     ::=  Exp3 (('<' | '<=' | '==' | '!=' | '>=' | '>') Exp3)?
Exp3     ::=  Exp4 ([+-] Exp4)*
Exp4     ::=  Exp5 ([*/] Exp5)*
Exp5     ::=  ('not' | '-')? Exp6
Exp6     ::=  'true' | 'false' | Intlit | Id | '(' Exp ')'
```

## Examples

Given the file called _simple.iki_:

```
-- Not hello, world
var x: int;

x = 9 - 3 * 5; -- wow, assignment
write -x, true or 1 == x;
```

You can see the output of the scanner like so:

```
$ ./iki.js -t simple.iki 
{ kind: 'var', lexeme: 'var', line: 2, col: 1 }
{ kind: 'ID', lexeme: 'x', line: 2, col: 5 }
{ kind: ':', lexeme: ':', line: 2, col: 6 }
{ kind: 'int', lexeme: 'int', line: 2, col: 8 }
{ kind: ';', lexeme: ';', line: 2, col: 11 }
{ kind: 'ID', lexeme: 'x', line: 4, col: 1 }
{ kind: '=', lexeme: '=', line: 4, col: 3 }
{ kind: 'INTLIT', lexeme: '9', line: 4, col: 5 }
{ kind: '-', lexeme: '-', line: 4, col: 7 }
{ kind: 'INTLIT', lexeme: '3', line: 4, col: 9 }
{ kind: '*', lexeme: '*', line: 4, col: 11 }
{ kind: 'INTLIT', lexeme: '5', line: 4, col: 13 }
{ kind: ';', lexeme: ';', line: 4, col: 14 }
{ kind: 'write', lexeme: 'write', line: 5, col: 1 }
{ kind: '-', lexeme: '-', line: 5, col: 7 }
{ kind: 'ID', lexeme: 'x', line: 5, col: 8 }
{ kind: ',', lexeme: ',', line: 5, col: 9 }
{ kind: 'true', lexeme: 'true', line: 5, col: 11 }
{ kind: 'or', lexeme: 'or', line: 5, col: 16 }
{ kind: 'INTLIT', lexeme: '1', line: 5, col: 19 }
{ kind: '==', lexeme: '==', line: 5, col: 21 }
{ kind: 'ID', lexeme: 'x', line: 5, col: 24 }
{ kind: ';', lexeme: ';', line: 5, col: 25 }
```

And the abstract syntax tree like so:

```
$ ./iki.js -a test/simple.iki 
(Program (Block (Var :x int) (= x (- 9 (* 3 5))) (Write (- x) (or true (== 1 x)))))
```

And the semantic graph like so:

```
$ ./iki.js -i test/simple.iki 
3   Type {"name":"int"}
2   VariableDeclaration {"id":"x","type":3}
5   VariableReference {"token":"x","referent":2,"type":3}
7   IntegerLiteral {"token":"9","type":3}
9   IntegerLiteral {"token":"3","type":3}
10  IntegerLiteral {"token":"5","type":3}
8   BinaryExpression {"op":"*","left":9,"right":10,"type":3}
6   BinaryExpression {"op":"-","left":7,"right":8,"type":3}
4   AssignmentStatement {"target":5,"source":6}
13  VariableReference {"token":"x","referent":2,"type":3}
12  UnaryExpression {"op":"-","operand":13,"type":3}
16  Type {"name":"bool"}
15  BooleanLiteral {"name":"true","type":16}
18  IntegerLiteral {"token":"1","type":3}
19  VariableReference {"token":"x","referent":2,"type":3}
17  BinaryExpression {"op":"==","left":18,"right":19,"type":16}
14  BinaryExpression {"op":"or","left":15,"right":17,"type":16}
11  WriteStatement {"expressions":[12,14]}
1   Block {"statements":[2,4,11]}
0   Program {"block":1}
```

To translate the program to JavaScript:

```
$ ./iki.js test/simple.iki 
(function () {
    var _v1 = 0;
    _v1 = (9 - (3 * 5));
    console.log((- _v1));
    console.log((true || (1 == _v1)));
}());
```

And to C:

```
$ ./iki.js --target c test/simple.iki 
#include <stdio.h>
int main() {
    var _v1 = 0;
    _v1 = (9 - (3 * 5));
    printf("%d\n", (- _v1));
    printf("%d\n", (1 || (1 == _v1)));
    return 0;
}
```

And to x86:

```
$ ./iki.js --target x86 test/simple.iki 
.
.
.
.
.
```
