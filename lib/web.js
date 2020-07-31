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
const config = require(process.env.CONFIG_PATH);
const log = require('./logger.js');

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

function Web(moosedb) {

    if (config.web.proxied)
        app.enable('trust proxy');

    app.use(bodyParser.json());

    app.use('/new', new RateLimiter({
        windowMs: 60 * 1000, // 1 min
        max: config.moose.maxNew || 3,
        message: JSON.stringify({
            status: 'error',
            msg: 'stop spamming moose jerk',
        }),
    }));

    app.use('/gallery', new RateLimiter({
        windowMs: 30 * 1000, // 30 sec
        delayAfter: config.moose.maxPageReq || 50,
        delayMs: 150,
        max: 0,
    }));

    const getLimiter = new RateLimiter({
        windowMs: 30 * 1000, // 30 sec
        delayAfter: config.moose.maxGetReq || 10,
        delayMs: 150,
        max: 0,
    });

    app.use('/moose', getLimiter);

    app.use('/irc', getLimiter);

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

    app.get('/img/:moose', (req, res) => {
        moosedb.getMoose(req.params.moose, (err, moose) => {
            if (err) {
                res.status(404);
                res.type('text/plain');
                return res.send(`no such moose: ${req.params.moose}`);
            }

            pngOutput(moose).then(buffer => {
                res.type('image/png');
                res.send(buffer);
            }).catch(err => {
                log.warn('WEB IMAGE OUTPUT', { err: err.toString() });
                res.status(500);
                res.type('text/plain');
                res.send('Web Image Generation Failure; sorry.');
            });
        });
    });

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
        config.web.port || 7512,
        config.web.interface,
    );
}

module.exports = Web;
