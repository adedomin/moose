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
    config = require(process.env.CONFIG_PATH).irc,
    mooseLock = false

var mooseColor = {
    t: () => '',
    0: colors.white,
    1: colors.black,
    2: colors.navy,
    3: colors.green,
    4: colors.red,
    5: colors.brown,
    6: colors.purple,
    7: colors.olive,
    8: colors.yellow,
    9: colors.lime,
    a: colors.teal,
    b: colors.cyan,
    c: colors.blue,
    d: colors.pink,
    e: colors.gray,
    f: colors.silver,
}

var mooseShade = {
    t: '',
    0: '░',
    1: '▒',
    2: '▓',
    3: '█',
    4: '▓',
    5: '▒',
    6: '░',
}

function sendMoose(moose, cb) {
    moose.images.split('\n').forEach((part, ind) => {
        part.split('').forEach
    })
}

module.exports = (moosedb, logger) => {
    if (!config || config.disabled) return

    var irc = new Irc.Client()

    irc.on('error', (msg) => {
        logger.error('IRC error', { err: msg.toString() })
    })

    irc.on('registered', () => {
        if (config.nickserv_pass)
            irc.say('NickServ', `IDENTIFY ${config.irc.nickserv_pass}`)

        config.irc.channels.forEach(irc.join.bind(irc))
    })

    irc.matchMessage(/^[.!](bots|help)/, (event) => {
        event.reply('neomoose [JavaScript|NodeJS] :: usage: .moose [--latest|--random|--search] moosename')
    })

    irc.matchMessage(/^[.!]*moose/, (event) => {
        if (mooseLock) 
            return irc.notice(event.nick, 'Please Wait for the Current Moose to finish')
        
        var parse = event.message
            .match(/^moose (-[^ ]*)? ?(.*)/)
        var arg = parse[1],
            query = parse[2]

        else if (arg == '--search' || arg == '-s') {
        }
        else if (arg == '--no-shade' || arg == '-n') {
        }
        else if (arg == '--') {
        }
        else if (arg) {
            event.reply('invalid command')
        }
        else {
        }
    })

    irc.connect({
        host: config.server, 
        nick: config.nick, 
        port: config.port,
        tls: config.tls,
    })
}
