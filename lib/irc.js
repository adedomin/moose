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
const { output } = require('./moose-res.js');
const Antispam = require('./irc-antispam.js');

let inviteChannels = [];
const mooseParse = /^[.!]?moose(?:me)? (-[^ ]*)? ?(.*)$/;
const mooseImgParse = /^[.!]?mooseimg (.*)$/;

// functions to prevent spam
const helpSpam = new Antispam(config.irc.help_spam || 10000);
const mooseImageSpam = new Antispam(config.irc.moose_image_spam || 5000);
const mooseSearchSpam = new Antispam(config.irc.moose_search_spam || 10000);
const moosePleaseWaitSpam = new Antispam(config.irc.moose_please_wait_spam || 10000);
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

    irc.on('registered', () => {
        logger.debug('IRC CONN STARTED');
        if (config.irc.nickserv_pass)
            irc.say('NickServ', `IDENTIFY ${config.irc.nickserv_pass}`);

        splitJoins(config.irc.channels);
        fs.readFile(join(config.moose.db, 'invites.json'), (err, data) => {
            if (err || !data) {
                logger.info('IRC INVITE LIST', { err: (err || 'empty file').toString() });
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
            `Moose :: Make moose @ ${config.irc.moose_url || 'https://moose.ghetty.space'} :: See .moose --help for usage`,
        );
    });

    irc.matchMessage(/^[.!]source\b/, event => {
        if (helpSpam.check(event.target)) return;
        event.reply(
            'Moose :: Source https://github.com/adedomin/moose',
        );
    });


    irc.matchMessage(/^[.!]?mooseimg\b/, function(event) {
        if (mooseImageSpam.check(event.target)) return;
        let parse = event.message.match(mooseImgParse);
        let query;
        if (parse) [ , query ] = parse;

        if (!query || query === 'random') {
            event.reply(
                `${config.irc.moose_url || 'https://moose.ghetty.space'}/img/random`,
            );
        }
        else if (query === 'latest') {
            event.reply(
                `${config.irc.moose_url || 'https://moose.ghetty.space'}/img/latest`,
            );
        }
        else {
            moosedb.getMoose(query, (err, moose) => {
                if (err || !moose) {
                    return event.reply(`no such moose: ${query}`);
                }
                event.reply(
                    `${config.irc.moose_url || 'https://moose.ghetty.space'}/img/${encodeURIComponent(query)}`,
                );
            });
        }
    });

    // function() usage to get this context of irc object
    irc.matchMessage(/^[.!]?moose(?:me)?\b/, function(event) {
        let parse = event.message
            .match(mooseParse);
        if (!parse) parse = ['', '--random', ''];

        let [ , arg, query ] = parse;

        const boundOutputMoose = (err, moose) => {
            outputMoose(event, ircRawOut, err, moose);
        };

        if (arg == '--latest' ||
            arg == '-l' ||
            query == 'latest'
        ) {
            if (mooseLock) {
                if (moosePleaseWaitSpam.check(event.nick)) return;
                return irc.notice(event.nick, 'Please Wait for the Current Moose to finish');
            }
            mooseLock = true;
            moosedb.getLatest(boundOutputMoose);
        }
        else if (arg == '--random' ||
            arg == '-r' ||
            query == 'random'
        ) {
            if (mooseLock) {
                if (moosePleaseWaitSpam.check(event.nick)) return;
                return irc.notice(event.nick, 'Please Wait for the Current Moose to finish');
            }
            mooseLock = true;
            moosedb.getRandom(boundOutputMoose);
        }
        else if (arg == '--search' || arg == '-s') {
            if (mooseSearchSpam.check(event.target)) return;
            if (!query)
                return event.reply('usage: --search query');
            moosedb.getGallery(query, 0, -1, (err, meese) => {
                if (err || !meese || !meese.length) {
                    return event.reply(`No moose found containing ${colors.bold(query)}`);
                }
                event.reply(
                    meese.map(moose => colors.bold(moose.name)).join(' - '),
                );
            });
        }
        else if (arg == '--') {
            if (mooseLock) {
                if (moosePleaseWaitSpam.check(event.nick)) return;
                return irc.notice(event.nick, 'Please Wait for the Current Moose to finish');
            }
            mooseLock = true;
            moosedb.getMoose(query, boundOutputMoose);
        }
        else if (arg == '--help' || arg == '-h' || !query) {
            if (helpSpam.check(event.target)) return;
            event.reply('usage: ^[.!]?moose(me)? [--latest|--random|--search|--] moosename');
            event.reply(`Make moose @ ${config.irc.moose_url || 'https://moose.ghetty.space'}`);
        }
        else if (arg) {
            if (helpSpam.check(event.target)) return;
            event.reply(`invalid argument: ${arg}`);
            event.reply('usage: [.!]*moose [--latest|--random] moosename');
        }
        else {
            if (mooseLock) {
                if (moosePleaseWaitSpam.check(event.nick)) return;
                return irc.notice(event.nick, 'Please Wait for the Current Moose to finish');
            }
            mooseLock = true;
            moosedb.getMoose(query, boundOutputMoose);
        }
    });

    irc.on('join', event => {
        if (event.nick == config.irc.nick)
            logger.debug(`IRC JOIN ${event.channel}`);
    });

    irc.on('part', event => {
        if (event.nick == config.irc.nick)
            logger.info(`IRC PART ${event.channel}`);
    });

    irc.on('kick', event => {
        if (event.kicked == config.irc.nick) {
            logger.info(`IRC KICK ${event.channel}`, {
                err: `${event.nick} [${event.message}]`,
            });

            const chanInd = inviteChannels.indexOf(event.channel);
            if (chanInd != -1) {
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
