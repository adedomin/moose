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
const GridPaint = require('gridpaint');
const sizeInfo = require('../public/lib/moose-size.js');
const gridPaintColors = require('../public/lib/color-palette.js');
const {
    mooseToGrid,
    mooseShadeToGrid,
    mooseExtendedToGrid,
} = require('../public/lib/moose-grid.js');

const mooseShade = [
    [ 0,  '░' ],
    [ 0,  '▒' ],
    [ 0,  '▓' ],
    [ -1, '█' ],
    [ 1,  '▓' ],
    [ 1,  '▒' ],
    [ 1,  '░' ],
];


// NOTE: mIRC will see \x0301text as default foreground for text
//       you must specify a background to force it "black"
function ircColor(fore, back, str) {
    return `\x03${parseInt(fore, 16)},${parseInt(back, 16)}${str}\x03`;
}

function extendedIrcColor(color, shade) {
    // start at 16 to 99
    const c = 16 + parseInt(color, 16) + (12 * parseInt(shade, 16));
    return `\x03${c},${c}@\x03`;
}

function mooseLine(image, shadeImg, extended = false) {
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
            else if (!extended) {
                const [ shadeBgColor, boxChr ] = mooseShade[shade];
                retLine += ircColor(
                    char,
                    (shadeBgColor === -1 ? char : shadeBgColor),
                    boxChr,
                );
            }
            else {
                retLine += extendedIrcColor(char, shade);
            }
        }
        retLine += '\n';
    }
    return retLine;
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
            ? gridPaintColors.fullExtendedColors
            : gridPaintColors.fullPallete,
    });

    painter.background = false;
    painter.painting = moose.shaded
        ?  mooseShadeToGrid(moose.image, moose.shade)
        : moose.extended
            ? mooseExtendedToGrid(moose.image, moose.shade)
            : mooseToGrid(moose.image);
    painter.color = 0; // remove dumb errors
    painter.colour = 0;
    painter.drawing = false;

    return painter.saveAs();
};

module.exports.ircLine = (moose) => {
    if (!moose) return '';
    let image = mooseTrimTransparent(moose.image.split('\n'));
    let shade = [];
    if (moose.shaded || moose.extended) {
        shade = mooseTrimTransparent(moose.shade.split('\n'));
    }

    return mooseLine(image, shade, moose.extended);
};
