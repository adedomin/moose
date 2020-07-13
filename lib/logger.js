/*
 * Copyright (C) 2017 Anthony DeDominic <adedomin@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';

const levels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};
const config = require(process.env.CONFIG_PATH);
const logLevel = levels[(
    (config || { logger: undefined })
        .logger || { level: 'debug' }
).level];

function logger(level, msg, meta) {
    if (logLevel > levels[level]) return;

    /* eslint-disable-next-line */
    const err = (meta || {}).err;
    /* eslint-disable-next-line */
    const moose = (meta || {}).moose;

    /* eslint-disable-next-line */
    console.log(JSON.stringify({
        time: Date.now(),
        level,
        msg,
        err,
        moose,
    }));
}

module.exports = {
    debug: logger.bind(null, 'debug'),
    info: logger.bind(null, 'info'),
    warn: logger.bind(null, 'warn'),
    error: logger.bind(null, 'error'),
};
