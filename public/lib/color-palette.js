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

/**
 * All the color pallets and mapping form color pallet to moose.
 * @namespace
 * @property {string[]} legacyColorToMoose   - The original colors.
 * @property {string[]} colorToMooseString   - The extended colors
 *                                             repeated and function in conjecture
 *                                             with colorToShadeString.
 * @property {number[]} shadeIntensities     - Valid shade range.
 * @property {Array<string[]>} canvasPalette - All the legacy colors and their shades
 *                                             as hex color codes.
 * @property {string[]} fullPallete          - All of the colors in canvasPalette as
 *                                             one array.
 * @property {number} defaultValue           - default color for all cell (transparent).
 * @property {string[]} extendedToMooseString - all the chars making up an extended moose.
 * @property {string[]} extendedToShadeString - all the chars making up an extended moose shade.
 */
const palettes = {
    // legacy palette
    legacyColorToMoose: [
        't', '0', '1', '2', '3', '4', '5', '6','7','8','9','a','b','c','d','e','f',
    ],
    colorToMooseString: [
        't', '0', '1', '2', '3', '4', '5', '6','7','8','9','a','b','c','d','e','f',
        't', '0', '1', '2', '3', '4', '5', '6','7','8','9','a','b','c','d','e','f',
        't', '0', '1', '2', '3', '4', '5', '6','7','8','9','a','b','c','d','e','f',
        't', '0', '1', '2', '3', '4', '5', '6','7','8','9','a','b','c','d','e','f',
        't', '0', '1', '2', '3', '4', '5', '6','7','8','9','a','b','c','d','e','f',
        't', '0', '1', '2', '3', '4', '5', '6','7','8','9','a','b','c','d','e','f',
        't', '0', '1', '2', '3', '4', '5', '6','7','8','9','a','b','c','d','e','f',
    ],
    colorToShadeString: [
        't', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0',
        't', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1',
        't', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2',
        't', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3',
        't', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4',
        't', '5', '5', '5', '5', '5', '5', '5', '5', '5', '5', '5', '5', '5', '5', '5', '5',
        't', '6', '6', '6', '6', '6', '6', '6', '6', '6', '6', '6', '6', '6', '6', '6', '6',
    ],
    // for new shading feature
    shadeIntensities: [
        0, 1, 2, 3, 4, 5, 6,
    ],
    canvasPalette: [
        // 25%
        [
            'rgba(0,0,0,0)', // transparent
            '#ffffff',
            '#7d7d7d',
            '#8c8cff',
            '#88eb88',
            '#ff8c8c',
            '#ff9696',
            '#e36be3',
            '#e3e36b',
            '#ffff8c',
            '#baffba',
            '#6be3e3',
            '#8cffff',
            '#bfbfff',
            '#ff8cff',
            '#c7c7c7',
            '#fafafa',

        ],
        // 50%
        [
            'rgba(0,0,0,0)', // transparent
            '#ffffff',
            '#525252',
            '#5b5bd4',
            '#5bc25b',
            '#ff5e5e',
            '#db6767',
            '#d45bd4',
            '#d4d45b',
            '#ffff5e',
            '#8cff8c',
            '#5bd4d4',
            '#5effff',
            '#7a7aff',
            '#ff5eff',
            '#ababab',
            '#ebebeb',
        ],
        // 75%
        [
            'rgba(0,0,0,0)', // transparent
            '#ffffff',
            '#292929',
            '#2e2eab',
            '#2f992f',
            '#ff3030',
            '#b03a3a',
            '#ab2eab',
            '#abab2e',
            '#ffff30',
            '#5eff5e',
            '#2eabab',
            '#30ffff',
            '#3030ff',
            '#ff30ff',
            '#8f8f8f',
            '#dedede',
        ],
        // legacy colors - 100%
        [
            'rgba(0,0,0,0)', // transparent
            '#ffffff', // white
            '#000000', // black
            '#000080', // navy
            '#008000', // green
            '#ff0000', // red
            '#a52a2a', // brown
            '#800080', // purple
            '#808000', // olive
            '#ffff00', // yellow
            '#00ff00', // lime
            '#008080', // teal
            '#00ffff', // cyan
            '#0000ff', // blue
            '#ff00ff', // fuchsia
            '#808080', // grey
            '#d3d3d3', // lightgrey
        ],
        // 125%
        [
            'rgba(0,0,0,0)', // transparent
            '#f0f0f0',
            '#000000',
            '#00006e',
            '#005200',
            '#cf0000',
            '#941c1c',
            '#4d004d',
            '#525200',
            '#cfcf00',
            '#00cf00',
            '#006e6e',
            '#00cfcf',
            '#0000b3',
            '#cf00cf',
            '#6e6e6e',
            '#c2c2c2',
        ],
        // 150%
        [
            'rgba(0,0,0,0)', // transparent
            '#e0e0e0',
            '#000000',
            '#00005c',
            '#004000',
            '#a10000',
            '#660000',
            '#3b003b',
            '#404000',
            '#a1a100',
            '#00a100',
            '#005c5c',
            '#00a1a1',
            '#00008a',
            '#a100a1',
            '#5c5c5c',
            '#b3b3b3',
        ],
        // 175%
        [
            'rgba(0,0,0,0)', // transparent
            '#cfcfcf',
            '#000000',
            '#00004d',
            '#002e00',
            '#6e0000',
            '#380000',
            '#2b002b',
            '#2e2e00',
            '#737300',
            '#007300',
            '#004d4d',
            '#007373',
            '#00007a',
            '#730073',
            '#3b3b3b',
            '#a3a3a3',
        ],
    ],
    // for gridpaint, concat of above
    fullPallete: [],
    // This is the default because it maps to the UNSHADED transparent
    // color, All transparent values will map to this
    // This prevents a bug where "transparent" pencil does not "erase"
    // as reported in: https://github.com/adedomin/moose/issues/10
    defaultValue: 51, // transparent in unshaded
    // new mIRC-based Colors (16-99).
    // see: http://anti.teamidiot.de/static/nei/*/extended_mirc_color_proposal.html
    smallExtendedToMoose: [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 't',
    ],
    extendedToMooseString: [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 't',
    ],
    extendedToShadeString: [
        '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0',
        '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '1',
        '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2',
        '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3',
        '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4',
        '5', '5', '5', '5', '5', '5', '5', '5', '5', '5', '5', '5',
        '6', '6', '6', '6', '6', '6', '6', '6', '6', '6', '6', 't',
    ],
    extendedColors: [
        // darkest
        [
            '#470000', // code 16 0
            '#472100', // code 17 1
            '#474700', // code 18 2
            '#324700', // code 19 3
            '#004700', // code 20 4
            '#00472c', // code 21 5
            '#004747', // code 22 6
            '#002747', // code 23 7
            '#000047', // code 24 8
            '#2e0047', // code 25 9
            '#470047', // code 26 a
            '#47002a', // code 27 b
        ],
        [
            '#740000', // code 28
            '#743a00', // code 29
            '#747400', // code 30
            '#517400', // code 31
            '#007400', // code 32
            '#007449', // code 33
            '#007474', // code 34
            '#004074', // code 35
            '#000074', // code 36
            '#4b0074', // code 37
            '#740074', // code 38
            '#740045', // code 39
        ],
        [
            '#b50000', // code 40
            '#b56300', // code 41
            '#b5b500', // code 42
            '#7db500', // code 43
            '#00b500', // code 44
            '#00b571', // code 45
            '#00b5b5', // code 46
            '#0063b5', // code 47
            '#0000b5', // code 48
            '#7500b5', // code 49
            '#b500b5', // code 50
            '#b5006b', // code 51 end of column
        ],
        [
            '#ff0000', // code 52
            '#ff8c00', // code 53
            '#ffff00', // code 54
            '#b2ff00', // code 55
            '#00ff00', // code 56
            '#00ffa0', // code 57
            '#00ffff', // code 58
            '#008cff', // code 59
            '#0000ff', // code 60
            '#a500ff', // code 61
            '#ff00ff', // code 62
            '#ff0098', // code 63
        ],
        [
            '#ff5959', // code 64
            '#ffb459', // code 65
            '#ffff71', // code 66
            '#cfff60', // code 67
            '#6fff6f', // code 68
            '#65ffc9', // code 69
            '#6dffff', // code 70
            '#59b4ff', // code 71
            '#5959ff', // code 72
            '#c459ff', // code 73
            '#ff66ff', // code 74
            '#ff59bc', // code 75
        ],
        // lightest
        [
            '#ff9c9c', // code 76
            '#ffd39c', // code 77
            '#ffff9c', // code 78
            '#e2ff9c', // code 79
            '#9cff9c', // code 80
            '#9cffdb', // code 81
            '#9cffff', // code 82
            '#9cd3ff', // code 83
            '#9c9cff', // code 84
            '#dc9cff', // code 85
            '#ff9cff', // code 86
            '#ff94d3', // code 87
        ],
        // black. greys, white, transparent.
        [
            '#000000', // code 88
            '#131313', // code 89
            '#282828', // code 90
            '#363636', // code 91
            '#4d4d4d', // code 92
            '#656565', // code 93
            '#818181', // code 94
            '#9f9f9f', // code 95
            '#bcbcbc', // code 96
            '#e2e2e2', // code 97
            '#ffffff', // code 98
            'rgba(0,0,0,0)', // transparent (code 99)
        ],
    ],
    fullExtendedColors: [],
    extendedColorsDefault: 83,
};

palettes.fullPallete = palettes
    .canvasPalette
    .reduce((full, part) => {
        return full.concat(part);
    });
palettes.fullExtendedColors = palettes
    .extendedColors
    .reduce((full, part) => {
        return full.concat(part);
    });

// pick default transparency based on palette
const defaultColor = (state) => {
    return state.moose.extended
        ? palettes.extendedColorsDefault
        : palettes.defaultValue;
};

// force defaults on the painting to the default (51)
// SEE: comment in public/lib/color-palette.js for defaultValue
const setDefaultsOnClear = (state) => {
    const def = defaultColor(state);
    for (let i = 0; i < state.painter.height; ++i) {
        for (let j = 0; j < state.painter.width; ++j) {
            state.painter.painting[i][j] = def;
        }
    }
};

module.exports = {
    palettes,
    defaultColor,
    setDefaultsOnClear,
};
