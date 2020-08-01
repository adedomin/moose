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

const express = require('express');
const { ircLine, pngOutput } = require('./moose-res');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const RateLimiter = require('express-rate-limit');
const LRU = require('lru-cache');
const config = require(process.env.CONFIG_PATH);
const log = require('./logger.js');
const dflt = require('./default.js');

const antispam = dflt(config.web.antispam, {
    new_moose: {
        time_window: 60 * 1000, // 1 min in ms
        max: 3,
    },
    gallery: {
        time_window: 30 * 1000, // 30 sec
        delay_request: 300, // 300ms
        max: 10, // 10 gallery pages til delay
    },
    get_moose: {
        time_window: 30 * 1000,
        delay_request: 300,
        max: 10, // 10 moose a time window before delay
    },
    // this api is very slow due to how images are generated
    get_image: {
        time_window: 15 * 1000,
        delay_request: 300,
        max: 3, // 3 pics a time window
    },
});

function onErr(res, msg, err, code) {
    // this is an unknown error, so we should log it.
    if (err) {
        log.error(msg, { err: err.toString() });
        msg = err.toString();
    }
    else {
        log.info(msg);
    }

    res.status(code || 500);
    res.send({
        status: 'error',
        msg,
    });
}

function onOk(res, msg) {
    log.info(msg);
    res.send({
        status: 'ok',
        msg,
    });
}

function delay(t) {
    return new Promise(
        (resolve) => setTimeout(() => resolve(), t),
    );
}

function Web(moosedb) {

    if (config.web.proxied)
        app.enable('trust proxy');

    app.use(bodyParser.json());

    app.use('/new', new RateLimiter({
        windowMs: dflt(antispam.new_moose.time_window, 60 * 1000),
        max: dflt(antispam.new_moose.max, 3),
        message: JSON.stringify({
            status: 'error',
            msg: 'stop spamming moose jerk',
        }),
    }));

    app.use('/gallery', new RateLimiter({
        windowMs: dflt(antispam.gallery.time_window, 10 * 1000),
        max: dflt(antispam.gallery.max, 20),
        handler(req, res, next) {
            log.debug('WEB Delaying GALLERY GET');
            delay(dflt(antispam.gallery.delay_request, 150))
                .then(() => next());
        },
    }));

    const getLimiter = new RateLimiter({
        windowMs: dflt(antispam.get_moose.time_window, 30 * 1000),
        max: dflt(antispam.get_moose.max, 50),
        handler(req, res, next) {
            log.debug('WEB Delaying MOOSE GET');
            delay(dflt(antispam.get_moose.delay_request, 300))
                .then(() => next());
        },
    });

    app.use('/moose', getLimiter);

    app.use('/irc', getLimiter);

    app.use('/img', new RateLimiter({
        windowMs: dflt(antispam.get_image.time_window, 15 * 1000),
        max: dflt(antispam.get_image.max, 5),
        handler(req, res, next) {
            log.debug('WEB Delaying IMG GET');
            delay(dflt(antispam.get_image.delay_request, 300))
                .then(() => next());
        },
    }));

    app.get('/moose/latest', (req, res) => {
        moosedb.getLatest((err, moose) => {
            if (err) return onErr(res, err, moose);
            res.send(moose);
        });
    });

    app.get('/irc/latest', (req, res) => {
        moosedb.getLatest((err, moose) => {
            if (err) return onErr(res, err, moose);
            res.type('text/irc-art');
            res.send(ircLine(moose));
        });
    });

    app.get('/moose/random', (req, res) => {
        moosedb.getRandom((err, moose) => {
            if (err) return onErr(res, err, moose);
            res.send(moose);
        });
    });

    app.get('/irc/random', (req, res) => {
        moosedb.getRandom((err, moose) => {
            if (err) return onErr(res, err, moose);
            res.type('text/irc-art');
            res.send(ircLine(moose));
        });
    });

    app.get('/moose/:moose', (req, res) => {
        moosedb.getMoose(req.params.moose, (err, moose) => {
            if (err) {
                res.status(404);
                return res.send({
                    status: 'error',
                    msg: 'no such moose',
                });
            }
            res.send(moose);
        });
    });

    app.get('/irc/:moose', (req, res) => {
        moosedb.getMoose(req.params.moose, (err, moose) => {
            if (err) {
                res.status(404);
                res.type('text/plain');
                return res.send(`no such moose: ${req.params.moose}`);
            }
            res.type('text/irc-art');
            res.send(ircLine(moose));
        });
    });

    // START IMG middleware
    const lruCache = new LRU({
        // size in bytes
        max: dflt(config.web.cache_max_size, 1024 * 1024 * 5),
        length(n) {
            return n.length;
        },
    });

    // opportunistic cache hit
    app.get('/img/:moose', (req, res, next) => {
        if (req.params.moose &&
            (req.params.moose !== 'latest' && req.params.moose !== 'random')
        ) {
            const img = lruCache.get(req.params.moose);
            if (img) {
                log.debug('WEB IMG CACHE HIT');
                res.type('image/png');
                res.append(
                    'Content-Disposition',
                    `inline ; filename="${encodeURIComponent(req.params.moose)}"`,
                );
                res.send(img);
                return;
            }
        }
        next('route');
    });

    // Fetch moose
    app.get('/img/:moose', (req, res, next) => {
        if (req.params.moose === 'latest') {
            moosedb.getLatest((err, moose) => {
                if (err || !moose) return onErr(res, err, moose);
                req.moose = moose;
                next('route');
            });
        }
        else if (req.params.moose === 'random') {
            moosedb.getRandom((err, moose) => {
                if (err || !moose) return onErr(res, err, moose);
                req.moose = moose;
                next('route');
            });
        }
        else {
            moosedb.getMoose(req.params.moose, (err, moose) => {
                if (err || !moose) {
                    res.status(404);
                    res.type('text/plain');
                    return res.send(`no such moose: ${req.params.moose}`);
                }

                req.moose = moose;
                next('route');
            });
        }
    });

    // last change for cache hit (random or latest)
    app.get('/img/:moose', (req, res) => {
        // very unlikely
        if (req.params.moose === 'latest' || req.params.moose === 'random') {
            const img = lruCache.get(req.moose.name);
            if (img) {
                log.debug('WEB IMG CACHE HIT');
                res.type('image/png');
                res.append(
                    'Content-Disposition',
                    `inline ; filename="${encodeURIComponent(req.moose.name)}"`,
                );
                res.send(img);
                return;
            }
        }
        log.debug('WEB IMG CACHE MISS');

        pngOutput(req.moose).then(img => {
            lruCache.set(req.moose.name, img);
            res.type('image/png');
            res.append(
                'Content-Disposition',
                `inline ; filename="${encodeURIComponent(req.moose.name)}"`,
            );
            res.send(img);
        }).catch(err => {
            log.warn('WEB IMAGE OUTPUT', { err: err.toString() });
            res.status(500);
            res.type('text/plain');
            res.send('Web Image Generation Failure; sorry.');
        });
    });
    // END IMG middleware

    app.get('/gallery/:age?', (req, res) => {
        const name = req.query.q || '';
        const page = req.query.p || 0;
        const age = req.params.age == 'oldest' ? 1 : -1;

        moosedb.getGallery(name, page, age, (err, meese) => {
            if (err) return onErr(res, err, meese);
            res.send(meese);
        });
    });

    app.get('/dump', (req, res) => {
        res.sendFile(path.resolve(path.join(config.moose.db, 'dump.json')));
    });

    app.put('/new', (req, res) => {
        moosedb.newMoose(req.body, (err, msg) => {
            if (err) return onErr(res, err, msg, 422);
            onOk(res, msg);
        });
    });

    app.use('/', express.static(path.join(__dirname, '../public'), {
        index: [ 'index.html' ],
    }));

    app.listen(
        dflt(config.web.port, 7512),
        config.web.interface,
    );
}

module.exports = Web;
