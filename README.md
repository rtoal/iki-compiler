![Iki image](http://i.imgur.com/JRTmR2A.png)

This is a compiler for the little programming language called Iki. The compiler is a Node command line application. It’s intended to be useful for people teaching or learning about compiler writing &mdash; at least the front-end parts, since the backends are pretty trivial. Scanning and parsing are done with the help of the Ohm library.

## The Compiler

```
iki.js [-a] [-o] [-i] [--target [x86|c|js]] filename

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  -a         show abstract syntax tree after parsing then stop         [boolean]
  -o         do optimizations                                          [boolean]
  -i         generate and show the intermediate code then stop         [boolean]
  --target   generate code for x86, C, or JavaScript             [default: "js"]
```

## The Language

Iki is a very simple language; there are no functions; all variables are global. It’s statically typed, at least. Here’s a simple Iki program:

```
-- Not hello, world
var x: int;

x = 9 - 305 * 5; -- wow, assignment
while false or 1 == x loop
    write -x, x / 3;
    read x;
end;
```

A full language description is in the file `iki.ohm`.

## Examples

We have some sample Iki programs in the `test` directory. Here’s _simple.iki_:

```
-- Not hello, world
var x: int;
while true or 1 <= 5 loop
  var y: bool;
  read x, y;
  write 9 - 3 * x;
end;

write x;
```

You can generate the abstract syntax tree with `-a`:

```
$ ./iki.js -a test/data/good-programs/simple.iki
Program {
  block:
   Block {
     statements:
      [ VariableDeclaration { id: 'x', type: Type { name: 'int' } },
        WhileStatement {
          condition:
           BinaryExpression {
             op: 'or',
             left: BooleanLiteral { value: true },
             right:
              BinaryExpression {
                op: '<=',
                left: IntegerLiteral { value: '1' },
                right: IntegerLiteral { value: '5' } } },
          body:
           Block {
             statements:
              [ VariableDeclaration { id: 'y', type: Type { name: 'bool' } },
                VariableDeclaration { id: 'z', type: Type { name: 'int' } },
                ReadStatement {
                  varexps:
                   [ VariableExpression { name: 'x' },
                     VariableExpression { name: 'z' } ] },
                WriteStatement {
                  expressions:
                   [ BinaryExpression {
                       op: '-',
                       left: IntegerLiteral { value: '9' },
                       right:
                        BinaryExpression {
                          op: '*',
                          left: IntegerLiteral { value: '3' },
                          right: VariableExpression { name: 'x' } } } ] } ] } },
        WriteStatement { expressions: [ VariableExpression { name: 'x' } ] } ] } }
```

And the semantic graph with `-i`:

```
$ ./iki.js -i test/data/good-programs/simple.iki
Program {
  block:
   Block {
     statements:
      [ VariableDeclaration { id: 'x', type: Type { name: 'int' } },
        WhileStatement {
          condition:
           BinaryExpression {
             op: 'or',
             left: BooleanLiteral { value: true, type: Type { name: 'bool' } },
             right:
              BinaryExpression {
                op: '<=',
                left: IntegerLiteral { value: '1', type: Type { name: 'int' } },
                right: IntegerLiteral { value: '5', type: Type { name: 'int' } },
                type: Type { name: 'bool' } },
             type: Type { name: 'bool' } },
          body:
           Block {
             statements:
              [ VariableDeclaration { id: 'y', type: Type { name: 'bool' } },
                VariableDeclaration { id: 'z', type: Type { name: 'int' } },
                ReadStatement {
                  varexps:
                   [ VariableExpression {
                       name: 'x',
                       referent: VariableDeclaration { id: 'x', type: Type { name: 'int' } },
                       type: Type { name: 'int' } },
                     VariableExpression {
                       name: 'z',
                       referent: VariableDeclaration { id: 'z', type: Type { name: 'int' } },
                       type: Type { name: 'int' } } ] },
                WriteStatement {
                  expressions:
                   [ BinaryExpression {
                       op: '-',
                       left: IntegerLiteral { value: '9', type: Type { name: 'int' } },
                       right:
                        BinaryExpression {
                          op: '*',
                          left: IntegerLiteral { value: '3', type: Type { name: 'int' } },
                          right:
                           VariableExpression {
                             name: 'x',
                             referent: VariableDeclaration { id: 'x', type: Type { name: 'int' } },
                             type: Type { name: 'int' } },
                          type: Type { name: 'int' } },
                       type: Type { name: 'int' } } ] } ] } },
        WriteStatement {
          expressions:
           [ VariableExpression {
               name: 'x',
               referent: VariableDeclaration { id: 'x', type: Type { name: 'int' } },
               type: Type { name: 'int' } } ] } ] } }
```

To translate the program to JavaScript, use `--target js` or no `--target` option at all:

```
$ ./iki.js test/data/good-programs/simple.iki
(function () {
  var x_1 = 0;
  while ((true || (1 <= 5))) {
    var y_2 = false;
    var z_3 = 0;
    x_1 = prompt();
    z_3 = prompt();
    alert((9 - (3 * x_1)));
  }
  alert(x_1);
}());
```

You can translate to C with `--target c`:

```
$ $ ./iki.js --target=c test/data/good-programs/simple.iki
#include <stdio.h>
#include <stdbool.h>
int main() {
    int x_1 = 0;
    while ((1 || (1 <= 5))) {
        bool y_2 = 0;
        int z_3 = 0;
        scanf("%d\n", &x_1);
        scanf("%d\n", &z_3);
        printf("%d\n", (9 - (3 * x_1)));
    }
    printf("%d\n", x_1);
    return 0;
}
```

And to x86 assembly with `--target x86`. As of now, the generated assembly language only works on a Mac.  Is your favorite platform missing? Implement it and send a pull request!

```
$ ./iki.js --target=x86 test/data/good-programs/simple.iki
        .globl      _main
        .text
_main:
        push        %rbp
L1:
        movq        $-1, %rax
        cmp         $0, %rax
        jne         L3
        movq        $1, %rcx
        cmp         $5, %rcx
        setle       %cl
        movsbq      %cl, %rcx
        mov         %rcx, %rax
L3:
        cmpq        $0, %rax
        je          L2
        mov         _x_1(%rip), %rsi
        lea         READ(%rip), %rdi
        xor         %rax, %rax
        call        _scanf
        mov         _z_2(%rip), %rsi
        lea         READ(%rip), %rdi
        xor         %rax, %rax
        call        _scanf
        movq        $9, %rax
        movq        $3, %rcx
        imulq       _x_1(%rip), %rcx
        subq        %rcx, %rax
        mov         %rax, %rsi
        lea         WRITE(%rip), %rdi
        xor         %rax, %rax
        call        _printf
        jmp         L1
L2:
        mov         _x_1(%rip), %rsi
        lea         WRITE(%rip), %rdi
        xor         %rax, %rax
        call        _printf
        pop         %rbp
        ret
        .data
READ:
        .ascii      "%d\0\0"
WRITE:
        .ascii      "%d\n\0"
_x_1:
        .quad        0
_z_2:
        .quad        0
```

## For Developers

This is a pretty standard node.js application.

After cloning the repo, you should do the usual:
```
npm install
npm test
```
and you’re good to go.
