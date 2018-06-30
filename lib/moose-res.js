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
'use strict';

var colors = require('irc-colors'),
    config = require(process.env.CONFIG_PATH).irc,
    reladate = require('relative-date');

var mooseColor = {
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

var mooseShade = {
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
        if (char == 't' || !colors[mooseColor[char]]) 
            return ' ';
        if (!shade || shade.length < 1 || +shade[ind] == 3)
            return colors[mooseColor[char]][`bg${mooseColor[char]}`](mooseShade['3']);
        else if (+shade[ind] == 3) {
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

function mooseTrimTransparent(orlines) {
    // copy arr
    var lines = orlines.slice();
    // top down
    var tline = /^t*$/;

    var filtered = false;
    // top down
    lines = lines.filter(line => {
        if (tline.test(line) && !filtered)
            return false;
        filtered = true;
        return true;
    });

    filtered = false;
    // bottom up
    lines = lines.slice().reverse().filter(line => {
        if (tline.test(line) && !filtered)
            return false;

        filtered = true;
        return true;
    }).reverse();

    // empty moose
    if (lines.length < 1) 
        return lines;

    // left to right
    var substr = 0;
    for (var i=0; i<lines[0].length; i++) {
        if (lines.reduce((acc, line) => {
            return line[i] == 't' && acc;
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
    for (i=lines[0].length-1; i>-1; i--) {
        if (lines.reduce((acc, line) => {
            return line[i] == 't' && acc;
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


module.exports.output = (moose, irc, unknownName, cb) => {
    if (!moose) return cb();
    var curr = 0,
        image = mooseTrimTransparent(moose.image.split('\n')),
        shade;
    if (moose.shaded) 
        shade = mooseTrimTransparent(moose.shade.split('\n'));
    else
        shade = [];

    function next() {
        if (!(curr < image.length)) {
            if (unknownName) {
                irc.reply(
                    `${colors.bold(moose.name)} - Created ${reladate(moose.created)}`
                );
            }
            else {
                irc.reply( 
                    `Created ${reladate(moose.created)}`
                );
            }
            setTimeout(cb, config.moose_delay || 5000);
            return;
        }
        irc.reply(mooseLine(image[curr], shade[curr]));
        curr++;
        setTimeout(next.bind(this), config.send_delay || 350);
    }
    next();
};

module.exports.ircLine = (moose) => {
    if (!moose) return '';
    var image = mooseTrimTransparent(moose.image.split('\n')),
        shade = mooseTrimTransparent(moose.shade.split('\n'));

    return `${image.map((line, ind) => {
        return mooseLine(line, shade[ind]);
    }).join('\n')  }\n`;
};
