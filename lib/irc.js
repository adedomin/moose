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
    reladate = require('relative-date'),
    config = require(process.env.CONFIG_PATH).irc,
    mooseLock = false,
    moosedb,
    logger

var mooseColor = {
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
    0: '░',
    1: '▒',
    2: '▓',
    3: '█',
    4: '▓',
    5: '▒',
    6: '░',
}

function mooseLine(line, shade) {
    return line.split('').map((char, ind) => {
        if (char == 't') 
            return ' '
        if (!shade || shade.length < 1 || +shade[ind] == 3)
            return mooseColor[char](mooseShade['3'])
        else if (+shade[ind] == 3) {
            return mooseColor[char](mooseShade['3'])
        }
        else if (+shade[ind] < 3) {
            return mooseColor[char].bgwhite(mooseShade[shade[ind]])
        }
        else {
            return mooseColor[char].bgblack(mooseShade[shade[ind]])
        }
    }).join('')
}

function mooseTrimTransparent(orlines) {
    // copy arr
    var lines = orlines.slice()
    // top down
    var tline = /^t*$/

    var filtered = false
    // top down
    lines = lines.filter(line => {
        if (tline.test(line) && !filtered)
            return false
        filtered = true
        return true
    })

    filtered = false
    // bottom up
    lines = lines.slice().reverse().filter(line => {
        if (tline.test(line) && !filtered)
            return false

        filtered = true
        return true
    }).reverse()

    // empty moose
    if (lines.length < 1) 
        return lines

    // left to right
    var substr = 0
    for (var i=0; i<lines[0].length; i++) {
        if (lines.reduce((acc, line) => {
            return line[i] == 't' && acc
        }, true)) {
            substr++
        }
        else {
            break
        }
    } 

    // trim all moose by substr
    if (substr > 0) {
        lines = lines.map(line => {
            return line.substring(substr)
        })
    }

    // right left
    substr = 0
    for (i=lines[0].length-1; i>-1; i--) {
        if (lines.reduce((acc, line) => {
            return line[i] == 't' && acc
        }, true)) {
            substr++
        }
        else {
            break
        }
    }

    if (substr > 0) {
        lines = lines.map(line => {
            return line.substring(0, line.length - substr)
        })
    }

    return lines
}

function sendMoose(moose, event, unknownName) {
    var curr = 0,
        image = mooseTrimTransparent(moose.image.split('\n')),
        shade
    if (moose.shaded) 
        shade = mooseTrimTransparent(moose.shade.split('\n'))
    else
        shade = []

    function next() {
        if (!(curr < image.length)) {
            if (unknownName) {
                event.reply(
                    `${colors.bold(moose.name)} - Created ${reladate(moose.created)}`
                )
            }
            else {
                event.reply( 
                    `Created ${reladate(moose.created)}`
                )
            }
            mooseLock = false
            return
        }
        event.reply(mooseLine(image[curr], shade[curr]))
        curr++
        setTimeout(next.bind(this), config.send_delay)
    }
    next()
}

function getLatest(event) {
    sendMoose(moosedb.latest.res[0], event, true)
}

function getRandom(event) {
    moosedb.random((err, rand) => {
        if (err || !rand[0]) return event.reply('Unknown Error with Random')
        sendMoose(rand[0], event, true)
    })
}

function getMoose(query, event) {
    moosedb.findOne({ name: query }, (err, moose) => {
        if (err || !moose)
            return event.reply(
                `No Such Moose: ${colors.bold(query)}`
            )
        sendMoose(moose, event) 
    })       
}

function searchNameRegexp(name) {
    return new RegExp(name.replace(
        /[|\\{()[^$+*?.-]/g,
        '\\$&'
    ), 'i')
}

function getSearch(query, event) {
    if (!query)
        return event.reply('usage: --search query')

    moosedb.find({ 
        name: { $regex: searchNameRegexp(query)},
    }).sort({ created: -1 })
        .limit(12)
        .map(meese => colors.bold(meese.name))
        .exec((err, meese) => {
            event.reply(meese.join(' - '))
        })
}

module.exports = (moosedb_, logger_) => {
    if (!config || config.disabled) return

    moosedb = moosedb_
    logger = logger_

    var irc = new Irc.Client()

    irc.on('error', (msg) => {
        logger.error('IRC error', { err: msg.toString() })
    })

    irc.on('registered', () => {
        if (config.nickserv_pass)
            irc.say('NickServ', `IDENTIFY ${config.nickserv_pass}`)

        config.channels.forEach(channel => irc.join(channel))
    })

    irc.matchMessage(/^[.!](bots|help)/, (event) => {
        event.reply(
            `neomoose [JavaScript|NodeJS] :: Make moose @ ${config.moose_url || 'https://moose.ghetty.space'} :: See .moose --help for usage`
        )
    })

    irc.matchMessage(/^[.!]*moose/, (event) => {
        if (mooseLock) 
            return irc.notice(event.nick, 'Please Wait for the Current Moose to finish')
        
        var parse = event.message
            .match(/^[.!]*moose (-[^ ]*)? ?(.*)/)
        if (!parse) return

        var arg = parse[1],
            query = parse[2]

        if (arg == '--latest' || 
            arg == '-l' || 
            query == 'latest'
        ) {
            mooseLock = true
            getLatest(event)
        }
        else if (arg == '--random' ||
            arg == '-r' ||
            query == 'random'
        ) {
            mooseLock = true
            getRandom(event)
        }
        else if (arg == '--search' || arg == '-s') {
            getSearch(query, event)
        }
        else if (arg == '--') {
            mooseLock = true
            getMoose(query, event)
        }
        else if (arg == '--help' || arg == '-h') {
            event.reply('usage: [.!]*moose [--latest|--random|--search|--] moosename')
            event.reply(`Make moose @ ${config.moose_url || 'https://moose.ghetty.space'}`)
        }
        else if (arg) {
            event.reply(`invalid argument: ${arg}`)
            event.reply('usage: [.!]*moose [--latest|--random] moosename')
        }
        else {
            mooseLock = true
            getMoose(query, event)
        }
    })

    irc.connect({
        host: config.server, 
        nick: config.nick, 
        port: config.port,
        tls: config.tls,
    })
}
