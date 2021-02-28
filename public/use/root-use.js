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

const { getParameterByName } = require('../lib/helpers.js');
const { newPainter } = require('../lib/painter.js');
const { editMoose, saveMoose } = require('../lib/moose-save-edit-action.js');
const { ToolStore } = require('./stores/tools.js');

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

    newPainter(state);

    emitter.on('color-select', (color) => {
        state.painter.colour = color;
        emitter.emit('render');
    });

    const toolStore = ToolStore(state);
    emitter.on('tool-select', (action) => {
        const tool = toolStore.get(action);
        if (tool === undefined) return;
        else tool(action);
        emitter.emit('render');
    });

    emitter.on('moose-name-change', (name) => {
        state.moose.name = name;
    });

    emitter.on('moose-save', () => {
        saveMoose(state, emitter);
    });

    emitter.on('moose-edit', (editmoose) => {
        editMoose(editmoose, state, emitter);
    });

    emitter.on('pushState', () => {
        if (!isRootRoute.test(window.location.hash)) return;
        else if (getParameterByName('edit')) {
            emitter.emit('moose-edit', getParameterByName('edit'));
        }
    });

    state.painter.init();
    if (getParameterByName('edit')) {
        emitter.emit('moose-edit', getParameterByName('edit'));
    }

    emitter.on('render', () => {
        if (state.painter.drawing) return;
        else state.painter.draw();
    });
};
