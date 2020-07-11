/*
 * Copyright (C) 2017 Anthony DeDominic <adedomin@gmail.com>, Underdoge
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

var palettes = {
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
            'transparent',
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
            'transparent',
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
            'transparent',
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
            'transparent',
            'white',
            'black',
            'navy',
            'green',
            'red',
            'brown',
            'purple',
            'olive',
            'yellow',
            'lime', 
            'teal',
            'cyan',
            'blue',
            'fuchsia',
            'grey',
            'lightgrey',
        ],
        // 125%
        [
            'transparent',
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
            'transparent',
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
            'transparent',
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
};

palettes.fullPallete = palettes
    .canvasPalette
    .reduce((full, part) => {
        return full.concat(part);
    });

module.exports = palettes;
