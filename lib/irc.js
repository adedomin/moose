/*
 * Copyright (C) 2020  Anthony DeDominic <adedomin@gmail.com>
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

'use strict';

const Irc = require('irc-framework');
const colors = require('irc-colors');

const fs = require('fs');
const { join } = require('path');

const config = require(process.env.CONFIG_PATH);
const logger = require('./logger.js');
const { output } = require('./moose-render.js');
const Antispam = require('./irc-antispam.js');

let inviteChannels = [];
const mooseParse = /^[.!]?moose(?:me)? (-[^ ]+)? ?(.*)$/;
const mooseImgParse = /^[.!]?mooseimg (-[^ ]+)? ?(.*)$/;
const dflt = require('./default.js');
const mooseUrl = dflt(config.irc.moose_url, 'https://moose.ghetty.space');

// functions to prevent spam
const helpSpam = new Antispam(dflt(config.irc.help_spam, 10000));
const mooseImageSpam = new Antispam(dflt(config.irc.moose_image_spam, 5000));
const mooseSearchSpam = new Antispam(dflt(config.irc.moose_search_spam, 10000));
const moosePleaseWaitSpam = new Antispam(dflt(config.irc.moose_please_wait_spam, 10000));
let mooseLock = false;

function saveInvites() {
    fs.writeFile(
        join(config.moose.db, 'invites.json'),
        JSON.stringify(inviteChannels),
        err => {
            if (err) logger.error('IRC INVITE SAVE', { err: err.toString() });
        },
    );
}

function outputMoose(event, rawOutput, err, moose) {
    if (err) {
        mooseLock = false;
        logger.error('IRC MOOSE OUTPUT ERROR', { err });
        return event.reply(err.toString());
    }
    output(moose, event, rawOutput, true, () => mooseLock = false);
}

function parseMooseCommonArgs(args) {
    if (args[1] === '-r' || args[1] === '--random') {
        return [ undefined, '--random', 'random' ];
    }
    else if (args[1] === '-l' || args[1] === '--latest') {
        return [ undefined, '--latest', 'latest' ];
    }
    else {
        return args;
    }
}

function parseMooseArgs(msg) {
    if (mooseParse.test(msg)) {
        return parseMooseCommonArgs(msg.match(mooseParse));
    }
    else if (mooseImgParse.test(msg)) {
        return parseMooseCommonArgs(msg.match(mooseImgParse));
    }
    else {
        return [ undefined, '--random', 'random'];
    }

}

module.exports = (moosedb) => {
    if (!config || !config.irc || config.irc.disabled) return;

    const irc = new Irc.Client();
    let ircRawOut = irc.raw.bind(irc);

    // split join string to fit within ~512B limit of ircd's.
    function splitJoins(channels) {
        const maxLineLen = 512 - 'JOIN \r\n'.length;
        let currJoin = '';

        for (let channel of channels) {
            if (channel.length > maxLineLen) {
                logger.warn('IRC JOIN WARN', { err: `channel: ${channel} is too long.` });
                continue;
            }
            if ((currJoin.length + channel.length + 1) > maxLineLen) {
                irc.join(currJoin);
                currJoin = '';
            }
            if (currJoin === '') {
                currJoin = channel;
            }
            else {
                currJoin += `,${channel}`;
            }
        }

        if (currJoin !== '') irc.join(currJoin);
    }

    function getOutputLock(nick) {
        if (mooseLock) {
            if (moosePleaseWaitSpam.check(nick)) return false;
            irc.notice(nick, 'Please Wait for the Current Moose to finish');
            return false;
        }

        mooseLock = true;
        return true;
    }

    irc.on('registered', () => {
        logger.debug('IRC CONN STARTED');
        if (config.irc.nickserv_pass) {
            irc.say('NickServ', `IDENTIFY ${config.irc.nickserv_pass}`);
        }

        splitJoins(config.irc.channels);
        fs.readFile(join(config.moose.db, 'invites.json'), (err, data) => {
            if (err || !data) {
                logger.info('IRC INVITE LIST', { err: (dflt(err, 'empty file')).toString() });
                return;
            }

            try {
                inviteChannels = JSON.parse(data);
            }
            catch (e) {
                logger.error('IRC INVITE LIST IS CORRUPT', { err: e.toString() });
                return;
            }

            config.irc.channels = config.irc.channels.concat(inviteChannels);
            splitJoins(inviteChannels);
        });
    });

    irc.on('invite', event => {
        // makes you 'JOIN 0' which causes you to leave every channel
        if (event.channel === '#0,0') return;

        irc.join(event.channel);
        logger.info(`IRC INVITE ${event.channel}`);

        // persist invites
        if (inviteChannels.indexOf(event.channel) > -1) return;
        inviteChannels.push(event.channel);
        saveInvites();
    });

    irc.matchMessage(/^[.!](bots|help)/, event => {
        if (helpSpam.check(event.target)) return;
        event.reply(
            `Moose :: Make moose @ ${mooseUrl} :: See .moose --help for usage`,
        );
    });

    irc.matchMessage(/^[.!]source\b/, event => {
        if (helpSpam.check(event.target)) return;
        event.reply(
            'Moose :: Source https://github.com/adedomin/moose',
        );
    });


    irc.matchMessage(/^[.!]?mooseimg\b/, function(event) {
        let parse = parseMooseArgs(event.message);
        let [ , arg, query ] = parse;

        function usage(extra) {
            if (helpSpam.check(event.target)) return;
            if (extra) event.reply(extra);
            event.reply('usage: ^[.!]?mooseimg [--latest|--random|--] moosename');
            if (!extra) event.reply(`Make moose @ ${mooseUrl}`);
        }

        if (arg === '-h' || arg === '--help') {
            usage();
        }
        else if (query === 'latest') {
            if (mooseImageSpam.check(event.target)) return;
            event.reply(
                `${mooseUrl}/img/latest`,
            );
        }
        else if (arg && arg !== '--' && arg !== '-r' && arg !== '--random') {
            usage(`invalid argument: ${arg}`);
        }
        else if (!mooseImageSpam.check(event.target)) {
            moosedb.getMoose(query, (err, moose) => {
                if (err || !moose) {
                    if (!query || query === 'random') {
                        logger.error('IRC MOOSEIMG RANDOM', { err: err.toString() });
                        return event.reply('unknown random moose error');
                    }
                    else {
                        return event.reply(`no such moose: ${query}`);
                    }
                }
                event.reply(
                    `${mooseUrl}/img/${encodeURIComponent(moose.name)}`,
                );
            });
        }
    });

    // function() usage to get this context of irc object
    irc.matchMessage(/^[.!]?moose(?:me)?\b/, function(event) {
        let parse = parseMooseArgs(event.message);
        let [ , arg, query ] = parse;

        const boundOutputMoose = (err, moose) => {
            outputMoose(event, ircRawOut, err, moose);
        };

        function usage(extra) {
            if (helpSpam.check(event.target)) return;
            if (extra !== undefined) event.reply(extra);
            event.reply('usage: ^[.!]?moose(me)? [--latest|--random|--search|--] moosename');
            if (!extra) event.reply(`Make moose @ ${mooseUrl}`);
        }

        if (arg === '--help' || arg === '-h') {
            usage();
        }
        else if (arg === '--search' || arg === '-s') {
            if (mooseSearchSpam.check(event.target)) return;
            if (query === '') return event.reply('usage: .moose --search query');
            moosedb.getGallery(query, 0, 'newest', (err, meese) => {
                if (err || !meese || !meese.length) {
                    return event.reply(`No moose found containing ${colors.bold(query)}`);
                }
                event.reply(
                    meese.map(moose => colors.bold(moose.name)).join(' - '),
                );
            });
        }
        else if (arg === '--latest' ||
            arg === '-l' ||
            arg === '--random' ||
            arg === '-r' ||
            arg === '--' ||
            arg === undefined
        ) {
            if (!getOutputLock(event.nick)) return;
            moosedb.getMoose(query, boundOutputMoose);
        }
        else if (arg) {
            usage(`invalid argument: ${arg}`);
        }
        else {
            logger.error('IRC MOOSEME WE SHOULD NOT BE HERE', { err: parse });
        }
    });

    irc.on('join', event => {
        if (event.nick === config.irc.nick) {
            logger.debug(`IRC JOIN ${event.channel}`);
        }
    });

    irc.on('part', event => {
        if (event.nick === config.irc.nick) {
            logger.info(`IRC PART ${event.channel}`);
        }
    });

    irc.on('kick', event => {
        if (event.kicked === config.irc.nick) {
            logger.info(`IRC KICK ${event.channel}`, {
                err: `${event.nick} [${event.message}]`,
            });

            const chanInd = inviteChannels.indexOf(event.channel);
            if (chanInd !== -1) {
                inviteChannels.splice(chanInd, 1);
                saveInvites();
            }
        }
    });

    irc.on('close', () => {
        logger.error('IRC CLOSE', { err: 'unable to reconnect' });
    });

    irc.on('socket close', () => {
        logger.error('IRC CLOSE', { err: 'flood kick' });
    });

    irc.connect({
        host: config.irc.server,
        nick: config.irc.nick,
        port: config.irc.port,
        tls: config.irc.tls,
        message_max_length: 512,
    });
};
