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
    mooseExtendedToGrid,
    gridToMoose,
    gridToShade,
    gridToExtendedMoose,
    gridToExtendedShade,
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
        shaded: false,
        extended: true,
    };

    // pick default transparency based on palette
    const defaultColor = () => {
        return state.moose.extended
            ? colors.extendedColorsDefault
            : colors.defaultValue;
    };

    // force defaults on the painting to the default (51)
    // SEE: comment in public/lib/color-palette.js for defaultValue
    const setDefaultsOnClear = () => {
        for (let i = 0; i < state.painter.height; ++i) {
            for (let j = 0; j < state.painter.width; ++j) {
                state.painter.painting[i][j] = defaultColor();
            }
        }
    };

    const newPainter = () => {
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
            palette: state.moose.extended
                ? colors.fullExtendedColors
                : colors.fullPallete,
            outline: true,
        });

        state.painter.tool = 'pencil';
        state.painter.color = defaultColor();
        state.painter.colour = defaultColor();
        state.painter.grid = true;

        setDefaultsOnClear();
    };

    const destoryPainter = () => {
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
        '82c',
        'save png',
        'clear',
    ];

    emitter.on('color-select', (color) => {
        state.painter.colour = color;
        emitter.emit('render');
    });

    emitter.on('tool-select', (action) => {
        if (action === 'pencil' || action === 'bucket') {
            state.painter.tool = action;
        }
        else if (action === 'checkered') {
            state.painter.background = !state.painter.background;
        }
        else if (action === 'grid') {
            state.painter.grid = !state.painter.grid;
        }
        else if (action === 'shaded' || action === '82c') {
            state.moose.extended = action === '82c'
                ? !state.moose.extended
                : state.moose.extended;
            state.moose.shaded = action === 'shaded'
                ? !state.moose.shaded
                : state.moose.shaded;
            if (state.moose.extended && state.moose.shaded) {
                if (action === 'shaded') state.moose.extended = false;
                else state.moose.shaded = false;
            }

            if (state.moose.extended) {
                state.moose.shaded = false;
                state.painter.palette = colors.fullExtendedColors;
                state.painter.painting = state.painter.painting.map(arr => {
                    return arr.map(color => {
                        if (color === colors.defaultValue) {
                            return colors.extendedColorsDefault;
                        }
                        else {
                            // clamp color to max palette range, this does destroy the paining
                            return Math.max(
                                0,
                                Math.min(color, colors.fullExtendedColors.length),
                            );
                        }
                    });
                });
            }
            else if (state.moose.shaded) {
                state.moose.extended = false;
                state.painter.palette = colors.fullPallete;
            }
            else if (!state.moose.shaded && !state.moose.extended) {
                state.painter.palette = colors.fullPallete;
                state.painter.painting = state.painter.painting.map(arr => {
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
            let temp = state.painter.painting;
            // resize image for new canvas
            if (state.moose.hd) {
                temp = temp.concat(Array.from(
                    { length: sizeInfo.hd.height - temp.length },
                    () => Array.from(
                        { length: temp.length },
                        () => defaultColor(),
                    ),
                ));
                temp.forEach((arr, i) => {
                    temp[i] = arr.concat(Array.from({
                        length: sizeInfo.hd.width - arr.length,
                    }, () => defaultColor()));
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
        else if (action === 'save png') {
            state.painter.saveAs(
                state.moose.name
                    ? `${state.moose.name}.png`
                    : 'moose.png',
            );
        }
        else if (action === 'clear') {
            state.painter.clear();
            setDefaultsOnClear();
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
        if (state.moose.shaded || state.moose.extended) {
            state.moose.shade = state.moose.extended
                ? gridToExtendedShade(state.painter.painting)
                : gridToShade(state.painter.painting);
        }

        state.moose.image = state.moose.extended
            ? gridToExtendedMoose(state.painter.painting)
            : gridToMoose(state.painter.painting);

        api.saveMoose(state.moose, (err, body) => {
            if (err || !body || body.status === 'error') {
                if (!body) {
                    body = { msg: err.toString() || 'unknown error' };
                }

                if (typeof body.msg === 'object') {
                    body.msg = JSON.stringify(body.msg);
                }

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
                body.shaded = !!body.shaded;
                body.extended = !!body.extended;
                if (state.moose.hd !== body.hd) {
                    state.moose.hd = body.hd;
                    destoryPainter();
                    newPainter();
                    state.painter.init();
                }

                if (body.shaded) {
                    state.moose.shaded = true;
                    state.moose.extended = false;
                    state.painter.palette = colors.fullPallete;
                    state.painter.painting = mooseShadeToGrid(body.image, body.shade);
                }
                else if (body.extended) {
                    state.moose.extended = true;
                    state.moose.shaded = false;
                    state.painter.palette = colors.fullExtendedColors;
                    state.painter.painting = mooseExtendedToGrid(body.image, body.shade);
                }
                else {
                    state.moose.shaded = false;
                    state.moose.extended = false;
                    state.painter.palette = colors.fullPallete;
                    state.painter.painting = mooseToGrid(body.image);
                }
            }
            emitter.emit('render');
        });
    });

    emitter.on('pushState', () => {
        if (!isRootRoute.test(window.location.hash)) return;
        if (getParameterByName('edit')) {
            emitter.emit('moose-edit', getParameterByName('edit'));
        }
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
