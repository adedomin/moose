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
const { ircLine } = require('./moose-render.js');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const RateLimiter = require('express-rate-limit');
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

let getMooseErrorEnum;

function onErr(userMessage, res, { err, msg }, code) {
    // this is a special error, so we should log it.
    switch (msg) {
    case getMooseErrorEnum.GET_RANDOM:
    case getMooseErrorEnum.GET_LATEST:
    case getMooseErrorEnum.GET_GALLERY:
    case getMooseErrorEnum.GET_RENDER:
        // these errors should not happen
        log.error(`WEB UNKNOWN ERR ${msg}`, { err });
        if (code === 404) code = 500;
        break;
    default:
        // these errors are most likely tame, but debuggable if they are not.
        // e.g. No such moose, no moose matching search, etc.
        log.debug(`WEB DEBUG ${msg}`, { err });
    }

    res.status(code || 200);
    res.send({
        status: 'error',
        msg: userMessage,
    });
}

function onOk(res, msg) {
    if (msg) log.info(`WEB ${msg}`);
    res.send({
        status: 'ok',
        msg,
    });
}

function Web(moosedb) {

    getMooseErrorEnum = moosedb.getMooseErrorEnum;

    if (config.web.proxied) app.enable('trust proxy');

    app.use(bodyParser.json());

    app.use('/new', new RateLimiter({
        windowMs: dflt(antispam.new_moose.time_window, 60 * 1000),
        max: dflt(antispam.new_moose.max, 3),
        message: JSON.stringify({
            status: 'error',
            msg: 'You have exceeded the number of moose you can create.',
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

    // BEGIN moose api paths
    app.get('/moose', (req, res) => {
        res.redirect('/moose/random');
    });

    app.get('/moose/:moose(latest|random)', (req, res) => {
        moosedb.getMoose(req.params.moose)
            .then(moose => {
                res.redirect(`/moose/${moose.name}`);
            })
            .catch(err => {
                onErr(
                    err.msg,
                    res,
                    err,
                    404,
                );
            });
    });

    app.get('/moose/:moose', (req, res) => {
        moosedb.getMoose(req.params.moose)
            .then(moose => {
                res.send(moose);
            })
            .catch(err => {
                onErr(
                    `no such moose: ${req.params.moose}`,
                    res,
                    err,
                    404,
                );
            });
    });
    // END moose api paths

    // BEGIN irc api paths
    app.get('/irc', (req, res) => {
        res.redirect('/irc/random');
    });

    app.get('/irc/:moose(latest|random)', (req, res) => {
        moosedb.getMoose(req.params.moose)
            .then(moose => {
                res.redirect(`/irc/${moose.name}/`);
            })
            .catch(err => {
                onErr(
                    err.msg,
                    res,
                    err,
                    404,
                );
            });
    });

    app.get('/irc/:moose', (req, res) => {
        moosedb.getMoose(req.params.moose)
            .then(moose => {
                res.type('text/irc-art');
                res.send(ircLine(moose));
            })
            .catch(err => {
                onErr(
                    `no such moose: ${req.params.moose}`,
                    res,
                    err,
                    404,
                );
            });
    });
    // END irc api paths

    // START img api paths
    app.get('/img', (req, res) => {
        res.redirect('/img/random');
    });

    app.get('/img/:moose(latest|random)', (req, res) => {
        moosedb.getMoose(req.params.moose)
            .then(moose => {
                res.redirect(`/img/${moose.name}`);
            })
            .catch(err => {
                onErr(
                    err.msg,
                    res,
                    err,
                    500,
                );
            });
    });

    app.get('/img/:moose', (req, res) => {
        moosedb.getImage(req.params.moose)
            .then(img => {
                res.type('image/png');
                res.append(
                    'Content-Disposition',
                    `inline ; filename="${encodeURIComponent(req.params.moose)}"`,
                );
                res.send(img);
            })
            .catch(err => {
                onErr(
                    (err.msg === getMooseErrorEnum.GET_NAMED
                        ? `no such moose: ${req.params.moose}`
                        : err.msg),
                    res,
                    err,
                    404,
                );
            });
    });
    // END IMG middleware

    app.get('/gallery/:age?', (req, res) => {
        const name = req.query.q || '';
        const page = req.query.p || 0;
        const age = req.params.age;

        moosedb.getGallery(name, page, age)
            .then(meese => {
                res.send(meese);
            })
            .catch(err => {
                onErr(
                    err.msg,
                    res,
                    err,
                    500,
                );
            });
    });

    app.get('/dump', (req, res) => {
        res.sendFile(path.resolve(path.join(config.moose.db, 'dump.json')));
    });

    app.put('/new', (req, res) => {
        moosedb.newMoose(req.body)
            .then(status => {
                onOk(res, status);
            })
            .catch(err => {
                onErr(
                    err.msg,
                    res,
                    err,
                    422,
                );
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
