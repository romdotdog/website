import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { AlreadyAuthenticatedException } from './errors'
import { login } from './lib'
import chalk from 'chalk'
import open from 'open'

/**
 * The main Command Line Interface.
 * @module cli
 */

yargs(hideBin(process.argv))
    .scriptName('aspkg')
    .usage('Usage: $0 <command> [options]')
    .command('publish', 'Publish the package')
    .command(
        'login',
        'Log in to the registry',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
        async () => {
            try {
                await login((code, url) => {
                    open(url)

                    console.log(`Enter the following code in your newly opened browser:\n\n${chalk.bold(code)}\n`)
                    console.log(chalk.red.bold`If your browser didn't open: `)
                    console.log('Head over to ' + chalk.blueBright.bold(url) + '\n')
                })

                console.log(chalk.greenBright`You're now logged in!`)
            } catch (e) {
                if (e instanceof AlreadyAuthenticatedException) {
                    console.log(chalk.green`You're already authenticated!`)
                    console.log('use ' + chalk.blueBright.bold`aspkg logout` + ' to log out of your current session.')
                } else {
                    console.log(chalk.bold.red(e))
                }
            }
        }
    )
    .command('logout', 'Log out of the registry')
    .help().argv
