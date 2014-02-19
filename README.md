![Iki imeage](http://i.imgur.com/JRTmR2A.png)

This is a compiler for the little programming language called Iki. The compiler is a node.js app.  It's intended to be useful for people teaching or learning about compiler writing &mdash; at least the front-end parts, since the backends are pretty trivial. Scanning and parsing are done by hand rather than with a parser generator, giving students an opportunity to learn about text processing and recursive descent parsing.

## The Compiler

```
iki.js [-t] [-a] [-o] [-i] [--target [js|c|x86]] filename

  -t scans, prints the tokens, then exits
  -a scans, parses, prints the abstract syntax tree, then exits
  -o does optimizations
  -i goes up to semantic analysis, prints the semantic graph, then exits
  --target selects the output format (default is `js`)
```

## The Language

Iki is a very simple language; there are no functions; all variables are global.  It's statically typed, at least.  Here's a simple Iki program:

```
-- Not hello, world
var x: int;

x = 9 - 305 * 5; -- wow, assignment
while false or 1 == x loop
    write -x, x / 3;
    read x;
end;
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
while true or 1 <= 5 loop
  var y: bool;
  read x;
  write 9 - 3 * x;
end;

write x;
```

You can see the output of the scanner using `-t`:

```
$ ./iki.js -t simple.iki 
{ kind: 'var', lexeme: 'var', line: 2, col: 1 }
{ kind: 'ID', lexeme: 'x', line: 2, col: 5 }
{ kind: ':', lexeme: ':', line: 2, col: 6 }
{ kind: 'int', lexeme: 'int', line: 2, col: 8 }
{ kind: ';', lexeme: ';', line: 2, col: 11 }
{ kind: 'while', lexeme: 'while', line: 3, col: 1 }
{ kind: 'true', lexeme: 'true', line: 3, col: 7 }
{ kind: 'or', lexeme: 'or', line: 3, col: 12 }
{ kind: 'INTLIT', lexeme: '1', line: 3, col: 15 }
{ kind: '<=', lexeme: '<=', line: 3, col: 17 }
{ kind: 'INTLIT', lexeme: '5', line: 3, col: 20 }
{ kind: 'loop', lexeme: 'loop', line: 3, col: 22 }
{ kind: 'var', lexeme: 'var', line: 4, col: 3 }
{ kind: 'ID', lexeme: 'y', line: 4, col: 7 }
{ kind: ':', lexeme: ':', line: 4, col: 8 }
{ kind: 'bool', lexeme: 'bool', line: 4, col: 10 }
{ kind: ';', lexeme: ';', line: 4, col: 14 }
{ kind: 'read', lexeme: 'read', line: 5, col: 3 }
{ kind: 'ID', lexeme: 'x', line: 5, col: 8 }
{ kind: ';', lexeme: ';', line: 5, col: 9 }
{ kind: 'write', lexeme: 'write', line: 6, col: 3 }
{ kind: 'INTLIT', lexeme: '9', line: 6, col: 9 }
{ kind: '-', lexeme: '-', line: 6, col: 11 }
{ kind: 'INTLIT', lexeme: '3', line: 6, col: 13 }
{ kind: '*', lexeme: '*', line: 6, col: 15 }
{ kind: 'ID', lexeme: 'x', line: 6, col: 17 }
{ kind: ';', lexeme: ';', line: 6, col: 18 }
{ kind: 'end', lexeme: 'end', line: 7, col: 1 }
{ kind: ';', lexeme: ';', line: 7, col: 4 }
{ kind: 'write', lexeme: 'write', line: 9, col: 1 }
{ kind: 'ID', lexeme: 'x', line: 9, col: 7 }
{ kind: ';', lexeme: ';', line: 9, col: 8 }
{ kind: 'EOF', lexeme: 'EOF' }
```

And the abstract syntax tree with `-a`:

```
$ ./iki.js -a simple.iki 
(Program (Block (Var :x int) (While (or true (<= 1 5)) (Block (Var :y bool) (Read x) (Write (- 9 (* 3 x))))) (Write x)))

```

And the semantic graph with `-i`:

```
$ ./iki.js -i simple.iki 
3 Type {"name":"int"}
2 VariableDeclaration {"id":"x","type":3}
7 Type {"name":"bool"}
6 BooleanLiteral {"name":"true","type":7}
9 IntegerLiteral {"token":"1","type":3}
10 IntegerLiteral {"token":"5","type":3}
8 BinaryExpression {"op":"<=","left":9,"right":10,"type":7}
5 BinaryExpression {"op":"or","left":6,"right":8,"type":7}
12 VariableDeclaration {"id":"y","type":7}
14 VariableReference {"token":"x","referent":2,"type":3}
13 ReadStatement {"varrefs":[14]}
17 IntegerLiteral {"token":"9","type":3}
19 IntegerLiteral {"token":"3","type":3}
20 VariableReference {"token":"x","referent":2,"type":3}
18 BinaryExpression {"op":"*","left":19,"right":20,"type":3}
16 BinaryExpression {"op":"-","left":17,"right":18,"type":3}
15 WriteStatement {"expressions":[16]}
11 Block {"statements":[12,13,15]}
4 WhileStatement {"condition":5,"body":11}
22 VariableReference {"token":"x","referent":2,"type":3}
21 WriteStatement {"expressions":[22]}
1 Block {"statements":[2,4,21]}
0 Program {"block":1}
```

To translate the program to JavaScript, use `--target js` or no `--target` option at all:

```
$ ./iki.js test/simple.iki 
(function () {
    var _v1 = 0;
    while ((true || (1 <= 5))) {
        var _v2 = false;
        _v1 = prompt();
        alert((9 - (3 * _v1)));
    }
    alert(_v1);
}());
```

You can translate to C with `--target c`:

```
$ ./iki.js --target c test/simple.iki 
#include <stdio.h>
int main() {
    int _v1 = 0;
    while ((1 || (1 <= 5))) {
        bool _v2 = 0;
        scanf("%d\n", &_v1);
        printf("%d\n", (9 - (3 * _v1)));
    }
    printf("%d\n", _v1);
    return 0;
}
```

And to x86 assembly with `--target x86`.  As of now, the generated assembly language only works on a Mac.  I'm working on it!

```
$ ./iki.js --target x86 test/simple.iki 
        .globl  _main
        .text
_main:
        push    %rbp
L1:
        movq    $1, %rax
        cmp     $0, %rax
        jne     L3
        movq    $1, %rcx
        cmp     $5, %rcx
        setle   %cl
        movsbq  %cl, %rcx
        mov     %rcx, %rax
L3:
        cmpq    $0, %rax
        je      L2
        mov     _v1(%rip), %rsi
        lea     READ(%rip), %rdi
        xor     %rax, %rax
        call    _scanf
        movq    $9, %rax
        movq    $3, %rcx
        imulq   _v1(%rip), %rcx
        subq    %rcx, %rax
        mov     %rax, %rsi
        lea     WRITE(%rip), %rdi
        xor     %rax, %rax
        call    _printf
        jmp     L1
L2:
        mov     _v1(%rip), %rsi
        lea     WRITE(%rip), %rdi
        xor     %rax, %rax
        call    _printf
        pop     %rbp
        ret
        .data
READ:
        .ascii  "%d\0\0"
WRITE:
        .ascii  "%d\n\0"
_v1:
        .quad   0
```
