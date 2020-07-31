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

const html = require('choo/html');
const colors = require('../../lib/color-palette.js');

module.exports = function(state, emit) {
    /* eslint indent: off */
    // eslint has a strange opinion about indenting here
    return html`<div>
        ${colors.canvasPalette[3].map((color, ind) => {
            let extra = '', style = `background-color: ${color}`;
            if (color === 'rgba(0,0,0,0)') {
                extra += 'moose-palette-color-transparent';
                style = 'background: transparent url(\'transparent.png\') repeat;';
            }
            if (ind === state.painter.colour % 17)
                extra += ' moose-palette-color-selected';
            return html`
                <button onclick=${colorSelect.bind(null, ind+(17*3))}
                        class="moose-palette-color ${extra}"
                        style="${style}">
                </button>
            `;
        })}
        <br>
        ${state.moose.shaded ? colors.canvasPalette.map((row, ind) => {
            let ind2 = state.painter.colour % 17;
            let color = row[state.painter.colour % 17];
            let extra = '', style = `background-color: ${color}`;
            if (color === 'rgba(0,0,0,0)') {
                extra += 'moose-palette-color-transparent';
                style = 'background: transparent url(\'transparent.png\') repeat;';
            }
            if (color === colors.fullPallete[state.painter.colour])
                extra += ' moose-palette-color-selected';
            return html`
                <button onclick=${colorSelect.bind(null, ind2+(17*ind))}
                        class="moose-palette-color ${extra}"
                        style="${style}">
                </button>
            `;
        }) : ''}
    </div>`;

    function colorSelect(color) {
        emit('color-select', color);
    }
};
