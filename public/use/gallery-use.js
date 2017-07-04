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

var galleryPageSize = 12

var getGalleryPage = require('../lib/api.js').getGalleryPage,
    GridPaint = require('gridpaint'),
    mooseToGrid = require('../lib/moose-grid.js').mooseToGrid,
    mooseShadeToGrid = require('../lib/moose-grid.js').mooseShadeToGrid,
    each = require('async.each'),
    sizeInfo = require('../lib/moose-size.js'),
    colors = require('../lib/color-palette')

// generates data urls from moose
function generateGalleryMoose(image, isHd, cb) {
    var painter = new GridPaint({
        width: isHd ? 
            sizeInfo.hd.width :
            sizeInfo.normal.width, 
        height: isHd ?
            sizeInfo.hd.height :
            sizeInfo.normal.height,
        cellWidth: 16,
        cellHeight: 24,
        palette: colors.fullPallete,
    })

    painter.painting = mooseToGrid(image)
    painter.color = 0 // remove dumb errors from dom
    painter.colour = 0
    painter.draw()
    painter.drawing = false
    painter.dom.toBlob(cb, 'image/png')
}

function generateGalleryShadedMoose(image, shade, isHd, cb) {
    var painter = new GridPaint({
        width: isHd ? 
            sizeInfo.hd.width :
            sizeInfo.normal.width, 
        height: isHd ?
            sizeInfo.hd.height :
            sizeInfo.normal.height,
        cellWidth: 16,
        cellHeight: 24,
        palette: colors.fullPallete,
    })

    painter.painting = mooseShadeToGrid(image,shade)
    painter.color = 0 // remove dumb errors from dom
    painter.colour = 0
    painter.draw()
    painter.drawing = false
    painter.dom.toBlob(cb, 'image/png')
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
                state.gallery = []
                each(body, (moose, cb) => {
                    if (moose.shaded)
                        generateGalleryShadedMoose(moose.image, moose.shade, moose.hd, (blob) => {
                            state.gallery.push({
                                name: moose.name,
                                image: blob,
                            })               
                            cb()
                        })
                    else
                        generateGalleryMoose(moose.image, moose.hd, (blob) => {
                            state.gallery.push({
                                name: moose.name,
                                image: blob,
                            })               
                            cb()
                        })
                }, () => {
                    emitter.emit('render')
                })
            })
    })

    state.timeoutScroll = false 

    emitter.on('gallery-end-timeout', () => {
        state.timeoutScroll = false
    })

    emitter.on('gallery-bottom', () => {
        // no more meese to show
        if (state.gallery.length < galleryPageSize || state.gallery.length % galleryPageSize != 0) 
            return
        state.timeoutScroll = true
        getGalleryPage(
            state.query.age,
            state.query.name,
            Math.ceil(state.gallery.length / galleryPageSize),
            (err, body) => {
                if (err) return
                if (!(body instanceof Array)) return
                if (body == []) return
                each(body, (moose, cb) => {
                    if (moose.shaded)
                        generateGalleryShadedMoose(moose.image, moose.shade, moose.hd, (blob) => {
                            state.gallery.push({
                                name: moose.name,
                                image: blob,
                            })               
                            cb()
                        })
                    else
                        generateGalleryMoose(moose.image, moose.hd, (blob) => {
                            state.gallery.push({
                                name: moose.name,
                                image: blob,
                            })               
                            cb()
                        })
                }, () => {
                    emitter.emit('render')
                    setTimeout(() => emitter.emit('gallery-end-timeout'), 300)
                })
            })
    })

    emitter.emit('gallery-get')

    var lastScrollPos = 999
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
            if (scrollPos > 87 && scrollPos - lastScrollPos > 0)
                emitter.emit('gallery-bottom')
            lastScrollPos = scrollPos
        })
    })
}
