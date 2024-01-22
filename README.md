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

