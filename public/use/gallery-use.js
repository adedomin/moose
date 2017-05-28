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

var getGalleryPage = require('../lib/api.js').getGalleryPage,
    GridPaint = require('gridpaint'),
    mooseToGrid = require('../lib/moose-grid.js').mooseToGrid

function generateGalleryMoose(name, image) {
    var painter = new GridPaint({
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

    painter.name = name
    painter.painting = mooseToGrid(image)
    painter.color = 0 // remove dumb errors from dom
    painter.colour = 0
    painter.draw()
    painter.drawing = false
    painter.dom.id = `m-${name}`

    return painter
}

module.exports = function(state, emitter) {
    state.gallery = []

    state.query = {
        name: '',
        age: 'newest',
    }

    emitter.on('gallery-age', (value) => {
        state.query.age = value
        emitter.emit('gallery-get')
    })

    emitter.on('gallery-name', (value) => {
        state.query.name = value
        emitter.emit('gallery-get')
    })

    emitter.on('gallery-get', () => {
        getGalleryPage(
            state.query.age,
            state.query.name,
            0,
        (err, body) => {
            if (err) return
            if (!(body instanceof Array)) return
            state.gallery.forEach(moose => {
                var el = document.getElementById(`m-${moose.name}`)
                el.parentNode.removeChild(el)
            })
            state.gallery = []
            body.forEach(moose => {
                state.gallery.push(
                    generateGalleryMoose(
                        moose.name, moose.image
                    )
                )
            })
            emitter.emit('render')
        })
    })

    state.timeoutScroll = false 

    emitter.on('gallery-end-timeout', () => {
        state.timeoutScroll = false
    })

    emitter.on('gallery-bottom', () => {
        // no more meese to show
        if (state.gallery.length < 9 || state.gallery.length % 9 != 0) 
            return
        getGalleryPage(
            state.query.age,
            state.query.name,
            Math.ceil(state.gallery.length / 9),
        (err, body) => {
            if (err) return
            if (!(body instanceof Array)) return
            if (body == []) return
            body.forEach(moose => {
                state.gallery.push(
                    generateGalleryMoose(
                        moose.name, moose.image
                    )
                )
            })
            setTimeout(() => emitter.emit('gallery-end-timeout'), 500)
            emitter.emit('render')
        })

    })

    emitter.emit('gallery-get')

    emitter.on('DOMContentLoaded', () => {
        window.addEventListener('scroll', () => {
            if (state.timeoutScroll || window.location.hash != '#gallery') 
                return
            var scrollPos = (
                (document.documentElement.scrollTop 
                    + document.body.scrollTop) 
                / (document.documentElement.scrollHeight 
                    - document.documentElement.clientHeight) 
                * 100)
            if (scrollPos > 90)
                emitter.emit('gallery-bottom')
        })
    })
}
