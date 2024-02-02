any programming language supports string literals. string is any characters locate between two quotes like "hello", "world", let's see how can we do string lexing.
first let's add a test case like this:
```js
describe("Testing string and number literals", () => {
    it("should return string token for chars in double quotes", () => {
        let scanner = new Scanner("\"this is a string\"")
        let string_token = scanner.scan()
        expect(string_token).toMatchObject({
            lexeme: "this is a string",
            token: Scanner.STRING,
            line: 0,
        })
    })
})
```
run "npm test" and make sure the newly added test fail, then we add code in token.js to make it pass, we will add a new case in switch like this:
```js
case '"':
    char = ""
    //past first "
    this.current += 1
    while (this.peek() != '\0' && this.peek() != '"') {
       char += this.peek()
     }
     //pass second "
     this.current += 1
     return this.makeToken(char, Scanner.STRING, this.line)
```
in the above code, when we first encouter a quote, we will in string handling situation. we group any characters after the first quote and before the second quote as lexeme and 
return a new token object with type STRING. run the test again and you will see the newly add test case can be pass.

when scanning string, we need to handle some corn cases, one of them is unterminated string which is we only have the first quote but not the second quote like "hello. Such string is 
a kind of error, when we have them we need to construct a error token, add a second test case like this:
```js
it("should return error token for unterminated string", () => {
        let scanner = new Scanner("\"this is a string")
        let error_token = scanner.scan()
        expect(error_token).toMatchObject({
            lexeme: "unterminated string",
            token: Scanner.ERROR,
            line: 0,
        })
    })
```
make sure the case is failed and go to token.js, we first add a new token type:
```js
static ERROR = 48;
```
then in the switch case, we refine our code like this:
```js
case '"':
    char = ""
    //past first "
    this.current += 1
    while (this.peek() != '\0' && this.peek() != '"') {
       char += this.peek()
     }
     if (this.peek() != '"') {
         return this.makeToken("unterminated string", Scanner.ERROR, 0)
     }
     //pass second "
     this.current += 1
     return this.makeToken(char, Scanner.STRING, this.line)
```
in above code, we check whether there is a second quote otherwise we return a error token, run "npm test" again and make sure the second test case can be passed. In final case, we need
to consider newlines in string, for example "\n\nhello \nworld!", there are three newlines in it, our scanner need to count the line number correctly, 
add a new test case for it like following:
```js
it("should count newlines in string", () => {
        let scanner = new Scanner("\"\n\nthis \nis string\"")
        let string_token = scanner.scan()
        expect(scanner.line).toEqual(3)
    })
```
run "npm test" and make sure the third test case can be failed. Now switch to token.js let's add code to count the newlines:
```
 case '"':
                    char = ""
                    //past first "
                    this.current += 1
                    while (this.peek() != '\0' && this.peek() != '"') {
                        //count newlines
                        if (this.peek() === '\n') {
                            this.line += 1
                        } else {
                            char += this.peek()
                        }
                        this.current += 1
                    }
                    if (this.peek() != '"') {
                        return this.makeToken("unterminated string", Scanner.ERROR, 0)
                    }
                    //pass second "
                    this.current += 1
                    return this.makeToken(char, Scanner.STRING, this.line)
```
in the while loop, we check current character is '\n' or not, if it is, we increase the line counter, run "npm test" and make sure the third test case can be passed.

Now let's see how we can scan number literals. Numbers are like such kind of strings: 1234, 12.34, in order to simplify things a little bit, we give up leading or trailing decimal
point, so we will deem .1234, 1234. are invalid. Let's add a test case for number:
```js
it("should return number token for number without decimal point", () => {
        let scanner = new Scanner("1234")
        let num_token = scanner.scan()
        expect(num_token).toMatchObject({
            lexeme: "1234",
            token: Scanner.NUMBER,
            line: 0,
        })
    })
```
run "npm test" and make sure it fail, let's add code to make it pass, this time we handle it directly in the default branch, first we add one helper function that is to check whether 
currenct character is number:
```js
isDigit =(c)=> {
        return c >= '0' && c <= '9'
    }

```
in default branch, we add code like this:
```
default:
                    if (this.isDigit(this.peek())) {
                        char = ""
                        while (this.isDigit(this.peek())) {
                            char += this.peek()
                            this.current += 1
                        }
                        return this.makeToken(char, Scanner.NUMBER, this.line)
                    }
```
in above code, if the current character is a digit, we keep collecting following characters if they are still digit until we found a no-digit character and group all digit characters as
lexeme and return a number token, run "npm test" and make sure the test case can be passed. Now we add a test case for float number like 12.34:
```js
 it("should return number token for float number string", () => {
        let scanner = new Scanner("12.34")
        let num_token = scanner.scan()
        expect(num_token).toMatchObject({
            lexeme: "12.34",
            token: Scanner.NUMBER,
            line: 0,
        })
    })
```
make sure the test case failed. In order to pass the case, we need to add a new helper function which is to peek the next character:
```js
peekNext = () => {
        if (this.current + 1 >= this.source.length) {
            return '\0'
        }
        return this.source[this.current + 1]
    }
```
now we refine the number checking logit above like following:
```js
 if (this.isDigit(this.peek())) {
                        char = ""
                        while (this.isDigit(this.peek())) {
                            char += this.peek()
                            this.current += 1
                        }
                        //consume the decimal point
                        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
                            char += "."
                            this.current += 1
                        }
                        while (this.isDigit(this.peek())) {
                            char += this.peek()
                            this.current += 1
                        }
                        return this.makeToken(char, Scanner.NUMBER, this.line)
                    }
```
now run "npm test" and make sure the test case can be passed.  Let's report error for leading decimal point like ".1234", add a test case: 
```js
it("should return error token for number string with leading decimal point", () => {
        let scanner = new Scanner(".1234")
        let error_token = scanner.scan()
        expect(error_token).toMatchObject({
            lexeme: "leading decimal number string",
            token: Scanner.ERROR,
            line: 0,
        })
    })
```
make sure the test case is failed, now we add code to handle it:
```js
case '.':
                    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
                        return this.makeToken("leading decimal number string",
                            Scanner.ERROR, this.line)
                    } else {
                        this.current += 1
                        return this.makeToken("" + c, Scanner.DOT, this.line)
                    }
    
```
make sure the newly add test case can be passed. Finally let's handle trailing decimal point string like "1234.", add a test case for it:
```js
 it("should return error token for number string with trailing decimal", () => {
        let scanner = new Scanner("1234.")
        let error_token = scanner.scan()
        expect(error_token).toMatchObject({
            lexeme: "trailing decimal number string",
            token: Scanner.ERROR,
            line: 0,
        })
    })
```
make sure the test case is failed. Now we add code to make it passed:
```
default:
if (this.isDigit(this.peek())) {
...
  if (this.peek() === '.') {
                            return this.makeToken("trailing decimal number string", Scanner.ERROR, this.line)
                        }
                        return this.makeToken(char, Scanner.NUMBER, this.line)
}
```
make sure the newly add test case can be passed, congratulation! You have done a great job!

Now let's see how to lex identifier and keyword, they are a liitle bit tricky. keyword has special meaning in programming language, they are used to define variable or construct control blocks, key words can only composited by alphabet, and identifers can composited by alphabet, number and some special character, let's see how we can construct tokens for keyword and identifiers.

first we add a static value for identifier:
```js
static IDENTIFIER = 46
```
second we add two helper functions, one or checking character is alpha, one for checking alpha or number:
```js
 isAlpha = (c) => {
        return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_'
    }

    isAlphaNumberic = (c) => {
        return this.isAlpha(c) || this.isDigit(c)
    }
```
and we handle lexing of identifer first. Identifier should start with alpha and following by alpha, number or underscore, such as b_123,
timer_counter, it can't start by underscore or number, let's add the first test case for identifer:
```js
describe("Testing identifer and keyword", () => {
    it("should return identifier token for any \
    string contains only alpha and without double quotes", () => {
        let scanner = new Scanner("counter")
        let id_token = scanner.scan()
        expect(id_token).toMatchObject({
            lexeme: "counter",
            token: Scanner.IDENTIFIER,
            line: 0,
        })
    })
})
```
run "npm test" and make sure it failed. Then we add code to make it passed:
```js
if (this.isDigit(this.peek())) {
...} else (this.isAlpha(c)) {
 char = ""
                        while (this.isAlphaNumberic(this.peek())) {
                            char += this.peek()
                            this.current += 1
                        }
                        return this.makeToken(char, Scanner.IDENTIFIER, this.line)
}
```
in the above code, if we encounter the first alpha, then we check following char is alpha or number or undersocore, if it is, we group them together as a unit and return them as a identifier token, run test again and make sure the test case can be passed. We continue to add
new test case for identifer token, first we need to make sure any string that start with alpha, and follow with alpha, number and underscore can be lexed as identifier token:
```js
 it("should return identifier token for any \
    string begin with underscore, and follow by alpha , number or underscore", () => {
        let scanner = new Scanner("_counter_timer_123")
        let id_token = scanner.scan()
        expect(id_token).toMatchObject({
            lexeme: "_counter_timer_123",
            token: Scanner.IDENTIFIER,
            line: 0,
        })
    })
```
this test case should be passed because we already statisfy it by our code, now we need to check the error cases, if a string start with number and follow with any characters that are not digit, we should return error token for such string, add the following test case:
```js
 it("should return error token for string start with number and \
    follow with characters that are not digit", () => {
        let scanner = new Scanner("123_abc")
        let error_token = scanner.scan()
        expect(error_token).toMatchObject({
            lexeme: "illegal char in number string:_",
            token: Scanner.ERROR,
            line: 0,
        })
    })
```
now we need to modify code that recoginze number for this case to pass:
```js
if (this.isDigit(this.peek())) {
 ...
 if (this.peek() !== '\0') {
                            return this.makeToken(`illegal char in number string:${this.peek()}`,
                                Scanner.ERROR, this.line)
                        }
                        return this.makeToken(char, Scanner.NUMBER, this.line)
}
```
in above code, if we go into number checking state, the scanner will only accept digit and '.', if it see any characters that are other than these two, it will report error. Now we are done with identifiers now.

Let‘s see how can we handle key words, key words are a little subset of identifiers, they are special string for special purpose, let's add a key word test case first:
```js
it("should return token LET for key word let", () => {
        let scanner = new Scanner("let")
        let let_token = scanner.scan()
        expect(let_token).toMatchObject({
            lexeme: "let",
            token: Scanner.LET,
            line: 0,
        })
    })
```
run "npm test" make sure the case can be failed. Now let's add code to handle it, key word is special case for identifier, we will save all key words into a map, when a string is recognize as identifier, then we look into the keyword map, if the string is saved in the map, then we set it as key word token, otherwise we set it as identifier, let's add a map object in token.js:
```js
initKeywords = ()=> {
        this.key_words = {
            "let": Scanner.LET,
        }
    }

    constructor(source) {
        this.source = source
        this.current = 0
        this.line = 0
        this.initKeywords()
    }
```
then when we get recognize an identifier, we check whether it is in key word map or not, if it is, then we return it as key word token:
```js
else if (this.isAlpha(this.peek())) {
                        char = ""
                        while (this.isAlphaNumberic(this.peek())) {
                            char += this.peek()
                            this.current += 1
                        }
                        if (this.key_words[char]) {
                            return this.makeToken(char, this.key_words[char], this.line)
                        }
                        return this.makeToken(char, Scanner.IDENTIFIER, this.line)
                    }
```
now run the test again and make sure it can passed, we now can add all test cases for key words:
```js
it("should return token AND for key word and", () => {
        let scanner = new Scanner("and")
        let and_token = scanner.scan()
        expect(and_token).toMatchObject({
            lexeme: "and",
            token: Scanner.AND,
            line: 0,
        })
    })

    it("should return token CLASS for key word class", () => {
        let scanner = new Scanner("class")
        let keyword_token = scanner.scan()
        expect(keyword_token).toMatchObject({
            lexeme: "class",
            token: Scanner.CLASS,
            line: 0,
        })
    })

    it("should return token IF for key word if", () => {
        let scanner = new Scanner("if")
        let keyword_token = scanner.scan()
        expect(keyword_token).toMatchObject({
            lexeme: "if",
            token: Scanner.IF,
            line: 0,
        })
    })

    it("should return token ELSE for key word ELSE", () => {
        let scanner = new Scanner("else")
        let keyword_token = scanner.scan()
        expect(keyword_token).toMatchObject({
            lexeme: "else",
            token: Scanner.ELSE,
            line: 0,
        })
    })

    it("should return token TRUE for key word true", () => {
        let scanner = new Scanner("true")
        let keyword_token = scanner.scan()
        expect(keyword_token).toMatchObject({
            lexeme: "true",
            token: Scanner.TRUE,
            line: 0,
        })
    })

    it("should return token FALSE for key word false", () => {
        let scanner = new Scanner("false")
        let keyword_token = scanner.scan()
        expect(keyword_token).toMatchObject({
            lexeme: "false",
            token: Scanner.FALSE,
            line: 0,
        })
    })

    it("should return token FOR for key word for", () => {
        let scanner = new Scanner("for")
        let keyword_token = scanner.scan()
        expect(keyword_token).toMatchObject({
            lexeme: "for",
            token: Scanner.CLASS,
            line: 0,
        })
    })

    it("should return token WHILE for key word while", () => {
        let scanner = new Scanner("while")
        let keyword_token = scanner.scan()
        expect(keyword_token).toMatchObject({
            lexeme: "while",
            token: Scanner.WHILE,
            line: 0,
        })
    })

    it("should return token FUNC for key word func", () => {
        let scanner = new Scanner("func")
        let keyword_token = scanner.scan()
        expect(keyword_token).toMatchObject({
            lexeme: "func",
            token: Scanner.FUNC,
            line: 0,
        })
    })

    it("should return token NIL for key word nil", () => {
        let scanner = new Scanner("nil")
        let keyword_token = scanner.scan()
        expect(keyword_token).toMatchObject({
            lexeme: "nil",
            token: Scanner.NIL,
            line: 0,
        })
    })

    it("should return token PRINT for key word print", () => {
        let scanner = new Scanner("print")
        let keyword_token = scanner.scan()
        expect(keyword_token).toMatchObject({
            lexeme: "print",
            token: Scanner.PRINT,
            line: 0,
        })
    })

    it("should return token RETURN for key word return", () => {
        let scanner = new Scanner("return")
        let keyword_token = scanner.scan()
        expect(keyword_token).toMatchObject({
            lexeme: "return",
            token: Scanner.RETURN,
            line: 0,
        })
    })

    it("should return token SUPER for key word super", () => {
        let scanner = new Scanner("super")
        let keyword_token = scanner.scan()
        expect(keyword_token).toMatchObject({
            lexeme: "super",
            token: Scanner.SUPER,
            line: 0,
        })
    })

    it("should return token THIS for key word this", () => {
        let scanner = new Scanner("this")
        let keyword_token = scanner.scan()
        expect(keyword_token).toMatchObject({
            lexeme: "this",
            token: Scanner.THIS,
            line: 0,
        })
    })

    it("should return token VAR for key word var", () => {
        let scanner = new Scanner("var")
        let keyword_token = scanner.scan()
        expect(keyword_token).toMatchObject({
            lexeme: "var",
            token: Scanner.VAR,
            line: 0,
        })
    })
```
now we can add those key words to map and make all those cases can passed:
```js
 initKeywords = () => {
        this.key_words = {
            "let": Scanner.LET,
            "and": Scanner.AND,
            "class": Scanner.CLASS,
            "if": Scanner.IF,
            "else": Scanner.ELSE,
            "true": Scanner.TRUE,
            "false": Scanner.FALSE,
            "for": Scanner.FOR,
            "while": Scanner.WHILE,
            "func": Scanner.FUNC,
            "nil": Scanner.NIL,
            "print": Scanner.PRINT,
            "return": Scanner.RETURN,
            "super": Scanner.SUPER,
            "this": Scanner.THIS,
            "var": Scanner.VAR,
        }
    }

```
after completing above code, make sure all test cases can be passed, that's all about how we handling key words.
