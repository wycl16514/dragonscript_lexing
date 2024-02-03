Lot's of programming language has REPL, for example when you type in "python" in your console(make sure you have installed python on you machine), the console will enter REPL state, 
you can input one line of code and hit enter, then python intepreter will execute that line you input. 

Here we will use react js to emulate a console, and we will support a lexing command in the console, first we install the console component:
```js
npm i react-console-emulator
```
then create a new folder name "components", and create a new file named terminal.jsx, we will add the console eumlator in this file, add the following code to terminal.jsx:
```js
import React, { useState } from "react";
import Terminal from 'react-console-emulator'

const TerminalEmulator = () => {
    const commands = {
        lexing: {
            description: 'lexing a passed string.',
            usage: 'lexing <string>',
            fn: (...args) => {
                return `lexing for ${args.join(' ')}`
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
in the code, we create a command named lexing for the console, when user input lexing with some strings behide it and hit enter, the function for key fn is executed, and the strings 
behide the lexing command is sent to the function for execution. Open App.js, remove all content in it and add following code:
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
Now run "npm start" in your console, you will see a console in the web page, enter following command into the console and hit return:
```js
lexing let counter = 123;
```
you will see the following result:
<img width="532" alt="截屏2024-02-03 13 38 15" src="https://github.com/wycl16514/dragonscript_lexing/assets/7506958/2db27427-7338-4985-83ca-7eb51da7e77b">

let's bring our scanner into console emulator, add the following code:
```
import Terminal from 'react-console-emulator'
import Scanner from '../../compiler/scanner/token'

const TerminalEmulator = () => {
    const printToken = (token) => {
        return `token object: \n{
            lexeme: "${token.lexeme}",
            token: ${token.token},
            line: ${token.line}
        }\n`
    }
    const commands = {
        lexing: {
            description: 'lexing a passed string.',
            usage: 'lexing <string>',
            fn: (...args) => {
                const scanner = new Scanner(args.join(' '))
                let exe_result = ''
                while (true) {
                    const token_obj = scanner.scan()
                    if (token_obj.token !== Scanner.EOF) {
                        exe_result += printToken(token_obj)
                    }


                    if (token_obj.token === Scanner.EOF) {
                        break
                    }
                }

                return exe_result
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
now enter the same command in the console and hit enter you will see following:
<img width="459" alt="截屏2024-02-03 13 53 17" src="https://github.com/wycl16514/dragonscript_lexing/assets/7506958/40cb2786-07e1-4f2a-a0f5-5422d7699c5e">

