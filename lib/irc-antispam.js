/*
 * Copyright (c) 2018, Anthony DeDominic <adedomin@gmail.com>
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

const process = require('process');

// prevent spam of bots,
// help and source command and moose --help --search
// period is in ms
class Antispam {
    constructor(period) {
        this.period = period;
        this.map = new Map();
    }
    static monotonicTime() {
        let [ sec, nano ] = process.hrtime();
        return Math.round(sec * 1000 + nano / 1000000);
    }
    check(channel) {
        if (!this.map.get(channel) ||
            Antispam.monotonicTime() -
                this.map.get(channel) >= this.period
        ) {
            this.map.set(channel, Antispam.monotonicTime());
            return false;
        }
        return true;
    }
}

module.exports = Antispam
