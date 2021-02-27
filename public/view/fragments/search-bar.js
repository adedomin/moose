/*
 * Copyright (C) 2021  Anthony DeDominic <adedomin@gmail.com>
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
const { isMobile } = require('../../lib/helpers.js');

function ageSel(age, state, emit) {
    if (isMobile()) return '';
    else return html`
        <p class="control">

            <button value="oldest"
                    onclick=${queryAge}
                    class="button ${state.query.age === age ? 'is-info' : ''}"
            >
                ${age}
            </button>
        </p>
    `;

    function queryAge(e) {
        emit('gallery-age', e.target.value);
    }
}

module.exports = function(state, emit) {
    return html`
        <div class="field has-addons">
            <p class="control">
                <button value="prev"
                    onclick=${queryPrevious}
                    class="button"
                >
                    ${`← ${state.galleryPage - 1}`}
                </button>
            </p>
            ${ageSel('oldest', state, emit)}
            <p class="control is-expanded">
                <input 
                    type="text" 
                    class="input is-expanded"
                    value="${state.query.name}"
                    oninput=${queryName}
                >
            </p>
            ${ageSel('newest', state, emit)}
            <p class="control">
                <button value="next"
                    onclick=${queryNext}
                    class="button"
                >
                    ${`${state.galleryPage + 1} →`}
                </button>
            </p>
        </div>
    `;

    function queryPrevious() {
        emit('gallery-prev');
    }

    function queryName(e) {
        emit('gallery-name', e.target.value);
    }

    function queryNext() {
        emit('gallery-next');
    }
};
