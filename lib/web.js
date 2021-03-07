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
const delay = require('./delay.js');
const {
    newMoose,
    getMoose,
    getGallery,
    getImage,
    MooseStorageError,
} = require('./moose-storage');

const antispam = config?.web?.antispam ?? {
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
};

function onErr(res, err) {
    let userMessage = err.message;
    let code = 400;
    // this is a special error, so we should log it.
    if (!(err instanceof MooseStorageError) && err instanceof Error) {
        // these errors should not happen
        log.error('WEB UNKNOWN ERR', { err });
        code = 500;
        userMessage = 'Unknown Error Occured.';
    }
    else if (!(err instanceof Error)) {
        log.error(`WEB UNKNOWN ERR TYPE ${typeof err} -> ${err}`);
        code = 500;
        userMessage = 'Unknown Error Occured.';
    }
    else if (err.is404()) {
        code = 404;
    }
    else if (!err.isDuplicate()) {
        // validation and other kinds of MooseStorageErrors
        log.debug('WEB DEBUG ERR', { err });
    }

    res.status(code);
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

function Web() {
    if (config.web.proxied) app.enable('trust proxy');

    app.use(bodyParser.json());

    app.use('/new', new RateLimiter({
        windowMs: antispam?.new_moose?.time_window ?? 60 * 1000,
        max: antispam?.new_moose?.max ?? 3,
        message: JSON.stringify({
            status: 'error',
            msg: 'You have exceeded the number of moose you can create.',
        }),
    }));

    app.use('/gallery', new RateLimiter({
        windowMs: antispam?.gallery?.time_window ?? 10 * 1000,
        max: antispam?.gallery?.max ?? 20,
        handler(req, res, next) {
            log.debug('WEB Delaying GALLERY GET');
            delay(antispam?.gallery?.delay_request ?? 150)
                .then(() => next());
        },
    }));

    const getLimiter = new RateLimiter({
        windowMs: antispam?.get_moose?.time_window ?? 30 * 1000,
        max: antispam?.get_moose?.max ?? 50,
        handler(req, res, next) {
            log.debug('WEB Delaying MOOSE GET');
            delay(antispam?.get_moose?.delay_request ?? 300)
                .then(() => next());
        },
    });

    app.use('/moose', getLimiter);

    app.use('/irc', getLimiter);

    app.use('/img', new RateLimiter({
        windowMs: antispam.get_image?.time_window ?? 15 * 1000,
        max: antispam?.get_image?.max ?? 5,
        handler(req, res, next) {
            log.debug('WEB Delaying IMG GET');
            delay(antispam?.get_image?.delay_request ?? 300)
                .then(() => next());
        },
    }));

    // BEGIN moose api paths
    app.get('/moose', (req, res) => {
        res.redirect('/moose/random');
    });

    app.get('/moose/:moose(latest|random)', (req, res) => {
        getMoose(req.params.moose)
            .then(moose => {
                res.redirect(`/moose/${moose.name}`);
            })
            .catch(err => {
                onErr(res, err);
            });
    });

    app.get('/moose/:moose', (req, res) => {
        getMoose(req.params.moose)
            .then(moose => {
                res.send(moose);
            })
            .catch(err => {
                onErr(res, err);
            });
    });
    // END moose api paths

    // BEGIN irc api paths
    app.get('/irc', (req, res) => {
        res.redirect('/irc/random');
    });

    app.get('/irc/:moose(latest|random)', (req, res) => {
        getMoose(req.params.moose)
            .then(moose => {
                res.redirect(`/irc/${moose.name}/`);
            })
            .catch(err => {
                onErr(res, err);
            });
    });

    app.get('/irc/:moose', (req, res) => {
        getMoose(req.params.moose)
            .then(moose => {
                res.type('text/irc-art');
                res.send(ircLine(moose));
            })
            .catch(err => {
                onErr(res, err);
            });
    });
    // END irc api paths

    // START img api paths
    app.get('/img', (req, res) => {
        res.redirect('/img/random');
    });

    app.get('/img/:moose(latest|random)', (req, res) => {
        getMoose(req.params.moose)
            .then(moose => {
                res.redirect(`/img/${moose.name}`);
            })
            .catch(err => {
                onErr(res, err);
            });
    });

    app.get('/img/:moose', (req, res) => {
        getImage(req.params.moose)
            .then(img => {
                res.type('image/png');
                res.append(
                    'Content-Disposition',
                    `inline ; filename="${encodeURIComponent(req.params.moose)}"`,
                );
                res.send(img);
            })
            .catch(err => {
                onErr(res, err);
            });
    });
    // END IMG middleware

    app.get('/gallery/:age?', (req, res) => {
        const name = req.query?.q ?? '';
        const page = req.query?.p ?? 0;
        const age = req.params.age;

        getGallery(name, page, age)
            .then(meese => {
                res.send(meese);
            })
            .catch(err => {
                onErr(res, err);
            });
    });

    app.get('/dump', (req, res) => {
        res.sendFile(path.resolve(path.join(config.moose.db, 'dump.json')));
    });

    app.put('/new', (req, res) => {
        newMoose(req.body)
            .then(status => {
                onOk(res, status);
            })
            .catch(err => {
                onErr(res, err);
            });
    });

    app.use('/', express.static(path.join(__dirname, '../public'), {
        index: [ 'index.html' ],
    }));

    app.listen(
        config?.web?.port ?? 7512,
        config?.web?.interface ?? '127.0.0.1',
    );
}

module.exports = Web;
