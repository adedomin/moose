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

module.exports = function(state, emit) {
    return state.gallery.map(moose => {
        return html`
            <div class="column is-3">
                <div class="box has-text-centered">
                    <a onclick=${() => emit('gallery-modal', moose.url)}>
                        <img class="moose-gallery-img-background"
                             src="${moose.url}">
                        <br>
                        ${moose.name}
                    </a>
                    <br>
                    (<a href="#?edit=${moose.name}">
                        Edit
                    </a>)
                    (<a href="#gallery?view=${moose.name}">
                        Link
                    </a>)
                </div>
            </div>
        `;
    });
};
