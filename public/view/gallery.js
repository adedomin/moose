/*
 * Copyright (C) 2017 Anthony DeDominic <adedomin@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var html = require('choo/html')

module.exports = function(state, emit) {
    return html`
        <div>
        <div class="nav">
          <div class="nav-left">
            <a class="nav-item is-tab" href="#">NeoMoose</a>
            <a class=" nav-item is-active is-tab" href="#gallery">Gallery</a>
            <a data-no-routing 
                class=" nav-item is-tab" 
                href="/dump"
            >
                Database (JSON)
            </a>
          </div>
        </div>

        <div class="hero is-primary">
           <div class="hero-body">
               <div class="container">
                   <h1 class="title">NeoMoose</h1>
                   <h2 class="subtitle">Gallery Page</h2>
               </div>
           </div>
        </div>

        <div class="section">
            <div class="container">
                <div class="field has-addons">
                    <p class="control">
                        <button value="oldest" 
                                onclick=${queryAge} 
                                class="button ${state.query.age == 'oldest' ? 'is-info' : ''}"
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
                                class="button ${state.query.age == 'newest' ? 'is-info' : ''}"
                        >
                            newest
                        </button>
                    </p>
                </div>
                <div class="columns is-multiline">
                    ${state.gallery.map(moose => {
                        return html`
                            <div class="column">
                                <div class="box has-text-centered">
                                    <a href="#?edit=${moose.name}">
                                        ${moose.dom}
                                        <br>
                                        ${moose.name}
                                    </a>
                                </div>
                            </div>
                        `
                    })}
                </div>
            </div>
        </div>
        </div>
    `
    function queryAge(e) {
        emit('gallery-age', e.target.value)
    }

    function queryName(e) {
        emit('gallery-name', e.target.value) 
    }
}
