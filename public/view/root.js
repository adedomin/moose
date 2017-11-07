/*
 * Copyright (C) 2017 Anthony DeDominic <adedomin@gmail.com>, Underdoge
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

var html = require('choo/html'),
    colors = require('../lib/color-palette')

module.exports = function(state, emit) {
    return html`
        <div>
        <div class="nav">
          <div class="nav-left">
            <a class="nav-item is-tab" href="#">
                <img src="neomoose.png" alt="NeoMoose Logo">
            </a>
            <a class="nav-item is-active is-tab" href="#">Create</a>
            <a class=" nav-item is-tab" href="#gallery">Gallery</a>
            <a data-no-routing 
                class=" nav-item is-tab" 
                href="/dump"
            >
                Database (JSON)
            </a>
          </div>
        </div>

        <div class="hero is-${state.title.status}">
            <div class="hero-body">
                <div class="container">
                    <h1 class="title">NeoMoose</h1>
                    <h2 class="subtitle">${state.title.msg}</h2>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="container">

                <div class="columns is-centered">
                <div class="column has-text-centered is-half-desktop">
                    
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
                            ${state.tools.map(tool => {
                                var extra = ''
                                if (tool == state.painter.tool)
                                    extra += ' is-info'
                                else if (tool == 'grid' && state.painter.grid)
                                    extra += ' is-success'
                                else if (tool == 'hd' && state.moose.hd)
                                    extra += ' is-success'
                                else if (tool == 'shaded' && state.moose.shaded)
                                    extra += ' is-success'
                                else if (tool == 'clear')
                                    extra += ' is-danger'
                                return html`<p class="control"><button 
                                    onclick=${toolSelect}
                                    class="button ${extra}"
                                >
                                    ${tool}
                                </button></p>`
                            })}
                        </div>

                        ${colors.canvasPalette[3].map((color, ind) => {
                            var extra = '', style = `background-color: ${color}`
                            if (color == 'transparent') {
                                extra += 'moose-palette-color-transparent'
                                style = 'background: transparent url(\'transparent.png\') repeat;'
                            }
                            if (ind == state.painter.colour % 17)
                                extra += ' moose-palette-color-selected'
                            return html`<button 
                                onclick=${colorSelect.bind(null, ind+(17*3))}
                                class="moose-palette-color ${extra}"
                                style="${style}">
                            </button>`
                        })}
                        <br>
                        ${colors.canvasPalette.map((row, ind) => {
                            if (!state.moose.shaded) return
                            var ind2 = state.painter.colour % 17
                            var color = row[state.painter.colour % 17]
                            var extra = '', style = `background-color: ${color}`
                            if (color == 'transparent') {
                                extra += 'moose-palette-color-transparent'
                                style = 'background: transparent url(\'transparent.png\') repeat;'
                            }
                            if (color == colors.fullPallete[state.painter.colour])
                                extra += ' moose-palette-color-selected'
                            return html`<button 
                                onclick=${colorSelect.bind(null, ind2+(17*ind))}
                                class="moose-palette-color ${extra}"
                                style="${style}">
                            </button>`
                        })}
                    </div>

                </div>
                </div>
            </div>
        </div>

        <div class="footer">
          <div class="container">
            <div class="content has-text-centered">
              <p>
                <strong>NeoMoose</strong> by <a href="https://dedominic.pw">Anthony DeDominic</a>.
              </p>
              <p>
                <a class="icon" href="https://github.com/adedomin/neomoose">
                    <img src="GitHub-Mark-120px-plus.png">
                </a>
              </p>
            </div>
          </div>
        </div>
        </div>
    `

    function mooseName(e) {
        emit('moose-name-change', e.target.value)
    }

    function mooseSaveEnter(e) {
        if (e.keyCode == 13)
            emit('moose-save')
    }

    function mooseSave() {
        emit('moose-save')
    }

    function colorSelect(color) {
        emit('color-select', color)
    }

    function toolSelect(e) {
        emit('tool-select', e.target.innerText)
    }
}
