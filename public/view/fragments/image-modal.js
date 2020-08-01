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
    if (state.galleryModal === undefined) return '';

    return html`
      <div class="modal is-active">
        <div onclick=${() => emit('gallery-modal', undefined)}
             class="modal-background">
        </div>
        <div class="modal-card">
          <div class="modal-card-body box has-text-centered">
            <img class="moose-gallery-img-background" 
                 src="${state.galleryModal}">
          </div>
        </div>
      </div> 
   `;
};
