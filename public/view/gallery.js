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
const galleryPicturesFragment = require('./fragments/gallery-images.js');
const headerFragment = require('./fragments/header-bar.js');
const imageModalFragment = require('./fragments/image-modal.js');

module.exports = function(state, emit) {
    return html`
        <div>

        ${headerFragment('gallery', 'Gallery Page', 'primary')}

        ${imageModalFragment(state, emit)}

        <div class="section">
            <div class="container">
                <div class="field has-addons">
                    <p class="control">
                        <button value="prev"
                            onclick=${queryPrevious}
                            class="button"
                        >
                            ${`← ${state.galleryPage - 1}`}
                        </button>
                    </p>
                    <p class="control">

                        <button value="oldest" 
                                onclick=${queryAge} 
                                class="button ${state.query.age === 'oldest' ? 'is-info' : ''}"
                        >
                            oldest
                        </button>
                    </p>
                    <p class="control is-expanded">
                        <input 
                            type="text" 
                            class="input is-expanded"
                            value="${state.query.name}"
                            oninput=${queryName}
                        >
                    </p>
                    <p class="control">
                        <button value="newest" 
                                onclick=${queryAge} 
                                class="button ${state.query.age === 'newest' ? 'is-info' : ''}"
                        >
                            newest
                        </button>
                    </p>
                    <p class="control">
                        <button value="next"
                            onclick=${queryNext}
                            class="button"
                        >
                            ${`${state.galleryPage + 1} →`}
                        </button>
                    </p>
                </div>
                <div class="columns is-multiline">
                    ${galleryPicturesFragment(state, emit)}
                </div>
            </div>
        </div>

        <div class="footer">
          <div class="container">
            <div class="content has-text-centered">
              <p>
                <strong>Moose</strong> by <a href="https://dedominic.pw">Anthony DeDominic</a>.
              </p>
              <p>
                <a class="icon" href="https://github.com/adedomin/moose">
                    <img src="GitHub-Mark-120px-plus.png">
                </a>
              </p>
            </div>
          </div>
        </div>
        </div>
    `;

    function queryPrevious() {
        emit('gallery-prev');
    }

    function queryAge(e) {
        emit('gallery-age', e.target.value);
    }

    function queryName(e) {
        emit('gallery-name', e.target.value);
    }

    function queryNext() {
        emit('gallery-next');
    }
};
