when we programming, we have to use given lanague to write lots of strings in a given file, for example following is a piece of js code:

```js
let x = 1
let y = 2
let z = x + y
let f = y - z
let h = 1+2
let hello = "hello"
let word = "word!"
let hello_word = hello + word
```

but be noticed, such kind of code is humman facing, which meas it is readable for human but not for machine. machine can only recoginze numbers not strings, and we need to transfor
this strings into number, this process is called lexing. How can we do this? first we need to group strings into different categories, we group x, y, hello, word, hello_word into one catigory called identifier. group "1", "2", into one catigory called number, group "hello", "world!" into one catigory called string. we need to pay attention to "let", we can't put it into group string or identifier, the reason it can't be string is , it is not included in double quotes, and it can't be assigned value, for example it is illegal to do this:
```js
const let = 2
```
therefore we need to put let in its own group we called keyword, and finnaly we need to put "+", "-", "=" into one category called operator. Now we have groups like following:
```js
keyword: {
"let"
}
string: {
"hello", "word!"
}
number:{
"1", "2"
}
identifier: {
   "hello", "word", "f", "h", "y", "z"
}
operator: {
"+", "-"
}
```
and we can assign a number to each group just like this:
```js
keyword-> 0, string->1, number->2, identifier->3, operator->4
```
by doing this we can transofer a line of code into a line of numbers, for example the following code:
```js
let h = 3+2
```
would change to following numbers:
```js
0 3 4 2 4 2 
```
you will notice this bring new problem, when we look at number 2, we know is is number, but which values it is? 1 or 2?, only change strings into numbers will lost import information. Such information is essential for compiler or intepretor, and we need to keep them. Then we can use a object to keep them together, we call this object as token, we will transfor strings into tokens like this:
```js
{
val: 0,
str: "let"
},
{
val: 1,
str: "hello"
},
{
val: 1,
str: "world!"
},
{
val: 2,
str: "1",
},
{
val: 2,
str: "2",
},
...
{
val: 3:
str: "+",
}
,
...

```
we may keep other informations in object token too, such as line number, the process of transofr code string into combination of tokes is called lexing. We will take following steps for lexing:
1, read character one by one from code strings
2, when encounter special character such as space, newline, carriage, then we group characters read into one string
3, check the categroup of current string
4, generate a token object for current string 

let's see how we use code to do this, first open your console, cd to a empty folder and run the following command:
```js
npx create-react-app dragonscript
```
after the command you will find a folder called dragonscript, cd into it and run 
```
npm start
```
make sure a reactjs webpage can bring up normally. open vscode and drag and drop the dragonscript folder into it, by doing this we can edit code in the project.Go to console and click "ctr"+"c" to end the running of our programm, and run the following commad to install a terminal emulator component:
```js
npm i react-console-emulator
```
then cd into src folder, and create a new child forlder called components, and create another child folder in components called terminal, and create a new file named terminal.jsx in terminal folder:


<img width="380" alt="截屏2024-01-22 13 33 40" src="https://github.com/wycl16514/dragonscript_lexing/assets/7506958/66a6a27b-a3b6-41c3-8e6c-bb9a24d45046">

and we add the following code in terminal.jsx:
```js
import React, { useState } from "react";
import Terminal from 'react-console-emulator'

const TerminalEmulator = () => {
    const commands = {
        lexing: {
            description: 'lexing a passed string.',
            usage: 'lexing <string>',
            fn: (...args) => {
                console.log("receive lexing command for str: ", args.join(' '))
                return "lexing command received"
            }
        }
    }

    return (
        <div>
            <Terminal
                commands={commands}
                welcomeMessage={'Welcome to the dragon script terminal!'}
                promptLabel={'me@dragon:~$'}
            />
        </div>
    )
}
export default TerminalEmulator
```
we will use this console emulator to emulate REPL("Read Eval Print Loop"), goto App.js, delete all content in it, and add the following code :
```js
import React from "react";
import TerminalEmulator from './components/terminal/terminal'
function App() {
  return (
    <div className="App">
      <TerminalEmulator></TerminalEmulator>
    </div>
  );
}

export default App;
```
in the code above, we will add the console emulator to our front page, after above changes, run npm start, and input command "lexing" in the console and hit return, you will see following:
<img width="588" alt="截屏2024-01-22 16 38 47" src="https://github.com/wycl16514/dragonscript_lexing/assets/7506958/182c4c8a-891f-49e2-aac2-605b888be42a">

now we begin to implement lexing algorithm, create a folder name "compiler" under "src", and create a sub folder name "scanner" under "compiler".Create a file name token.js in folder "scanner" and  we need to define a value to each category by using the following code:
```js
export default class Scanner {
    static LEFT_PAREN = 0 //(
    static RIGHT_PAREN = 1 // )
    static LEFT_BRACE = 2 //{
    static RIGHT_BRACE = 3 //}
    static COMMA = 4 //,
    static DOT = 5 //.
    static MINUS = 6 // -
    static PLUS = 7 // +
    static SEMICOLON = 8 // ;
    static SLASH = 9 // /
    static START = 10 // *
    static BANG = 11 // !
    static BANG_EQUAL = 12 //!=
    static EQUAL = 13 // =
    static EQUAL_EQUAL = 14 // ==
    static GREATER = 15 // >
    static GREATER_EQUAL = 16 // >=
    static LESS = 17 // <
    static LESS_EQUAL = 18 // <=
    static OPERATOR_AND = 19 // &
    static OPERATOR_AND_AND = 20 // &&
    static OERPATOR_OR = 21 // |
    static OPERATOR_OR_OR = 22 // ||
    static QUESTION_MARK = 23 // ?
    static IDENTIFIER = 14 // x, y...
    static STRING = 25 // "hello"
    static NUMBER = 26 // 1,2,3...
    //key words
    static AND = 27 // "and"
    static CLASS = 28 // "class"
    static ELSE = 29 //"else"
    static FALSE = 30 //"false"
    static TRUE = 31 //"true"
    //fn,fun,functions are key word for defining functions
    static FN = 32 //"fn"
    static FUN = 33 //"fun"
    static FUNCTION = 34 // "function"
    static FOR = 35 //"for"
    static IF = 36 //"if"
    /*
    nil is the same as None in python, null in js
    */
    static NIL = 37 //nil 
    static OR = 38
    static PRINT = 39 //print
    static RETURN = 40 // return
    static SUPER = 41 //super
    static THIS = 42 //this
    /*
    let and var both used for defining variable,
    their difference is just like they are in js
    */
    static LET = 43 //let 
    static VAR = 44
    static WHILE = 45
    static EOF = 46 // indicate end of input
    constructor(source) {
        this.source = source
        this.current = 0
        this.line = 0
    }
}


}
```
now we can define a token object, it will contain following information:
1, Literal value, this is the string we just read, it is called lexeme in compiler terminology
2，Location, in which line we read the current string
3, Category value, that is the value we defined aboved

when we lexing the code, we will read character by character, when we hit a special character such space, newline, tab, then we group the characters into one string, check this string belongs to which category,  create a token object and return it to caller, we will do this in a function call scan, add the following scanner function  in the scanner class:
```js
 scan = () => {
        return {}
    }
```
when we doing a big project, the best way to make it right is cut it into small pieces, each piece is small and simple enough, we make sure each piece is work as expected and after finalizing all pieces , we group them together to make the big project done, this is so call "divide and conquer". Here we will use the test driven strategy to achive this, luckly reactjs bright with it a test framework called JTest, we can use it to do unit testing easily,create a file with name scanner.test.js, it will contain our test cases for scanner, we add our first test case:

```js
import Scanner from './token'
describe("Testin Scanner", () => {
    it("should return EOS token for empty source", () => {
        const scanner = Scanner('')
        const eos_token = scanner.scan()
        expect(eos_token).toMatchObject({
            lexeme: "",
            token: Scanner.EOF,
            line: 0,
        })
    });

});
```

remove App.test.js at the root directory to save our test running time, and then run the following command:

```js
npm test
```
you will see our test fail:
<img width="723" alt="截屏2024-01-22 23 22 37" src="https://github.com/wycl16514/dragonscript_lexing/assets/7506958/c25f56d9-5030-465e-be56-663bb4f2397a">


that is a sure thing, the test expect the scan function return a object which has field with name lexeme and its value is empty string, field with name token its value is EOF and field line with value 0, but currently scan return a null, now we add code to make the test pass, in token.js we rewrite scan function as following:
```js
scan = () => {
        if (this.current >= this.source.length) {
            return {
                lexeme: "",
                token: Scanner.EOF,
                line: 0,
            }
        }
        return {}
    }
```
save the file and JTest will run again and this time we see it passes through:
<img width="889" alt="截屏2024-01-22 23 24 13" src="https://github.com/wycl16514/dragonscript_lexing/assets/7506958/588437fd-3d19-43f6-adf6-f59c5ed7605c">

that's really great, it is a good sign for our beginning. Now we can add more test cases , first we add test case for scanning left paren:
```js
   it("shoud return left paren token for (", () => {
        let scanner = new Scanner('(123)')
        let left_paren_token = scanner.scan()
        expect(left_paren_token).toMatchObject({
            lexeme: "(",
            token: Scanner.LEFT_PAREN,
            line: 0,
        })
    })
```
of course this test case will fail because we havn't add left paren token scanning yet, now we rewrite the scan function in Scanner class as following:
```js
 makeToken = (lexeme, token, line) => {
        return {
            lexeme: lexeme,
            token: token,
            line: line,
        }
    }

    scan = () => {
       while (this.current < this.source.length) {
            const c = this.source[this.current]
           
            switch (c) {
                case '(':
                    this.current += 1
                    return this.makeToken("" + c, Scanner.LEFT_PAREN, this.line)
            }
        }

        if (this.current >= this.source.length) {
            return {
                lexeme: "",
                token: Scanner.EOF,
                line: 0,
            }
        }


        return {}
    }
```
after the above code, we can see the new test case passes, following the same way we add more test cases like these in scanner.test.js:
```js
it("shoud return right paren token for )", () => {
        let scanner = new Scanner(')')
        let right_paren_token = scanner.scan()
        expect(right_paren_token).toMatchObject({
            lexeme: ")",
            token: Scanner.RIGHT_PAREN,
            line: 0,
        })
    })

    it("shoud return left brace token for {", () => {
        let scanner = new Scanner('{')
        let left_brace_token = scanner.scan()
        expect(left_brace_token).toMatchObject({
            lexeme: "{",
            token: Scanner.LEFT_BRACE,
            line: 0,
        })
    })

    it("shoud return right brace token for }", () => {
        let scanner = new Scanner('}')
        let right_brace_token = scanner.scan()
        expect(right_brace_token).toMatchObject({
            lexeme: "}",
            token: Scanner.RIGHT_BRACE,
            line: 0,
        })
    })

    it("shoud return comma token for ,", () => {
        let scanner = new Scanner(',')
        let comma_token = scanner.scan()
        expect(comma_token).toMatchObject({
            lexeme: ",",
            token: Scanner.COMMA,
            line: 0,
        })
    })

    it("shoud return dot token for .", () => {
        let scanner = new Scanner('.')
        let dot_token = scanner.scan()
        expect(dot_token).toMatchObject({
            lexeme: ".",
            token: Scanner.DOT,
            line: 0,
        })
    })

    it("shoud return minus token for -", () => {
        let scanner = new Scanner('-')
        let num_token = scanner.scan()
        expect(num_token).toMatchObject({
            lexeme: "-",
            token: Scanner.MINUS,
            line: 0,
        })
    })

    it("shoud return plus token for +", () => {
        let scanner = new Scanner('+')
        let plus_token = scanner.scan()
        expect(plus_token).toMatchObject({
            lexeme: "+",
            token: Scanner.PLUS,
            line: 0,
        })
    })

    it("shoud return semicolon token for ;", () => {
        let scanner = new Scanner(';')
        let semicolon_token = scanner.scan()
        expect(semicolon_token).toMatchObject({
            lexeme: ";",
            token: Scanner.SEMICOLON,
            line: 0,
        })
    })

    it("shoud return star token for *", () => {
        let scanner = new Scanner('*')
        let star_token = scanner.scan()
        expect(star_token).toMatchObject({
            lexeme: "*",
            token: Scanner.START,
            line: 0,
        })
    })
```
the newly added cases should all fail and we can add more case in the switch statement of function scan
```js
  case ')':
                    this.current += 1
                    return this.makeToken("" + c, Scanner.RIGHT_PAREN, this.line)
                case '{':
                    this.current += 1
                    return this.makeToken("" + c, Scanner.LEFT_BRACE, this.line)

                case '}':
                    this.current += 1
                    return this.makeToken("" + c, Scanner.RIGHT_BRACE, this.line)
                case ',':
                    this.current += 1
                    return this.makeToken("" + c, Scanner.COMMA, this.line)
                case '.':
                    this.current += 1
                    return this.makeToken("" + c, Scanner.DOT, this.line)
                case '-':
                    this.current += 1
                    return this.makeToken("" + c, Scanner.MINUS, this.line)
                case '+':
                    this.current += 1
                    return this.makeToken("" + c, Scanner.PLUS, this.line)
                case ';':
                    this.current += 1
                    return this.makeToken("" + c, Scanner.SEMICOLON, this.line)
                case '*':
                    this.current += 1
                    return this.makeToken("" + c, Scanner.START, this.line)

```
save the changes and we can see all the tests are passed.
