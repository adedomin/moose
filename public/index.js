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

// css
require('../node_modules/bulma/css/bulma.css')
require('./moose-style.css')

var choo = require('choo'),
    html = require('choo/html'),
    http = require('xhr'),
    GridPaint = require('gridpaint'),
    colorToMooseString = [
        't',
        '0', '1', '2', '3', 
        '4', '5', '6', '7',
        '8', '9', 'a', 'b',
        'c', 'd', 'e', 'f',
    ],
    app = choo()

function getParameterByName(name) {
    var url = window.location.href
    name = name.replace(/[[]]/g, '\\$&')
    var regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

app.use((state, emitter) => {

    state.title = {
        msg: 'Make a Moose today',
        status: 'primary',
    }

    state.moose = {
        name: '',
    }

    state.painter = new GridPaint({
        width: 26, 
        height: 15, 
        cellWidth: 16,
        cellHeight: 24,
        palette: [
            'transparent', 'white', 'black', 
            'navy', 'green', 'red', 'brown',
            'purple', 'olive', 'yellow', 'lime', 
            'teal', 'cyan', 'blue', 'fuchsia',
            'grey', 'lightgrey',
        ],
    }) 

    state.tools = [ 
        'pencil', 
        'bucket', 
        'grid',
        'undo', 
        'redo', 
        'clear',
    ]

    state.painter.tool = 'pencil'
    state.painter.color = 1
    state.painter.colour = 'transparent'
    state.painter.grid = true

    emitter.on('color-select', (color) => {
        state.painter.colour = state.painter.palette.indexOf(color)
        emitter.emit('render')
    })

    emitter.on('tool-select', (action) => {
        if (action == 'pencil' || action == 'bucket') {
            state.painter.tool = action
        }
        else if (action == 'grid') {
            state.painter.grid = !state.painter.grid
        }
        else {
            state.painter[action]()
        }
        emitter.emit('render')
    })

    emitter.on('moose-name-change', (name) => {
        state.moose.name = name
    })

    emitter.on('moose-save', () => {
        state.moose.image = state.painter.painting.map(arr => {
            return arr.map(char => {
                return colorToMooseString[char]
            }).join('')
        }).join('\n')

        http({
            uri: 'new',
            method: 'put',
            body: JSON.stringify(state.moose),
            headers: {
                'Content-Type': 'application/json',
            },
        }, (err, res, body) => {
            try {
                body = JSON.parse(body)
            }
            catch (e) {
                body = { status: 'error', msg: e.toString() }
            }

            if (err || res.statusCode != 200 
                || !body || body.status == 'error') {

                if (!body) body = { msg: 'unknown error' }
                if (typeof body.msg == 'object') body.msg = JSON.stringify(body.msg)
                state.title.msg = `failed to save moose: ${body.msg}`
                state.title.status = 'danger'
            }
            else {
                state.title.msg = body.msg
                state.title.status = 'success'
            }
             
            emitter.emit('render')
        })
    })

    state.painter.init()

    var editmoose = getParameterByName('edit')
    if (editmoose) {
        http({
            uri: `moose/${editmoose}`,
            method: 'get',
        }, (err, res, body) => {
            try {
                body = JSON.parse(body)
            }
            catch (e) {
                body = null
            }
            if (err || !body || !body.image) return
            state.painter.painting = body.image.split('\n').map(str => {
                return str.split('').map(char => {
                    return colorToMooseString.indexOf(char)
                })
            })
        })
    }
})

app.route('/', (state, emit) => {
    return html`
        <div>
        <div class="nav">
          <div class="nav-left">
            <a class="nav-item is-active is-tab" href="#">NeoMoose</a>
            <a class=" nav-item is-tab" href="#gallery">Gallery</a>
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

                <div class="moose-wrap">
                    
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
})

document.body.appendChild(app.start())
