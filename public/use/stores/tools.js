// Copyright (C) 2021  Anthony DeDominic <adedomin@gmail.com>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

'use strict';

const {
    palettes: colors,
    defaultColor,
    setDefaultsOnClear,
} = require('../../lib/color-palette.js');
const {
    newPainter,
    destroyPainter,
} = require('../../lib/painter.js');
const sizeInfo = require('../../lib/moose-size.js');

function drawTool(state, action) {
    if (state.painter.tool === 'line') {
        state.painter.line(/* cancel */ true);
    }
    state.painter.tool = action;
}

function colorSelect(state, action) {
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

function hdSelect(state) {
    state.moose.hd = !state.moose.hd;
    destroyPainter(state);
    let temp = state.painter.painting;
    // resize image for new canvas
    if (state.moose.hd) {
        temp = temp.concat(Array.from(
            { length: sizeInfo.hd.height - temp.length },
            () => Array.from(
                { length: temp.length },
                () => defaultColor(state),
            ),
        ));
        temp.forEach((arr, i) => {
            temp[i] = arr.concat(Array.from({
                length: sizeInfo.hd.width - arr.length,
            }, () => defaultColor(state)));
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
    newPainter(state);
    state.painter.painting = temp;
    state.painter.init();
}

const tools = [
    'pencil',
    'bucket',
    'line',
    'grid',
    'undo',
    'redo',
    'hd',
    'shaded',
    '82c',
    'save png',
    'clear',
];

const toolsMobile = [
    [
        'pencil',
        'bucket',
        'line',
        'undo',
        'clear',
    ],
    [
        /* 'redo', */
        'grid',
        'hd',
        'shaded',
        '82c',
        'save png',
    ],
];

module.exports = {
    tools, toolsMobile,
    ToolStore(state) {
        function defaultAction(action) {
            state.painter[action]();
        }

        const dtool = drawTool.bind(null, state);
        const cselect = colorSelect.bind(null, state);

        const ToolStore = new Map([
            [ 'pencil', dtool ],
            [ 'bucket', dtool ],
            [ 'line',   dtool ],
            [ 'grid', function() {
                state.painter.grid = !state.painter.grid;
            } ],
            [ 'undo', defaultAction ],
            [ 'redo', defaultAction ],
            [ 'hd', hdSelect.bind(null, state) ],
            [ 'shaded', cselect ],
            [ '82c',    cselect ],
            [ 'save png', function() {
                state.painter.saveAs(
                    state.moose.name
                        ? `${state.moose.name}.png`
                        : 'moose.png',
                );
            } ],
            [ 'clear', function() {
                state.painter.clear();
                setDefaultsOnClear(state);
            } ],
        ]);

        return ToolStore;
    },
};
