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

var GridPaint = require('gridpaint'),
    api = require('../lib/api.js'),
    mooseToGrid = require('../lib/moose-grid.js').mooseToGrid,
    gridToMoose = require('../lib/moose-grid.js').gridToMoose,
    sizeInfo = require('../lib/moose-size.js')

function getParameterByName(name) {
    var url = window.location.href
    name = name.replace(/[[]]/g, '\\$&')
    var regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

module.exports = function(state, emitter) {
    state.title = {
        msg: 'Make a Moose today',
        status: 'primary',
    }

    state.moose = {
        name: '',
        hd: false,
    }

    var newPainter = () => {
        state.painter = new GridPaint({
            width: 
                state.moose.hd ? 
                sizeInfo.hd.width :
                sizeInfo.normal.width, 
            height: 
                state.moose.hd ?
                sizeInfo.hd.height :
                sizeInfo.normal.height,
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
        state.painter.tool = 'pencil'
        state.painter.color = 1
        state.painter.colour = 'transparent'
        state.painter.grid = true
    }

    newPainter()
    state.tools = [ 
        'pencil', 
        'bucket', 
        'grid',
        'undo', 
        'redo', 
        'hd/sd',
        'clear',
    ]

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
        else if (action == 'hd/sd') {
            state.moose.hd = !state.moose.hd
            state.painter.destroy()
            if (state.painter.dom) {
                state.painter.dom
                    .parentNode
                    .removeChild(
                        state.painter.dom
                    )
            }
            newPainter()
            state.painter.init()
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
        state.moose.image = gridToMoose(state.painter.painting)
        api.saveMoose(state.moose, (err, body) => {
            if (err || !body || body.status == 'error') {
                if (!body) body = { 
                    msg: err.toString() || 'unknown error',
                }
                if (typeof body.msg == 'object') 
                    body.msg = JSON.stringify(body.msg)
                state.title.msg = 
                    `failed to save moose: ${body.msg}`
                state.title.status = 'danger'
            }
            else {
                state.title.msg = body.msg
                state.title.status = 'success'
            }
             
            emitter.emit('render')
        })
    })

    emitter.on('moose-edit', (editmoose) => {
        state.moose.name = editmoose || ''
        state.title.msg = `editing ${editmoose}...`
        api.getMoose(editmoose, (err, body) => {
            if (!err && body && body.image) {
                state.painter.painting = 
                    mooseToGrid(body.image)
            }
            emitter.emit('render')
        })
    })

    emitter.on('pushState', () => {
        if (getParameterByName('edit')) 
            emitter.emit('moose-edit', getParameterByName('edit'))
    })

    state.painter.init()
    if (getParameterByName('edit')) 
        emitter.emit('moose-edit', getParameterByName('edit'))
}
