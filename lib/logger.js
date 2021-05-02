/*
 * Copyright (c) 2020, Anthony DeDominic <adedomin@gmail.com>
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

'use strict';

const levels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};
const config = require(process.env.CONFIG_PATH);
const logLevel = levels[config?.logger?.level ?? 'debug'];

/**
 * Log helper
 * @param {('debug'|'info'|'warn'|'error')} level - The log level.
 * @param {string} msg - Log message.
 * @param {{ err: Error, moose: import('./db').Moose }} meta - Stack traces or moose.
 */
function logger(level, msg, meta) {
    if (logLevel > levels[level]) return;

    const err = meta?.err;
    const moose = meta?.moose;

    /* eslint-disable-next-line */
    console.log(JSON.stringify(
        {
            time: Date.now(),
            level,
            msg,
            err,
            moose,
        }, (k, v) => v instanceof Error ? v.stack : v,
    ));
}

module.exports = {
    debug: logger.bind(null, 'debug'),
    info:  logger.bind(null, 'info'),
    warn:  logger.bind(null, 'warn'),
    error: logger.bind(null, 'error'),
};
