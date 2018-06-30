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
var winston = require('winston'),
    config;

if (!process.env.CONFIG_PATH)
    config = { logger: { level: 'debug' } };
else
    config = require(process.env.CONFIG_PATH);

module.exports = new winston.Logger({
    emitErrs: true,
    transports: [
        new winston.transports.Console({
            level: config.logger.level,
            formatter: (options) => {
                return JSON.stringify({
                    time: Date.now(),
                    level: options.level,
                    msg: options.message,
                    err: options.meta.err,
                    moose: options.meta.moose,
                });
            },
        }),
    ],
});
