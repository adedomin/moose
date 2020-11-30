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
const reladate = require('relative-date');
const logger = require('./logger.js');
const Antispam = require('./irc-antispam.js');
const dflt = require('./default.js');
const config = require(process.env.CONFIG_PATH);
const delay = require('./delay.js');

const mooseParse = /^[.!]?moose(?:me)? (-[^ ]+)? ?(.*)$/;
const mooseImgParse = /^[.!]?mooseimg (-[^ ]+)? ?(.*)$/;

let mooseUrl;
let apiUrl;

class IrcClient {
    constructor(config) {
        this.config = config;
        this.irc = new Irc.Client();
        this.locked = false;
        this.channels = dflt(config.channels, []);
        this.inviteChannels = [];
        this.inviteFile = config.inviteFile;
        this.antispam = {
            help:       new Antispam(dflt(config.help_spam,        10000)),
            image:      new Antispam(dflt(config.image_spam,       5000)),
            search:     new Antispam(dflt(config.search_spam,      10000)),
            pleaseWait: new Antispam(dflt(config.please_wait_spam, 10000)),
        };
    }

    static parseMooseCommonArgs(args) {
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

    static parseMooseArgs(msg) {
        if (mooseParse.test(msg)) {
            return IrcClient.parseMooseCommonArgs(msg.match(mooseParse));
        }
        else if (mooseImgParse.test(msg)) {
            return IrcClient.parseMooseCommonArgs(msg.match(mooseImgParse));
        }
        else {
            return [ undefined, '--random', 'random'];
        }
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

    async outputMoose(event, body, info) {
        for (let line of body.split('\n')) {
            this.irc.raw(`PRIVMSG ${event.target} :${line}`);
            await delay(dflt(this.config.send_delay, 350));
        }
        if (info) {
            event.reply(info);
            await delay(dflt(this.config.send_delay, 350));
        }
        await delay(dflt(this.config.moose_delay, 5000));
        this.locked = false;
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
                    logger.info('IRC INVITE LIST', { err: (dflt(err, 'empty file')).toString() });
                    return;
                }

                try {
                    this.inviteChannels = JSON.parse(data);
                }
                catch (e) {
                    logger.error('IRC INVITE LIST IS CORRUPT', { err: e.toString() });
                    return;
                }

                this.channels = this.channels.concat(this.inviteChannels);
                this.splitJoins(this.inviteChannels);
            });
        });

        this.irc.on('invite', event => {
            // makes you 'JOIN 0' which causes you to leave every channel
            if (event.channel === '#0,0') return;

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


        this.irc.matchMessage(/^[.!]?mooseimg\b/, (event) => {
            let parse = IrcClient.parseMooseArgs(event.message);
            let [ , arg, query ] = parse;

            function usage(extra) {
                if (this.antispam.help.check(event.target)) return;
                if (extra) event.reply(extra);
                event.reply('usage: ^[.!]?mooseimg [--latest|--random|--] moosename');
                if (!extra) event.reply(`Make moose @ ${mooseUrl}`);
            }

            if (arg === '--help' || arg === '-h') {
                usage();
            }
            else if (query === 'latest' || query === 'random') {
                if (this.antispam.image.check(event.target)) return;
                needle(
                    'get',
                    `${apiUrl}/img/${query}`,
                    { follow_max: 0 },
                ).then(res => {
                    if (res.statusCode !== 200) throw res.body;
                    event.reply(`${mooseUrl}${res.headers.location}`);
                }).catch(err => {
                    logger.error('IRC MOOSEIMG RANDOM/LATEST ERROR', { err });
                    event.reply('Unknown error');
                });
            }
            else if (arg && arg !== '--') {
                usage(`invalid argument: ${arg}`);
            }
            else if (!this.antispam.image.check(event.target)) {
                event.reply(`${mooseUrl}/img/${query}`);
            }
        });

        // function() usage to get this context of irc object
        this.irc.matchMessage(/^[.!]?moose(?:me)?\b/, (event) => {
            let parse = IrcClient.parseMooseArgs(event.message);
            let [ , arg, query ] = parse;

            function usage(extra) {
                if (this.antispam.help.check(event.target)) return;
                if (extra) event.reply(extra);
                event.reply('usage: ^[.!]?moose(me)? [--latest|--random|--search|--] moosename');
                if (!extra) event.reply(`Make moose @ ${mooseUrl}`);
            }

            if (arg === '--help' || arg === '-h') {
                usage();
            }
            else if (arg === '--search' || arg === '-s') {
                if (this.antispam.search.check(event.target)) return;
                if (query === '') return event.reply('usage: .moose --search query');
                return;
            }
            else if (
                arg === '--latest' ||
                arg === '-l' ||
                arg === '--random' ||
                arg === '-r' ||
                arg === '--' ||
                arg === undefined
            ) {
                if (!this.getOutputLock(event.nick)) return;
                let mooseName = undefined;
                let mooseDate = undefined;
                needle(
                    'get',
                    `${apiUrl}/moose/${query}`,
                ).then(res => {
                    if (res.statusCode !== 200) throw res.body;
                    mooseName = res.body.name;
                    mooseDate = reladate(new Date(res.body.created));
                    return needle('get', `${apiUrl}/irc/${mooseName}`);
                }).then(res => {
                    if (res.statusCode !== 200) throw res.body;
                    this.outputMoose(event, res.body, `${mooseName} - ${mooseDate}`);
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
