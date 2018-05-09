'use strict'

const ow = require('ow')

const PuppeteerEmailProvider = require('puppeteer-email-provider')
const PuppeteerEmailSession = require('puppeteer-email-session')

const signup = require('./lib/signup')
const signin = require('./lib/signin')
const signout = require('./lib/signout')
const sendEmail = require('./lib/send-email')
const getEmails = require('./lib/get-emails')

class PuppeteerEmailProviderOutlook extends PuppeteerEmailProvider {
  get name () {
    return 'outlook'
  }

  async signup (user, opts = { }) {
    ow(user, ow.object.plain.nonEmpty)
    ow(user.username, ow.string.nonEmpty)
    ow(user.password, ow.string.nonEmpty)
    ow(opts, ow.object.nonEmpty)
    ow(opts.browser, ow.object.nonEmpty)

    await signup(user, opts)

    return new PuppeteerEmailSession({
      user: {
        username: user.username,
        email: `${user.username}@outlook.com`
      },
      browser: opts.browser,
      provider: this
    })
  }

  async signin (user, opts) {
    ow(user, ow.object.plain.nonEmpty)
    ow(user.username, ow.string.nonEmpty)
    ow(user.password, ow.string.nonEmpty)
    ow(opts, ow.object.nonEmpty)
    ow(opts.browser, ow.object.nonEmpty)

    await signin(user, opts)

    return new PuppeteerEmailSession({
      user: {
        username: user.username,
        email: `${user.username}@outlook.com`
      },
      browser: opts.browser,
      provider: this
    })
  }

  async signout (session) {
    ow(session, ow.instanceOf(PuppeteerEmailSession))

    return signout({
      browser: session.browser
    })
  }

  async sendEmail (session, email, opts = { }) {
    ow(session, ow.instanceOf(PuppeteerEmailSession))
    ow(email, ow.object)
    ow(opts, ow.object.plain)

    return sendEmail(email, {
      browser: session.browser,
      ...opts
    })
  }

  async getEmails (session, opts = { }) {
    ow(session, ow.instanceOf(PuppeteerEmailSession))
    ow(opts, ow.object.plain)

    return getEmails({
      browser: session.browser,
      ...opts
    })
  }
}

module.exports = PuppeteerEmailProviderOutlook