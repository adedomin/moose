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
    getMoose,
    saveMoose: saveMooseApi,
} = require('../../lib/api.js');
const {
    mooseToGrid,
    mooseShadeToGrid,
    mooseExtendedToGrid,
    gridToMoose,
    gridToShade,
    gridToExtendedMoose,
    gridToExtendedShade,
} = require('../../lib/moose-grid.js');
const { newPainter, destroyPainter } = require('../../lib/painter.js');
const {
    palettes: colors,
} = require('../../lib/color-palette.js');

module.exports = function(state, emitter) {
    function editMoose(editmoose) {
        state.moose.name = editmoose || '';
        state.title.msg = `editing ${editmoose}...`;
        getMoose(editmoose, (err, body) => {
            if (!err && body && body.image) {
                // not all moose have the hd field
                // this will convert undefined/null
                // to false
                body.hd = !!body.hd;
                body.shaded = !!body.shaded;
                body.extended = !!body.extended;
                if (state.moose.hd !== body.hd) {
                    state.moose.hd = body.hd;
                    destroyPainter(state);
                    newPainter(state);
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
    }

    function saveMoose() {
        if (state.moose.shaded || state.moose.extended) {
            state.moose.shade = state.moose.extended
                ? gridToExtendedShade(state.painter.painting)
                : gridToShade(state.painter.painting);
        }

        state.moose.image = state.moose.extended
            ? gridToExtendedMoose(state.painter.painting)
            : gridToMoose(state.painter.painting);

        saveMooseApi(state.moose, (err, body) => {
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
    }

    return { editMoose, saveMoose };
};
