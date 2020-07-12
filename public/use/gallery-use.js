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
'use strict';

const galleryPageSize = 12;

const { getGalleryPage } = require('../lib/api.js');
const GridPaint = require('gridpaint');
const {
    mooseToGrid,
    mooseShadeToGrid,
} = require('../lib/moose-grid.js');
const each = require('async.each');
const sizeInfo = require('../lib/moose-size.js');
const colors = require('../lib/color-palette.js');

function getGalleryPageCallback(state, emitter, action, err, body) {
    if (err ||
        !Array.isArray(body) ||
        body.length === 0
    ) {
        if (action == 'init') {
            state.gallery = [];
            emitter.emit('render');
        }
        return;
    }

    state.gallery = [];

    each(body, (moose, cb) => {
        if (moose.shaded)
            generateGalleryShadedMoose(moose.image, moose.shade, moose.hd, (blob) => {
                state.gallery.push({
                    name: moose.name,
                    image: blob,
                });               
                cb();
            });
        else
            generateGalleryMoose(moose.image, moose.hd, (blob) => {
                state.gallery.push({
                    name: moose.name,
                    image: blob,
                });               
                cb();
            });
    }, () => {
        if (action === 'page') {
            state.galleryPage = state.galleryNextPage;
        }
        emitter.emit('render');
    });
}

// generates data urls from moose
function generateGalleryMoose(image, isHd, cb) {
    let painter = new GridPaint({
        width: isHd ? 
            sizeInfo.hd.width :
            sizeInfo.normal.width, 
        height: isHd ?
            sizeInfo.hd.height :
            sizeInfo.normal.height,
        cellWidth: 16,
        cellHeight: 24,
        palette: colors.fullPallete,
    });

    painter.painting = mooseToGrid(image);
    painter.color = 0; // remove dumb errors from dom
    painter.colour = 0;
    painter.draw();
    painter.drawing = false;
    painter.dom.toBlob(cb, 'image/png');
}

function generateGalleryShadedMoose(image, shade, isHd, cb) {
    let painter = new GridPaint({
        width: isHd ? 
            sizeInfo.hd.width :
            sizeInfo.normal.width, 
        height: isHd ?
            sizeInfo.hd.height :
            sizeInfo.normal.height,
        cellWidth: 16,
        cellHeight: 24,
        palette: colors.fullPallete,
    });

    painter.painting = mooseShadeToGrid(image,shade);
    painter.color = 0; // remove dumb errors from dom
    painter.colour = 0;
    painter.draw();
    painter.drawing = false;
    painter.dom.toBlob(cb, 'image/png');
}

module.exports = function(state, emitter) {
    const getGalleryInitCb = getGalleryPageCallback.bind(
        this,
        state,
        emitter,
        'init' /* pagination type */,
    );

    const getGalleryPageCb = getGalleryPageCallback.bind(
        this,
        state,
        emitter,
        'page' /* pagination type */,
    );

    state.gallery = [];

    state.galleryPage = 0;

    state.query = {
        name: '',
        age: 'newest',
    };

    emitter.on('gallery-age', (value) => {
        if (value !== 'newest' || value !== 'oldest') return;
        state.query.age = value;
        emitter.emit('gallery-get');
    });

    emitter.on('gallery-name', (value) => {
        state.query.name = value;
        emitter.emit('gallery-get');
    });

    emitter.on('gallery-get', () => {
        state.galleryPage = 0;
        state.galleryNextPage = 0;

        getGalleryPage(
            state.query.age,
            state.query.name,
            0,
            getGalleryInitCb,
        );
    });

    emitter.on('gallery-prev', (pnum = state.galleryPage - 1) => {
        if (state.galleryPage < 1) return;
        state.galleryNextPage = pnum;

        getGalleryPage(
            state.query.age,
            state.query.name,
            pnum,
            getGalleryPageCb,
        );
    });

    emitter.on('gallery-next', (pnum = state.galleryPage + 1) => {
        // no more meese to show
        if (state.gallery.length < galleryPageSize) return;
        state.galleryNextPage = pnum;

        getGalleryPage(
            state.query.age,
            state.query.name,
            pnum,
            getGalleryPageCb,
        );
    });

    emitter.emit('gallery-get');
};
