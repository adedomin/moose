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

const { palettes: colors } = require('./color-palette');

/**
 * Legacy Moose to gridpaint image.
 * @param {string} image - a moose.image string.
 * @return {number[][]} a string to a gridpain canvas.
 */
module.exports.mooseToGrid = function(image) {
    return image.split('\n').map(str => {
        return str.split('').map(char => {
            return colors.colorToMooseString.indexOf(char)+colors.defaultValue;
        });
    });
};

/**
 * Shaded Moose or Extended Moose to gridpaint image.
 * @param {number} rowlen - length of colors in a shade row.
 * @param {string[]} charToColor - moose string positions.
 * @param {number} transDefault - default transparent color number.
 * @param {string} image - a Moose.image string.
 * @param {string} shade - a Moose.shade string.
 * @return {number[][]} a string to a gridpain canvas.
 */
function mooseShadeToGrid(rowlen, charToColor, transDefault, image, shade) {
    const shadeLayer = shade.split('\n').map(str =>{
        return str.split('').map(char=>{
            return +char || 0;
        });
    });

    return image.split('\n').map((str,ind) => {
        return str.split('').map((char,ind2) => {
            if (char === 't') return transDefault;
            return charToColor.indexOf(char)+(rowlen*shadeLayer[ind][ind2]);
        });
    });
}

/**
   @see {mooseShadeToGrid}
   @param {string} image
   @param {string} shade
   @return {number[][]}
*/
module.exports.mooseShadeToGrid = mooseShadeToGrid.bind(
    null,
    colors.legacyColorToMoose.length,
    colors.legacyColorToMoose,
    colors.defaultValue,
);

/**
   @see {mooseShadeToGrid}
   @param {string} image
   @param {string} shade
   @return {number[][]}
*/
module.exports.mooseExtendedToGrid = mooseShadeToGrid.bind(
    null,
    colors.smallExtendedToMoose.length - 1, // transparent is 83
    colors.smallExtendedToMoose,
    colors.extendedColorsDefault,
);

/**
 * Convert a gridpaint canvas to a moose.image string
 * @param {number[][]} painting - a grid paint painting
 * @return {string} moose image string.
 */
function gridToMooseImage(paletteString, transparentInd, painting) {
    return painting.map(arr => {
        return arr.map(char => {
            if (isNaN(char)) char = transparentInd;
            return paletteString[char];
        }).join('');
    }).join('\n');
}

module.exports.gridToMoose = gridToMooseImage.bind(
    null,
    colors.colorToMooseString,
    colors.defaultValue,
);
module.exports.gridToShade = gridToMooseImage.bind(
    null,
    colors.colorToShadeString,
    0,
);
module.exports.gridToExtendedMoose = gridToMooseImage.bind(
    null,
    colors.extendedToMooseString,
    colors.extendedColorsDefault,
);
module.exports.gridToExtendedShade = gridToMooseImage.bind(
    null,
    colors.extendedToShadeString,
    colors.extendedColorsDefault,
);
