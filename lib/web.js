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
const { ircLine, pngOutput } = require('./moose-render.js');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const RateLimiter = require('express-rate-limit');
const LRU = require('lru-cache');
const config = require(process.env.CONFIG_PATH);
const log = require('./logger.js');
const dflt = require('./default.js');
const delay = require('./delay.js');

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

function onErr(msg, res, err, code) {
    // this is a special error, so we should log it.
    if (err != null) {
        log.error(`WEB UNKNOWN ${msg}`, { err: err.toString() });
        if (code === 404) code = 500;
    }

    res.status(code || 200);
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

function Web(moosedb) {

    if (config.web.proxied) app.enable('trust proxy');

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

    app.use((req, res, next) => {
        req.special = false;
        if (/\/(latest|random)$/.test(req.path)) {
            req.special = true;
        }
        next();
    });

    app.get('/moose/:moose', (req, res) => {
        moosedb.getMoose(req.params.moose, (err, moose) => {
            if (err) {
                return onErr(
                    `no such moose: ${req.params.moose}`,
                    res,
                    req.special ? err : undefined,
                    404,
                );
            }
            res.send(moose);
        });
    });

    app.get('/irc/:moose', (req, res) => {
        moosedb.getMoose(req.params.moose, (err, moose) => {
            if (err) {
                return onErr(
                    `no such moose: ${req.params.moose}`,
                    res,
                    req.special ? err : undefined,
                    404,
                );
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

    app.get('/img/:moose(latest|random)', (req, res) => {
        moosedb.getMoose(req.params.moose, (err, moose) => {
            if (err) {
                return onErr(
                    `unknown moose error`,
                    res,
                    err,
                    500
                );
            }
            res.redirect(`/img/${moose.name}`);
        });
    });

    app.get('/img/:moose', [
        (req, res, next) => {
            /* hopeful cache hit */
            const img = lruCache.get(req.params.moose);

            if (img) {
                res.type('image/png');
                res.append(
                    'Content-Disposition',
                    `inline ; filename="${encodeURIComponent(req.params.moose)}"`,
                );
                res.send(img);
                return;
            }
            else /* Fetch moose */ {
                moosedb.getMoose(req.params.moose, (err, moose) => {
                    if (err || !moose) {
                        return onErr(
                            `no such moose: ${req.params.moose}`,
                            res,
                            req.special ? err : undefined,
                            404,
                        );
                    }
                    req.moose = moose;
                    next();
                });
            };
        }, /* generate and output PNG */ (req, res) => {
            pngOutput(req.moose).then(img => {
                lruCache.set(req.moose.name, img);
                res.type('image/png');
                res.append(
                    'Content-Disposition',
                    `inline ; filename="${encodeURIComponent(req.moose.name)}"`,
                );
                res.send(img);
            }).catch(err => {
                onErr(
                    'unknown image generation Failure',
                    res, err, 500,
                );
            });
        },
    ]);
    // END IMG middleware

    app.get('/gallery/:age?', (req, res) => {
        const name = req.query.q || '';
        const page = req.query.p || 0;
        const age = req.params.age;

        moosedb.getGallery(name, page, age, (err, meese) => {
            if (err) {
                return onErr(
                    err.toString(),
                    res, meese, 500,
                );
            }
            res.send(meese);
        });
    });

    app.get('/dump', (req, res) => {
        res.sendFile(path.resolve(path.join(config.moose.db, 'dump.json')));
    });

    app.put('/new', (req, res) => {
        moosedb.newMoose(req.body, (err, msg) => {
            if (err) return onErr(
                err.toString(),
                res, msg, 422,
            );
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
