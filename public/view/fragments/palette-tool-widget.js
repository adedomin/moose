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
const { palettes: colors } = require('../../lib/color-palette.js');

/* eslint indent: off */
// eslint has a strange opinion about indenting here

function lightness(color) {
    if (color.indexOf('#') !== 0 || color.length !== 7) 'dark';
    const rgb = parseInt(color.slice(1), 16);
    const r = rgb >> 16 ;
    const g = ( rgb >> 8 ) & 0xFF;
    const b = rgb & 0xFF;
    const lightness = ((r*299)+(g*587)+(b*114)) /1000;
    console.log(color, lightness);
    return (lightness > 125) ? 'dark' : 'light';
}

function legacyShadeWidget(state, emit) {
    return html`<div>
        ${colors.canvasPalette[3].map((color, ind) => {
            let extra = '', style = `background-color: ${color}`;

            if (color === 'rgba(0,0,0,0)') {
                extra += 'moose-palette-color-transparent';
                style = 'background: transparent url(\'transparent.png\') repeat;';
            }

            if (ind === state.painter.colour % 17) {
                extra += ` moose-palette-color-selected-${lightness(color)}`;
            }

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

            if (color === colors.fullPallete[state.painter.colour]) {
                extra +=  ` moose-palette-color-selected-${lightness(color)}`;
            }
            return html`
                <button onclick=${colorSelect.bind(null, ind2+(17*ind))}
                        class="moose-palette-color ${extra}"
                        style="${style}">
                </button>
            `;
        }) : ''}
    </div>`;

    function colorSelect(color) {
        // map all transparent colors (num % 17 == 0) to default
        // default (51) is the "unshaded palette" transparent
        color = color % 17 === 0 ? colors.defaultValue : color;
        emit('color-select', color);
    }
}

function extendedColorWidget(state, emit) {
    const transparentStyle = 'background: transparent url(\'transparent.png\') repeat;';
    const transparentClass = 'moose-palette-color-transparent';
    const extendedRowLen = colors.extendedColors[0].length;
    const transparentSelect = state.painter.colour >= 72
        ? 'moose-palette-color-selected-dark'
        : '';
    return html`<div>
        <button onclick=${/* add transparent first */
            colorSelect.bind(null, colors.extendedColorsDefault)
        }
                class="moose-palette-color ${transparentClass} ${transparentSelect}"
                style="${transparentStyle}">
        </button>
        ${colors.extendedColors[3].map((color, ind) => {
            const style = `background-color: ${color}`;
            let extra = '';

            if (
                ind === state.painter.colour % extendedRowLen &&
                state.painter.colour < 72
            ) {
                extra += `moose-palette-color-selected-${lightness(color)}`;
            }

            return html`
                <button onclick=${colorSelect.bind(null, ind+(extendedRowLen*3))}
                        class="moose-palette-color ${extra}"
                        style="${style}">
                </button>
            `;
        })}
        <br>
        ${state.painter.colour >= 72
            ? colors.extendedColors[6].map((color, ind) => {
                const style = `background-color: ${color}`;
                let extra = '';

                if (color === 'rgba(0,0,0,0)') {
                    return '';
                }

                if (color === colors.fullExtendedColors[state.painter.colour]) {
                    extra += `moose-palette-color-selected-${lightness(color)}`;
                }

                return html`
                    <button onclick=${colorSelect.bind(null, ind+(extendedRowLen*6))}
                            class="moose-palette-color ${extra}"
                            style="${style}">
                    </button>
                `;
              })
            : colors.extendedColors.map((row, ind) => {
                // index 7 is white through black, we set that above.
                if (ind === 6) return '';
                const ind2 = state.painter.colour % extendedRowLen;
                const color = row[state.painter.colour % extendedRowLen];
                const style = `background-color: ${color}`;
                let extra = '';

                if (color === colors.fullExtendedColors[state.painter.colour]) {
                    extra += ` moose-palette-color-selected-${lightness(color)}`;
                }
                return html`
                    <button onclick=${colorSelect.bind(null, ind2+(extendedRowLen*ind))}
                            class="moose-palette-color ${extra}"
                            style="${style}">
                    </button>
                `;
            })
        }
    </div>`;

    function colorSelect(color) {
        emit('color-select', color);
    }
}

module.exports = function(state, emit) {
    if (state.moose.extended) return extendedColorWidget(state, emit);
    else return legacyShadeWidget(state, emit);
};
