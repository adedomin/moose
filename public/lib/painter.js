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

const { GridPaint } = require('gridpaint');
const {
    palettes: colors,
    defaultColor,
    setDefaultsOnClear,
} = require('../lib/color-palette.js');
const sizeInfo = require('../lib/moose-size.js');
const { isMobile } = require('../lib/helpers.js');

const newPainter = (state) => {
    state.painter = new GridPaint({
        width:
        state.moose.hd ?
            sizeInfo.hd.width :
            sizeInfo.normal.width,
        height:
        state.moose.hd ?
            sizeInfo.hd.height :
            sizeInfo.normal.height,
        cellWidth:  16,
        cellHeight: 24,
        palette: state.moose.extended
            ? colors.fullExtendedColors
            : colors.fullPallete,
        outline: true,
    });

    state.painter.tool = 'pencil';
    state.painter.colour = defaultColor(state);
    state.painter.grid = true;

    if (isMobile()) {
        state.setCanvasSize = setInterval(() => {
            if (!state.painter.canvas.parentNode) return;
            state.painter.fitToWindow();
            clearInterval(state.setCanvasSize);
        }, 10);
    }

    setDefaultsOnClear(state);
};

const destroyPainter = (state) => {
    state.painter.destroy();
    if (state.painter.canvas) {
        state.painter.canvas
            .parentNode
            .removeChild(
                state.painter.canvas,
            );
    }
};

module.exports = { newPainter, destroyPainter };
