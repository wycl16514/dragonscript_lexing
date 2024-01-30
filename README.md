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
