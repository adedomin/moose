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
                <div class="column has-text-centered is-half">
                    
                    ${state.painter.dom}
                    
                    <br>
                    <br>

                    <div class="field has-addons ">
                        <p class="control is-expanded">
                            <input 
                                type="text" 
                                class="input is-expanded"
                                value="${state.moose.name}"
                                oninput=${mooseName}
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

                    <div class="is-center has-shadow block moose-palette">
                        ${state.painter.palette.map(color => {
                            var extra = '', style = `background-color: ${color}`
                            if (color == 'transparent') {
                                extra += 'moose-palette-color-transparent'
                                style = 'background: transparent url(\'transparent.png\') repeat'
                            }
                            if (color == state.painter.palette[state.painter.colour])
                                extra += ' moose-palette-color-selected'
                            return html`<button 
                                onclick=${colorSelect}
                                class="moose-palette-color ${extra}"
                                style="${style}">
                            </button>`
                        })}
                        <br>
                        <br>
                        ${state.tools.map(tool => {
                            var extra = ''
                            if (tool == state.painter.tool)
                                extra += ' is-info'
                            return html`<button 
                                onclick=${toolSelect}
                                class="button ${extra}"
                            >
                                ${tool}
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

    function mooseSave() {
        emit('moose-save')
    }

    function colorSelect(e) {
        emit('color-select', e.target.style['background-color'])
    }

    function toolSelect(e) {
        emit('tool-select', e.target.innerText)
    }
}
