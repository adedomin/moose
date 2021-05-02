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

// PNG features
const { GridPaint } = require('gridpaint');
const sizeInfo = require('../public/lib/moose-size.js');
const {
    palettes: {
        fullPallete,
        fullExtendedColors,
    },
} = require('../public/lib/color-palette.js');
const {
    mooseToGrid,
    mooseShadeToGrid,
    mooseExtendedToGrid,
} = require('../public/lib/moose-grid.js');

// irc line feature
const reladate = require('relative-date');

const mooseShade = [
    [ 0,  '░' ],
    [ 0,  '▒' ],
    [ 0,  '▓' ],
    [ -1, '█' ],
    [ 1,  '▓' ],
    [ 1,  '▒' ],
    [ 1,  '░' ],
];

/** @typedef {'0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'a'|'b'|'c'|'d'|'e'|'f'|'t'} Hexdigit */

/**
 * Emit a singular "pixel" in a Moose.
 * NOTE: mIRC will see \x0301text as default foreground for text
 *       you must specify a background to force it "black"
 *
 * @param {Hexdigit} fore Foreground color.
 * @param {Hexdigit} back Background color.
 * @param {string}   str  The block to draw with.
 * @returns {string} the "pixel"
 */
function ircShadedPixel(fore, back, str) {
    const f = parseInt(fore, 16);
    const b = parseInt(back, 16);
    return `\x03${f},${b}${str}\x03`;
}
/**
 * Generate the color code for a given extended irc color.
 * @param {Hexdigit} color
 * @param {Hexdigit} shade
 * @returns {number} the color code.
 */
function extendedColorCode(color, shade) {
    return 16 + parseInt(color, 16) + (12 * parseInt(shade, 16));
}

/**
 * Emit a singular "pixel" in a Moose (extended).
 * @param {number} fore Foreground color.
 * @param {number} back background color.
 * @returns {string} the "pixel"
 */
function ircPixel(fore, back) {
    // start at 16 to 99
    return `\x03${fore},${back}@\x03`;
}

/** @enum {number} */
const MooseLineTypes = {
    legacy: 0,
    shaded: 1,
    extended: 2,
};

/**
 * Takes a Moose's image and shade property and turns it into irc art.
 * @param {Hexdigit[][]} image
 * @param {Hexdigit[][]} shadeImg
 * @param {MooseLineTypes} type If moose is 82 color (extended), shaded or 16 color (legacy).
 * @returns {string} The IRC message to emit.
 */
function mooseLine(image, shadeImg, type = MooseLineTypes.shaded) {
    let retLine = '';
    for (let i = 0; i < image.length; ++i) {
        const line = image[i];
        const shadeLine = shadeImg[i];

        for (let j = 0; j < line.length; ++j) {
            const char = line[j];
            const shade = !shadeLine ? '3' : shadeLine[j];

            if (char === 't') {
                retLine += ' ';
            }
            else {
                switch (type) {
                case MooseLineTypes.legacy:
                    {
                        const c = parseInt(char, 16);
                        retLine += ircPixel(c, c);
                    }
                    break;
                case MooseLineTypes.extended:
                    {
                        const c = extendedColorCode(char, shade);
                        retLine += ircPixel(c, c);
                    }
                    break;
                case MooseLineTypes.shaded:
                    {
                        const [ shadeBgColor, boxChr ] = mooseShade[shade];
                        retLine += ircShadedPixel(
                            char,
                            (shadeBgColor === -1 ? char : shadeBgColor),
                            boxChr,
                        );
                    }
                    break;
                }
            }
        }
        retLine += '\n';
    }
    return retLine;
}

/**
 * Trim all transparent lines around a Moose
 * @param {string[]} originalLines
 * @returns {string[]} trimmed copy of originalLines.
 */
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

/**
 * Convert a Moose to a PNG.
 *
 * @param {Moose} moose
 * @returns Promise<Blob>
 */
module.exports.pngOutput = (moose) => {
    const painter = new GridPaint({
        width: moose.hd
            ? sizeInfo.hd.width
            : sizeInfo.normal.width,
        height: moose.hd
            ?  sizeInfo.hd.height
            : sizeInfo.normal.height,
        cellWidth: 16,
        cellHeight: 24,
        palette: moose.extended
            ? fullExtendedColors
            : fullPallete,
    });

    painter.painting = moose.shaded
        ? mooseShadeToGrid(moose.image, moose.shade)
        : moose.extended
            ? mooseExtendedToGrid(moose.image, moose.shade)
            : mooseToGrid(moose.image);
    painter.colour = 0;

    return painter.saveAs();
};

/**
 * Convert a Moose into IRC Lines
 * @param {import('./db').Moose} moose
 * @returns {string}
 */
module.exports.ircLine = (moose) => {
    if (!moose) return '';
    let image = mooseTrimTransparent(moose.image.split('\n'));
    let shade = [];
    if (moose.shaded || moose.extended) {
        shade = mooseTrimTransparent(moose.shade.split('\n'));
    }

    const type = moose.extended
        ? MooseLineTypes.extended
        : moose.shaded
            ? MooseLineTypes.shaded
            : MooseLineTypes.legacy;

    const relativeDate = reladate(moose.created);
    return mooseLine(image, shade, type) +
        '\x02' + moose.name + '\x02' +
        ' - ' + relativeDate + '\n';
};
