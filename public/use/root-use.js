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

const GridPaint = require('gridpaint');
const api = require('../lib/api.js');
const {
    mooseToGrid,
    mooseShadeToGrid,
    gridToMoose,
    gridToShade,
} = require('../lib/moose-grid.js');
const sizeInfo = require('../lib/moose-size.js');
const colors = require('../lib/color-palette.js');
const { getParameterByName } = require('../lib/helpers.js');

const isRootRoute = /^#(\?.*)?$/;

module.exports = function(state, emitter) {
    state.title = {
        msg: 'Make a Moose today',
        status: 'primary',
    };

    state.moose = {
        name: '',
        hd: false,
        shaded: true,
    };

    let newPainter = () => {
        state.painter = new GridPaint({
            width:
                state.moose.hd ?
                    sizeInfo.hd.width :
                    sizeInfo.normal.width,
            height:
                state.moose.hd ?
                    sizeInfo.hd.height :
                    sizeInfo.normal.height,
            cellWidth: 16,
            cellHeight: 24,
            palette: colors.fullPallete,
            outline: true,
        });
        state.painter.tool = 'pencil';
        state.painter.color = 0;
        state.painter.colour = 0;
        state.painter.grid = true;
    };

    let destoryPainter = () => {
        state.painter.destroy();
        if (state.painter.dom) {
            state.painter.dom
                .parentNode
                .removeChild(
                    state.painter.dom,
                );
        }
    };

    newPainter();
    state.tools = [
        'pencil',
        'bucket',
        'checkered',
        'grid',
        'undo',
        'redo',
        'hd',
        'shaded',
        'clear',
    ];

    emitter.on('color-select', (color) => {
        state.painter.colour = color;
        emitter.emit('render');
    });

    emitter.on('tool-select', (action) => {
        let temp;
        if (action == 'pencil' || action == 'bucket') {
            state.painter.tool = action;
        }
        else if (action === 'checkered') {
            state.painter.background = !state.painter.background;
        }
        else if (action === 'grid') {
            state.painter.grid = !state.painter.grid;
        }
        else if (action === 'shaded') {
            state.moose.shaded = !state.moose.shaded;
            if (!state.moose.shaded) {
                temp = state.painter.painting;
                state.painter.painting = temp.map(arr => {
                    return arr.map(color => {
                        return (color % 17) + (3 * 17);
                    });
                });
                state.painter.colour = (state.painter.colour % 17) + (3 * 17);
            }
        }
        else if (action === 'hd') {
            state.moose.hd = !state.moose.hd;
            destoryPainter();
            temp = state.painter.painting;
            // resize image for new canvas
            if (state.moose.hd) {
                temp = temp.concat(Array.from({
                    length: sizeInfo.hd.height - temp.length,
                }).fill([]));
                temp.forEach((arr, i) => {
                    temp[i] = arr.concat(Array.from({
                        length: sizeInfo.hd.width - arr.length,
                    }, () => 0));
                });
            }
            else {
                temp.splice(
                    sizeInfo.normal.height,
                    temp.length - sizeInfo.normal.height,
                );
                temp.forEach(arr => {
                    arr.splice(
                        sizeInfo.normal.width,
                        arr.length - sizeInfo.normal.width,
                    );
                });
            }
            newPainter();
            state.painter.painting = temp;
            state.painter.init();
        }
        else {
            state.painter[action]();
        }
        emitter.emit('render');
    });

    emitter.on('moose-name-change', (name) => {
        state.moose.name = name;
    });

    emitter.on('moose-save', () => {
        if (state.moose.shaded)
            state.moose.shade = gridToShade(state.painter.painting);
        state.moose.image = gridToMoose(state.painter.painting);
        api.saveMoose(state.moose, (err, body) => {
            if (err || !body || body.status == 'error') {
                if (!body) body = {
                    msg: err.toString() || 'unknown error',
                };
                if (typeof body.msg == 'object')
                    body.msg = JSON.stringify(body.msg);
                state.title.msg =
                    `failed to save moose: ${body.msg}`;
                state.title.status = 'danger';
            }
            else {
                state.title.msg = body.msg;
                state.title.status = 'success';
            }

            emitter.emit('render');
        });
    });

    emitter.on('moose-edit', (editmoose) => {
        state.moose.name = editmoose || '';
        state.title.msg = `editing ${editmoose}...`;
        api.getMoose(editmoose, (err, body) => {
            if (!err && body && body.image) {
                // not all moose have the hd field
                // this will convert undefined/null
                // to false
                body.hd = !!body.hd;
                if (state.moose.hd != body.hd) {
                    state.moose.hd = body.hd;
                    destoryPainter();
                    newPainter();
                    state.painter.init();
                }

                state.moose.shaded = body.shaded;
                if (body.shaded) {
                    state.painter.painting = mooseShadeToGrid(body.image,body.shade);
                }
                else {
                    state.painter.painting = mooseToGrid(body.image);
                }
            }
            emitter.emit('render');
        });
    });

    emitter.on('pushState', () => {
        if (!isRootRoute.test(window.location.hash)) return;
        if (getParameterByName('edit'))
            emitter.emit('moose-edit', getParameterByName('edit'));
    });

    state.painter.init();
    if (getParameterByName('edit')) {
        emitter.emit('moose-edit', getParameterByName('edit'));
    }

    emitter.on('*', () => {
        if (state.painter.drawing) return;
        state.painter.draw();
    });
};
