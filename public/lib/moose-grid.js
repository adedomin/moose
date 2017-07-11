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

var colors = require('./color-palette')

module.exports.mooseToGrid = function mooseToGrid(image) {
    return image.split('\n').map(str => {
        return str.split('').map(char => {
            return colors.colorToMooseString.indexOf(char)+51
        })
    })
}

module.exports.mooseShadeToGrid = function mooseShadeToGrid(image,shader) {
    var shadeLayer = shader.split('\n').map(str =>{
        return str.split('').map(char=>{
            return +char || 0
        })
    })

    return image.split('\n').map((str,ind) => {
        return str.split('').map((char,ind2) => {
            return colors.legacyColorToMoose.indexOf(char)+(17*shadeLayer[ind][ind2])
        })
    })
}

module.exports.gridToMoose = function(painting) {
    return painting.map(arr => {
        return arr.map(char => {
            if (isNaN(char)) char = 0
            return colors.colorToMooseString[char]
        }).join('')
    }).join('\n')
}

module.exports.gridToShade = function(painting) {
    return painting.map(arr => {
        return arr.map(char => {
            if (isNaN(char)) char = 0
            return colors.colorToShadeString[char]
        }).join('')
    }).join('\n')
}
