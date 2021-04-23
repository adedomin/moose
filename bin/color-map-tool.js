#!/usr/bin/env node
/*
 * Copyright (c) 2021 Anthony DeDominic <adedomin@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

'use strict';

const diff = require('color-diff');
const { palettes } = require('../public/lib/color-palette.js');
const {
    fullPallete,
    fullExtendedColors,
    canvasPalette,
    extendedColorsDefault,
    defaultValue,
} = palettes;
const { argv } = require('process');

function toRGB(color, pos) {
    if (color === 'rgba(0,0,0,0)') {
        return { R: 0, G: 0, B: 0, A: 0, pos };
    }
    const rgb = parseInt(color.slice(1), 16);
    const R = rgb >> 16 ;
    const G = ( rgb >> 8 ) & 0xFF;
    const B = rgb & 0xFF;
    return { R, G, B, A: 255, pos };
}

// function fromRGB({ R, G, B, A }) {
//     if (R === 0 && G === 0 && B === 0 && A === 0) {
//         return 'rgba(0,0,0,0)';
//     }
//     const rgb = R << 16 | G << 8 | B;
//     return '#' + rgb.toString(16).padStart(6, '0');
// }

const originalColorsRGB = canvasPalette[3].map(toRGB);
const fullPalleteRGB = fullPallete.map(toRGB);
const fullExtendedColorsRGB = fullExtendedColors.map(toRGB);

if (argv.length < 3) {
    console.log(`"usage: bin/color-map-tool.js shade|82c|16c"`);
}
else if (argv[2] === 'shade') {
    const result = Array.from({ length: fullPalleteRGB.length });
    for (const rgb of fullPalleteRGB) {
        if (rgb.A === 0) {
            result[rgb.pos] = extendedColorsDefault;
        }
        else {
            const closest = diff.closest(rgb, fullExtendedColorsRGB);
            result[rgb.pos] = closest.pos;
        }
    }
    console.log(JSON.stringify(result));
}
else if (argv[2] === '82c') {
    const result = Array.from({ length: fullExtendedColorsRGB.length });
    for (const rgb of fullExtendedColorsRGB) {
        if (rgb.A === 0) {
            result[rgb.pos] = defaultValue;
        }
        else {
            const closest = diff.closest(rgb, fullPalleteRGB);
            result[rgb.pos] = closest.pos;
        }
    }
    console.log(JSON.stringify(result));
}
else if (argv[2] === '16c') {
    const result = Array.from({ length: originalColorsRGB.length });
    for (const rgb of fullExtendedColorsRGB) {
        if (rgb.A === 0) {
            result[rgb.pos] = defaultValue;
        }
        else {
            const closest = diff.closest(rgb, originalColorsRGB);
            result[rgb.pos] = closest.pos + defaultValue;
        }
    }
    console.log(JSON.stringify(result));
}
