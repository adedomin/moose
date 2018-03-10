/*
 * Copyright (C) 2017  Anthony DeDominic <adedomin@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var Irc = require('irc-framework'),
    colors = require('irc-colors'),
    output = require('./moose-res').output,
    antispam = require('./irc-antispam'),
    config = require(process.env.CONFIG_PATH).irc,
    mooseParse = /^[.!]?moose(?:me)? (-[^ ]*)? ?(.*)$/

// functions to prevent spam
var helpSpam = antispam(10000),
    mooseSearchSpam = antispam(2000),
    mooseHelpSpam = antispam(2000),
    moosePleaseWaitSpam = antispam(10000)

module.exports = (moosedb, logger) => {
    if (!config || config.disabled) return

    var irc = new Irc.Client()

    irc.on('registered', () => {
        logger.debug('IRC CONN STARTED')
        if (config.nickserv_pass)
            irc.say('NickServ', `IDENTIFY ${config.nickserv_pass}`)

        config.channels.forEach(channel => irc.join(channel))
    })

    irc.on('invite', event => {
        irc.join(event.channel)
    })

    irc.matchMessage(/^[.!](bots|help)/, event => {
        if (helpSpam(event.target)) return
        event.reply(
            `NeoMoose [JavaScript|NodeJS] :: Make moose @ ${config.moose_url || 'https://moose.ghetty.space'} :: See .moose --help for usage`
        )
    })

    irc.matchMessage(/^[.!]source/, event => {
        if (helpSpam(event.target)) return
        event.reply(
            'NeoMoose [JavaScript|NodeJS] :: Source https://github.com/adedomin/neomoose'
        )
    })

    // function() usage to get this context of irc object
    irc.matchMessage(/^[.!]?moose(?:me)?\b/, function(event) {
        var parse = event.message
            .match(mooseParse)
        if (!parse) parse = ['', '--random', '']

        var arg = parse[1],
            query = parse[2]

        if (arg == '--latest' ||
            arg == '-l' ||
            query == 'latest'
        ) {
            if (this.mooseLock) {
                if (moosePleaseWaitSpam(event.nick)) return
                return irc.notice(event.nick, 'Please Wait for the Current Moose to finish')
            }
            this.mooseLock = true
            moosedb.getLatest((err, moose) => {
                if (err) {
                    this.mooseLock = false
                    return event.reply('Unknown error getting latest moose')
                }
                output(moose, event, true, () => this.mooseLock = false)
            })
        }
        else if (arg == '--random' ||
            arg == '-r' ||
            query == 'random'
        ) {
            if (this.mooseLock) {
                if (moosePleaseWaitSpam(event.nick)) return
                return irc.notice(event.nick, 'Please Wait for the Current Moose to finish')
            }
            this.mooseLock = true
            moosedb.getRandom((err, moose) => {
                if (err) {
                    this.mooseLock = false
                    return event.reply('Unknown error getting latest moose')
                }
                output(moose, event, true, () => this.mooseLock = false)
            })
        }
        else if (arg == '--search' || arg == '-s') {
            if (mooseSearchSpam(event.target)) return
            if (!query)
                return event.reply('usage: --search query')
            moosedb.getGallery(query, 0, -1, (err, meese) => {
                if (err || !meese || !meese.length) {
                    return event.reply(`No moose found containing ${colors.bold(query)}`)
                }
                event.reply(
                    meese.map(moose => colors.bold(moose.name)).join(' - ')
                )
            })
        }
        else if (arg == '--') {
            if (this.mooseLock) {
                if (moosePleaseWaitSpam(event.nick)) return
                return irc.notice(event.nick, 'Please Wait for the Current Moose to finish')
            }
            this.mooseLock = true
            moosedb.getMoose(query, (err, moose) => {
                if (err) {
                    this.mooseLock = false
                    return event.reply(`No such moose ${colors.bold(query)}`)
                }
                output(moose, event, false, () => this.mooseLock = false)
            })
        }
        else if (arg == '--help' || arg == '-h' || !query) {
            if (mooseHelpSpam(event.target)) return
            event.reply('usage: ^[.!]?moose(me)? [--latest|--random|--search|--] moosename')
            event.reply(`Make moose @ ${config.moose_url || 'https://moose.ghetty.space'}`)
        }
        else if (arg) {
            if (mooseHelpSpam(event.target)) return
            event.reply(`invalid argument: ${arg}`)
            event.reply('usage: [.!]*moose [--latest|--random] moosename')
        }
        else {
            if (this.mooseLock) {
                if (moosePleaseWaitSpam(event.nick)) return
                return irc.notice(event.nick, 'Please Wait for the Current Moose to finish')
            }
            this.mooseLock = true
            moosedb.getMoose(query, (err, moose) => {
                if (err) {
                    this.mooseLock = false
                    return event.reply(`No such moose ${colors.bold(query)}`)
                }
                output(moose, event, false, () => this.mooseLock = false)
            })
        }
    })

    irc.on('join', event => {
        if (event.nick == config.nick)
            logger.debug(`IRC JOIN ${event.channel}`)
    })
    
    irc.on('part', event => {
        if (event.nick == config.nick)
            logger.info(`IRC PART ${event.channel}`)
    })

    irc.on('kick', event => {
        if (event.kicked == config.nick)
            logger.info(`IRC KICK ${event.channel}`, { 
                err: `${event.nick} [${event.message}]`,
            })
    })

    irc.on('close', () => {
        logger.error('IRC CLOSE', { err: 'unable to reconnect' })
    })

    irc.on('socket close', () => {
        logger.error('IRC CLOSE', { err: 'flood kick' })
    })

    irc.connect({
        host: config.server, 
        nick: config.nick, 
        port: config.port,
        tls: config.tls,
    })
}
