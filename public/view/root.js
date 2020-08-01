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

const toolsWidget = require('./fragments/tools-widget.js');
const headerFragment = require('./fragments/header-bar.js');
const paletteWidget = require('./fragments/palette-tool-widget.js');

module.exports = function(state, emit) {
    return html`
        <div>

        ${headerFragment('root', state.title.msg, state.title.status)}

        <div class="section">
            <div class="container">

                <div class="columns is-centered">
                <div class="column has-text-centered is-two-thirds-desktop">
                    
                    <div id="mousewrap">
                      ${state.painter.dom}
                    </div>
                    
                    <br>
                    <br>

                    <div class="is-center has-shadow block moose-palette">

                        <div class="field has-addons">
                            <p class="control is-expanded">
                                <input 
                                    type="text" 
                                    class="input is-expanded"
                                    value="${state.moose.name}"
                                    oninput=${mooseName}
                                    placeholder="Moose Name"
                                    onkeydown=${mooseSaveEnter}
                                >
                            </p>
                            <p class="control">
                                <button 
                                    onclick=${mooseSave} 
                                    class="button is-primary"
                                >
                                    Save
                                </button>
                            </p>
                        </div>

                        <div class="field has-addons has-addons-centered">
                            ${toolsWidget(state, emit)}
                        </div>

                        ${paletteWidget(state, emit)}
                    </div>

                </div>
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

    function mooseName(e) {
        emit('moose-name-change', e.target.value);
    }

    function mooseSaveEnter(e) {
        if (e.keyCode == 13)
            emit('moose-save');
    }

    function mooseSave() {
        emit('moose-save');
    }
};
