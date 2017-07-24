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
    mooseParse = /^[.!]*moose(?:me)? (-[^ ]*)? ?(.*)/,
    moosedb,
    logger

var mooseColor = {
    0: 'white',
    1: 'black',
    2: 'navy',
    3: 'green',
    4: 'red',
    5: 'brown',
    6: 'purple',
    7: 'olive',
    8: 'yellow',
    9: 'lime',
    a: 'teal',
    b: 'cyan',
    c: 'blue',
    d: 'pink',
    e: 'gray',
    f: 'silver',
}

var mooseLightColorShade = {
    1: 'gray',
    2: 'blue',
    3: 'lime',
    5: 'white',
    6: 'white',
    7: 'yellow',
    a: 'cyan',
    e: 'silver',
    f: 'white',
}

var mooseDarkColorShade = {
    0: 'silver',
    4: 'brown',
    8: 'olive',
    9: 'green',
    b: 'teal',
    c: 'navy',
    d: 'purple',
    e: 'black',
    f: 'gray',
}

function lightColorPick (color,char,shadeChar) {
    var light
    switch (color) {
    case 'gray': light = colors[mooseColor[char]].bggray(shadeChar); break
    case 'blue': light = colors[mooseColor[char]].bgblue(shadeChar); break
    case 'lime': light = colors[mooseColor[char]].bglime(shadeChar); break
    case 'red': light = colors[mooseColor[char]].bgred(shadeChar); break
    case 'pink': light = colors[mooseColor[char]].bgpink(shadeChar); break
    case 'yellow': light = colors[mooseColor[char]].bgyellow(shadeChar); break
    case 'cyan': light = colors[mooseColor[char]].bgcyan(shadeChar); break
    case 'silver': light = colors[mooseColor[char]].bgsilver(shadeChar); break
    case 'white': light = colors[mooseColor[char]].bgwhite(shadeChar); break
    default: light = false
    }
    return light
}

function darkColorPick (color, char,shadeChar) {
    var dark
    switch (color) {
    case 'silver': dark = colors[mooseColor[char]].bgsilver(shadeChar); break
    case 'brown': dark = colors[mooseColor[char]].bgbrown(shadeChar); break
    case 'olive': dark = colors[mooseColor[char]].bgolive(shadeChar); break
    case 'green': dark = colors[mooseColor[char]].bggreen(shadeChar); break
    case 'teal': dark = colors[mooseColor[char]].bgteal(shadeChar); break
    case 'navy': dark = colors[mooseColor[char]].bgnavy(shadeChar); break
    case 'purple': dark = colors[mooseColor[char]].bgpurple(shadeChar); break
    case 'black': dark = colors[mooseColor[char]].bgblack(shadeChar); break
    case 'gray': dark = colors[mooseColor[char]].bggray(shadeChar); break
    default: dark = false
    }
    return dark
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
        if (char == 't' || !colors[mooseColor[char]]) 
            return ' '
        if (!shade || shade.length < 1 || +shade[ind] == 3)
            return colors[mooseColor[char]][`bg${mooseColor[char]}`](mooseShade['3'])
        else if (+shade[ind] == 3) {
            return colors[mooseColor[char]][`bg${mooseColor[char]}`](mooseShade['3'])
        }
        else if (+shade[ind] < 3) {
            if (mooseLightColorShade[char])
                return lightColorPick(mooseLightColorShade[char],char,mooseShade[shade[ind]])
            else
                return colors[mooseColor[char]].bgwhite(mooseShade[shade[ind]])
        }
        else {
            if (mooseDarkColorShade[char])
                return darkColorPick(mooseDarkColorShade[char],char,mooseShade[shade[ind]]) 
            else
                return colors[mooseColor[char]].bgblack(mooseShade[shade[ind]])
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
            setTimeout(() => mooseLock = false,
                config.moose_delay || 5000
            )
            return
        }
        event.reply(mooseLine(image[curr], shade[curr]))
        curr++
        setTimeout(next.bind(this), config.send_delay || 350)
    }
    next()
}

function getLatest(event) {
    sendMoose(moosedb.latest.res[0], event, true)
}

function getRandom(event) {
    moosedb.random((err, rand) => {
        if (err || !rand[0]) {
            mooseLock = false
            return event.reply('Unknown Error with Random')
        }
        sendMoose(rand[0], event, true)
    })
}

function getMoose(query, event) {
    moosedb.findOne({ name: query }, (err, moose) => {
        if (err || !moose) {
            mooseLock = false
            return event.reply(
                `No Such Moose: ${colors.bold(query)}`
            )
        }
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
            if (err || !meese || meese.length < 1)
                meese = ['No Moose Found For', colors.bold(query)]
            event.reply(meese.join(' - '))
        })
}

module.exports = (moosedb_, logger_) => {
    if (!config || config.disabled) return

    moosedb = moosedb_
    logger = logger_

    var irc = new Irc.Client()

    irc.on('registered', () => {
        logger.debug('IRC CONN STARTED')
        if (config.nickserv_pass)
            irc.say('NickServ', `IDENTIFY ${config.nickserv_pass}`)

        config.channels.forEach(channel => irc.join(channel))
    })

    irc.matchMessage(/^[.!](bots|help)/, (event) => {
        event.reply(
            `NeoMoose [JavaScript|NodeJS] :: Make moose @ ${config.moose_url || 'https://moose.ghetty.space'} :: See .moose --help for usage`
        )
    })

    irc.matchMessage(/^[.!]*moose(me)?/, (event) => {
        var parse = event.message
            .match(mooseParse)
        if (!parse) parse = ['', '--random', '']

        var arg = parse[1],
            query = parse[2]

        if (arg == '--latest' || 
            arg == '-l' || 
            query == 'latest'
        ) {
            if (mooseLock) 
                return irc.notice(event.nick, 'Please Wait for the Current Moose to finish')
            mooseLock = true
            getLatest(event)
        }
        else if (arg == '--random' ||
            arg == '-r' ||
            query == 'random'
        ) {
            if (mooseLock) 
                return irc.notice(event.nick, 'Please Wait for the Current Moose to finish')
            mooseLock = true
            getRandom(event)
        }
        else if (arg == '--search' || arg == '-s') {
            getSearch(query, event)
        }
        else if (arg == '--') {
            if (mooseLock) 
                return irc.notice(event.nick, 'Please Wait for the Current Moose to finish')
            mooseLock = true
            getMoose(query, event)
        }
        else if (arg == '--help' || arg == '-h' || !query) {
            event.reply('usage: [.!]*moose [--latest|--random|--search|--] moosename')
            event.reply(`Make moose @ ${config.moose_url || 'https://moose.ghetty.space'}`)
        }
        else if (arg) {
            event.reply(`invalid argument: ${arg}`)
            event.reply('usage: [.!]*moose [--latest|--random] moosename')
        }
        else {
            if (mooseLock) 
                return irc.notice(event.nick, 'Please Wait for the Current Moose to finish')
            mooseLock = true
            getMoose(query, event)
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
