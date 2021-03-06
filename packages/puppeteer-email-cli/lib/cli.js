#!/usr/bin/env node
'use strict'

const program = require('commander')

const PuppeteerEmail = require('puppeteer-email')

const { version } = require('../package')

module.exports = (argv) => {
  program
    .version(version)
    .option('-u, --username <username>', 'email account username')
    .option('-p, --password <password>', 'email account password')
    .option('-e, --email <email>', 'email account address (overrides username and provider)')
    .option('-P, --provider <provider>', 'email provider', /^(outlook)$/, 'outlook')
    .option('-H, --no-headless', '(puppeteer) disable headless mode')
    .option('-s, --slow-mo <timeout>', '(puppeteer) slows down operations by the given ms', parseInt, 0)

  program
    .command('signup')
    .option('-n, --first-name <name>', 'user first name')
    .option('-l, --last-name <name>', 'user last name')
    .option('-b, --birthday <date>', 'user birthday (month/day/year); eg 9/20/1986')
    .action(async (opts) => {
      try {
        const client = new PuppeteerEmail(program.email || program.provider)

        const user = {
          username: program.username,
          password: program.password,
          firstName: opts.firstName,
          lastName: opts.lastName
        }

        if (opts.birthday) {
          const [ month, day, year ] = opts.birthday
          user.birthday = { month, day, year }
        }

        const session = await client.signup(user, {
          puppeteer: {
            headless: !!program.headless,
            slowMo: program.slowMo
          }
        })

        await session.close()

        user.email = session.email
        console.log(JSON.stringify(user, null, 2))
      } catch (err) {
        console.error(err)
        process.exit(1)
      }
    })

  program
    .command('signin')
    .action(async () => {
      try {
        const client = new PuppeteerEmail(program.email || program.provider)

        const user = {
          username: program.username,
          password: program.password
        }

        if (!user.username || !user.username.length) {
          throw new Error('missing required "username"')
        }

        if (!user.password || !user.password.length) {
          throw new Error('missing required "password"')
        }

        const session = await client.signin(user, {
          puppeteer: {
            headless: !!program.headless,
            slowMo: program.slowMo
          }
        })

        await session.close()

        console.log(session.email)
      } catch (err) {
        console.error(err)
        process.exit(1)
      }
    })

  program
    .command('get-emails')
    .option('-q, --query <string>', 'query string to filter emails')
    .action(async (opts) => {
      try {
        const client = new PuppeteerEmail(program.email || program.provider)

        const user = {
          username: program.username,
          password: program.password
        }

        if (!user.username || !user.username.length) {
          throw new Error('missing required "username"')
        }

        if (!user.password || !user.password.length) {
          throw new Error('missing required "password"')
        }

        if (!opts.query || !opts.query.length) {
          throw new Error('missing required "query"')
        }

        const session = await client.signin(user, {
          puppeteer: {
            headless: !!program.headless,
            slowMo: program.slowMo
          }
        })

        const emails = await session.getEmails({
          query: opts.query
        })

        await session.close()

        console.log(JSON.stringify(emails, null, 2))
      } catch (err) {
        console.error(err)
        process.exit(1)
      }
    })

  program.parse(argv)
}

module.exports(process.argv)
