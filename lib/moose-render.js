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

const colors = require('irc-colors');
const config = require(process.env.CONFIG_PATH).irc;
const reladate = require('relative-date');

// PNG features
const GridPaint = require('gridpaint');
const sizeInfo = require('../public/lib/moose-size.js');
const gridPaintColors = require('../public/lib/color-palette.js');
const {
    mooseToGrid,
    mooseShadeToGrid,
} = require('../public/lib/moose-grid.js');
const dflt = require('./default.js');

const mooseColor = {
    0: 'white',
    1: 'black',
    2: 'navy',
    3: 'green',
    4: 'red',
    5: 'brown',
    6: 'purple',
    7: 'olive',
    8: 'yellow',
    9: 'lime',
    a: 'teal',
    b: 'cyan',
    c: 'blue',
    d: 'pink',
    e: 'gray',
    f: 'silver',
};

const mooseShade = {
    0: '░',
    1: '▒',
    2: '▓',
    3: '█',
    4: '▓',
    5: '▒',
    6: '░',
};

function mooseLine(line, shade) {
    return line.split('').map((char, ind) => {
        if (char === 't' || !colors[mooseColor[char]]) {
            return ' ';
        }

        if (!shade || shade.length < 1 || +shade[ind] === 3) {
            return colors[mooseColor[char]][`bg${mooseColor[char]}`](mooseShade['3']);
        }
        else if (+shade[ind] < 3) {
            return colors[mooseColor[char]].bgwhite(mooseShade[shade[ind]]);
        }
        else {
            return colors[mooseColor[char]].bgblack(mooseShade[shade[ind]]);
        }
    }).join('');
}

function mooseTrimTransparent(originalLines) {
    let lines = originalLines.slice();
    // transparent line
    const tline = /^t*$/;

    // top down
    let skipStart = lines.findIndex(line => !tline.test(line));
    if (skipStart > 0) lines = lines.slice(skipStart);

    // bottom up
    skipStart = lines.slice().reverse().findIndex(line => !tline.test(line));
    if (skipStart > 0) lines = lines.slice(0, lines.length - skipStart);

    // empty moose
    if (lines.length < 1) return lines;

    // left to right
    let substr = 0;
    for (let i=0; i<lines[0].length; i++) {
        if (lines.reduce((acc, line) => {
            return line[i] === 't' && acc;
        }, true)) {
            substr++;
        }
        else {
            break;
        }
    }

    // trim all moose by substr
    if (substr > 0) {
        lines = lines.map(line => {
            return line.substring(substr);
        });
    }

    // right left
    substr = 0;
    for (let i=lines[0].length-1; i>-1; i--) {
        if (lines.reduce((acc, line) => {
            return line[i] === 't' && acc;
        }, true)) {
            substr++;
        }
        else {
            break;
        }
    }

    if (substr > 0) {
        lines = lines.map(line => {
            return line.substring(0, line.length - substr);
        });
    }

    return lines;
}


module.exports.output = (moose, irc, raw, unknownName, cb) => {
    if (!moose) return cb();
    let curr = 0;
    let image = mooseTrimTransparent(moose.image.split('\n'));
    let shade = [];
    if (moose.shaded) {
        shade = mooseTrimTransparent(moose.shade.split('\n'));
    }

    function next() {
        if (!(curr < image.length)) {
            if (unknownName) {
                irc.reply(
                    `${colors.bold(moose.name)} - Created ${reladate(moose.created)}`,
                );
            }
            else {
                irc.reply(
                    `Created ${reladate(moose.created)}`,
                );
            }
            setTimeout(cb, dflt(config.moose_delay, 5000));
            return;
        }
        raw(`PRIVMSG ${irc.target} :${mooseLine(image[curr], shade[curr])}`);
        curr++;
        setTimeout(next.bind(this), dflt(config.send_delay, 350));
    }
    next();
};

module.exports.pngOutput = (moose) => {
    let painter = new GridPaint({
        width: moose.hd ?
            sizeInfo.hd.width :
            sizeInfo.normal.width,
        height: moose.hd ?
            sizeInfo.hd.height :
            sizeInfo.normal.height,
        cellWidth: 16,
        cellHeight: 24,
        palette: gridPaintColors.fullPallete,
    });

    painter.background = false;
    painter.painting = moose.shaded ?
        mooseShadeToGrid(moose.image, moose.shade) : mooseToGrid(moose.image);
    painter.color = 0; // remove dumb errors
    painter.colour = 0;
    painter.drawing = false;

    return painter.saveAs();
};

module.exports.ircLine = (moose) => {
    if (!moose) return '';
    let image = mooseTrimTransparent(moose.image.split('\n'));
    let shade = [];
    if (moose.shaded) {
        shade = mooseTrimTransparent(moose.shade.split('\n'));
    }

    return `${image.map((line, ind) => {
        return mooseLine(line, shade[ind]);
    }).join('\n')  }\n`;
};
