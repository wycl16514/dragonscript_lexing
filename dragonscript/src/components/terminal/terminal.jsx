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