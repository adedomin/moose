// Copyright (C) 2020  Anthony DeDominic <adedomin@gmail.com>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

'use strict';

const { exit } = require('process');
const fs = require('fs');
const Irc = require('irc-framework');
const needle = require('needle');
const logger = require('./logger.js');
const Antispam = require('./irc-antispam.js');
const config = require(process.env.CONFIG_PATH);
const {
    delay,
    SplitType,
    split,
} = require('./helpers.js');
const { ircLine } = require('./moose-render.js');

let mooseUrl;
let apiUrl;

/** @enum {number} */
const CmdType = {
    irc: 0,
    img: 1,
};

class IrcClient {
    constructor(config) {
        this.config = config;
        this.irc = new Irc.Client();
        this.locked = false;
        this.channels = config.channels ?? [];
        this.inviteChannels = [];
        this.inviteFile = config.inviteFile;
        this.antispam = {
            help:       new Antispam(config.help_spam ?? 10_000),
            image:      new Antispam(config.image_spam ?? 5_000),
            search:     new Antispam(config.search_spam ?? 10_000),
            pleaseWait: new Antispam(config.please_wait_spam ?? 10_000),
        };
    }

    static parseMooseArgs(msg) {
        const iter = split(msg);
        const { value: [ , cmd ] } = iter.next();

        const ret = [ cmd ];
        if (cmd.endsWith('img')) {
            ret[0] = CmdType.img;
        }
        else {
            ret[0] = CmdType.irc;
        }

        for (const [ t, v ] of iter) {
            // no arg found.
            if (ret.length === 1) {
                // is an arg, like --, --latest, --search
                if (t === SplitType.word && v.startsWith('-')) {
                    ret.push(v);
                }
                // is not an arg, implies "-- rest..."
                else if (t === SplitType.word) {
                    ret.push('--');
                    ret.push(v);
                }
            }
            // We have an arg, push next token into query position.
            // we wrill remove leading and trailing space with ret[2].trim()
            else if (ret.length === 2) {
                ret.push(v);
            }
            // concat rest
            else if (ret.length === 3) {
                ret[2] += v;
            }
        }
        if (ret.length === 1) {
            return [ ret[0], '--random', 'random' ];
        }

        if (ret[1] === '-l' || ret[1] === '--latest' || ret[2] === 'latest') {
            ret[1] = '--latest';
            ret[2] = 'latest';
        }
        else if (ret[1] === '-o' || ret[1] === '--oldest' || ret[2] === 'oldest') {
            ret[1] = '--oldest';
            ret[2] = 'oldest';
        }
        else if (ret[1] === '-r' || ret[1] === '--random' || ret[2] === 'random') {
            ret[1] = '--random';
            ret[2] = 'random';
        }
        else if (ret.length === 3) {
            const last = ret[2];
            ret[2] = last.trim();
        }
        else {
            ret.push('');
        }
        return ret;
    }

    saveInvites() {
        if (!this.inviteFile) return;
        fs.writeFile(
            this.inviteFile,
            JSON.stringify(this.inviteChannels),
            err => {
                if (err) logger.error('IRC INVITE SAVE', { err: err.toString() });
            },
        );
    }

    getOutputLock(nick) {
        if (this.locked) {
            if (this.antispam.pleaseWait.check(nick)) return false;
            this.irc.notice(nick, 'Please Wait for the Current Moose to finish');
            return false;
        }

        this.locked = true;
        return true;
    }

    splitJoins(channels) {
        const maxLineLen = 512 - 'JOIN \r\n'.length;
        let currJoin = '';

        for (let channel of channels) {
            if (channel.length > maxLineLen) {
                logger.warn('IRC JOIN WARN', { err: `channel: ${channel} is too long.` });
                continue;
            }
            if ((currJoin.length + channel.length + 1) > maxLineLen) {
                this.irc.join(currJoin);
                currJoin = '';
            }
            if (currJoin === '') {
                currJoin = channel;
            }
            else {
                currJoin += `,${channel}`;
            }
        }

        if (currJoin !== '') this.irc.join(currJoin);
    }

    async outputMoose(event, body) {
        for (let line of body.split('\n')) {
            this.irc.raw(`PRIVMSG ${event.target} :${line}`);
            await delay(this.config.send_delay ?? 350);
        }
        await delay(this.config.moose_delay ?? 5_000);
        this.locked = false;
    }

    getAndEmitImgLine(event, query) {
        if (this.antispam.image.check(event.target)) return;
        else if (query === 'oldest' || query === 'latest' || query === 'random') {
            needle(
                'get',
                `${apiUrl}/img/${encodeURIComponent(query)}`,
                { follow_max: 0 },
            ).then(res => {
                if (res.statusCode !== 302) throw res.body;
                event.reply(`${mooseUrl}${res.headers.location}`);
            }).catch(err => {
                logger.error('IRC MOOSEIMG RANDOM/LATEST ERROR', { err });
                event.reply('Unknown error');
            });
        }
        else {
            event.reply(`${mooseUrl}/img/${encodeURIComponent(query)}`);
        }
    }

    getAndEmitIrcLine(event, query) {
        if (!this.getOutputLock(event.nick)) return;
        needle(
            'get',
            `${apiUrl}/moose/${encodeURIComponent(query)}`,
            { follow_max: 1 },
        ).then(res => {
            if (res.statusCode !== 200) throw res.body;
            res.body.created = new Date(res.body.created);
            const outputBody = ircLine(res.body, `${mooseUrl}/img/${encodeURIComponent(res.body.name)}`);
            this.outputMoose(
                event,
                outputBody,
            );
        }).catch(err => {
            if (err.msg) {
                event.reply(err.msg);
            }
            else {
                logger.error('IRC MOOSEME ERROR', { err });
                event.reply('Unknown error');
            }
            this.locked = false;
        });
    }

    register() {
        this.irc.on('registered', () => {
            logger.debug('IRC CONN STARTED');
            if (this.config.nickserv && !this.config.sasl) {
                this.irc.say('NickServ', `IDENTIFY ${this.config.nickserv}`);
            }

            this.splitJoins(this.channels);
            fs.readFile(this.inviteFile, (err, data) => {
                if (err || !data) {
                    logger.info('IRC INVITE LIST', { err: (err ?? 'empty file') });
                    return;
                }

                try {
                    this.inviteChannels = JSON.parse(data.toString('utf-8'));
                }
                catch (err) {
                    logger.error('IRC INVITE LIST IS CORRUPT', { err });
                    return;
                }

                this.channels = this.channels.concat(this.inviteChannels);
                this.splitJoins(this.inviteChannels);
            });
        });

        this.irc.on('invite', event => {
            // makes you 'JOIN 0' which causes you to leave every channel
            if (event.channel.includes(',0') || event.channel.indexOf('0') === 0) return;

            this.irc.join(event.channel);
            logger.info(`IRC INVITE ${event.channel}`);

            // persist invites
            if (this.inviteChannels.indexOf(event.channel) > -1) return;
            this.inviteChannels.push(event.channel);
            this.saveInvites();
        });

        this.irc.matchMessage(/^[.!](bots|help)/, event => {
            if (this.antispam.help.check(event.target)) return;
            event.reply(
                `Moose :: Make moose @ ${mooseUrl} :: See .moose --help for usage`,
            );
        });

        this.irc.matchMessage(/^[.!]source\b/, event => {
            if (this.antispam.help.check(event.target)) return;
            event.reply(
                'Moose :: Source https://github.com/adedomin/moose',
            );
        });

        this.irc.matchMessage(/^[.!]?moose(?:img)?\b/, (event) => {
            let [ cmdtype, arg, query ] = IrcClient.parseMooseArgs(event.message);

            const usage = (extra) => {
                if (this.antispam.help.check(event.target)) return;
                if (extra) event.reply(extra);
                event.reply('usage: ^[.!]?moose(?:img)? [--latest|--oldest|--random|--search|--] moosename');
                if (!extra) event.reply(`Make moose @ ${mooseUrl}`);
            };

            if (arg === '--help' || arg === '-h') {
                usage();
            }
            else if (arg === '--search' || arg === '-s') {
                if (this.antispam.search.check(event.target)) return;
                if (query === '') return event.reply('usage: .moose --search query');
                needle(
                    'get',
                    `${mooseUrl}/gallery/newest?p=0&q=${encodeURIComponent(query)}`,
                ).then(res => {
                    if (res.statusCode !== 200) throw res.body;
                    if (res.body.length > 0) {
                        event.reply(res.body.map(moose => `\x02${moose.name}\x02`).join(', '));
                    }
                    else {
                        event.reply(`No moose returned for: ${query}`);
                    }

                }).catch(err => {
                    if (err.msg) {
                        event.reply(err.msg);
                    }
                    else {
                        logger.error('IRC MOOSEME SEARCH ERROR', { err });
                        event.reply('Unknown error');
                    }
                });
                return;
            }
            else if (
                arg === '--latest' ||
                arg === '-l' ||
                arg === '--oldest' ||
                arg === '-o' ||
                arg === '--random' ||
                arg === '-r' ||
                arg === '--'
            ) {
                switch (cmdtype) {
                case CmdType.irc:
                    this.getAndEmitIrcLine(event, query);
                    break;
                case CmdType.img:
                    this.getAndEmitImgLine(event, query);
                    break;
                }
            }
            else if (arg) {
                usage(`invalid argument: ${arg}`);
            }
        });

        this.irc.on('join', event => {
            if (event.nick === this.config.nick) {
                logger.debug(`IRC JOIN ${event.channel}`);
            }
        });

        this.irc.on('part', event => {
            // this shouldn't happen, yet.
            if (event.nick === this.config.nick) {
                logger.info(`IRC PART ${event.channel}`);
            }
        });

        this.irc.on('kick', event => {
            if (event.kicked === this.config.nick) {
                logger.info(`IRC KICK ${event.channel}`, {
                    err: `${event.nick} [${event.message}]`,
                });

                const chanInd = this.inviteChannels.indexOf(event.channel);
                if (chanInd !== -1) {
                    this.inviteChannels.splice(chanInd, 1);
                    this.saveInvites();
                }
            }
        });

        this.irc.on('close', () => {
            logger.error('IRC CLOSE', { err: 'unable to reconnect' });
            exit(1);
        });

        this.irc.on('socket close', () => {
            logger.error('IRC CLOSE', { err: 'flood kick' });
            exit(1);
        });

        this.irc.connect({
            host: this.config.server,
            nick: this.config.nick,
            port: this.config.port,
            tls:  this.config.tls,
            // For preventing irc-framework from splitting our messages
            message_max_length: 512,
        });
    }

}

module.exports = function(argv) {
    let server_conf;
    if (config.irc.servers && config.irc.servers[argv.irc]) {
        server_conf = config.irc.servers[argv.irc];
    }
    else {
        server_conf = config.irc;
    }

    apiUrl = argv.server
        ? argv.server
        : config.irc.api_url
            ? config.irc.api_url
            : 'http://localhost:7512';
    mooseUrl = config.irc.moose_url
        ? config.irc.moose_url
        : 'https://moose.ghetty.space';
    const client = new IrcClient(server_conf);
    client.register();
};
