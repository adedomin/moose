/*
 * Copyright (C) 2017 Anthony DeDominic <adedomin@gmail.com>
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

var colorToMooseString = [
    't',
    '0', '1', '2', '3', 
    '4', '5', '6', '7',
    '8', '9', 'a', 'b',
    'c', 'd', 'e', 'f',
]

module.exports.mooseToGrid = function mooseToGrid(image) {
    return image.split('\n').map(str => {
        return str.split('').map(char => {
            return colorToMooseString.indexOf(char)
        })
    })
}

module.exports.gridToMoose = function(painting) {
    return painting.map(arr => {
        return arr.map(char => {
            return colorToMooseString[char]
        }).join('')
    }).join('\n')
}
