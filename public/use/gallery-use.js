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

const { getMoose, getGalleryPage } = require('../lib/api.js');
const { GridPaint } = require('gridpaint');
const {
    mooseToGrid,
    mooseShadeToGrid,
    mooseExtendedToGrid,
} = require('../lib/moose-grid.js');
const each = require('async.each');
const sizeInfo = require('../lib/moose-size.js');
const galleryPageSize = sizeInfo.galleryPageSize;
const { palettes: colors } = require('../lib/color-palette.js');
const { getParameterByName } = require('../lib/helpers.js');

const isGalleryRoute = /^#gallery(\?.*)?$/;

function getGalleryPageCallback(state, emitter, action, err, body) {
    if (err ||
        !Array.isArray(body) ||
        body.length === 0
    ) {
        if (action === 'init') {
            state.gallery = [];
            emitter.emit('render');
        }
        return;
    }

    const gallery = [];

    each(body, (moose, cb) => {
        if (moose.extended) {
            generateGalleryExtendedMoose(moose.image, moose.shade, moose.hd, (blob) => {
                gallery.push({
                    name: moose.name,
                    image: blob,
                    date: moose.created,
                    url: URL.createObjectURL(blob),
                });
                cb();
            });
        }
        else if (moose.shaded) {
            generateGalleryShadedMoose(moose.image, moose.shade, moose.hd, (blob) => {
                gallery.push({
                    name: moose.name,
                    image: blob,
                    date: moose.created,
                    url: URL.createObjectURL(blob),
                });
                cb();
            });
        }
        else {
            generateGalleryMoose(moose.image, moose.hd, (blob) => {
                gallery.push({
                    name: moose.name,
                    image: blob,
                    date: moose.created,
                    url: URL.createObjectURL(blob),
                });
                cb();
            });
        }
    }, () => {
        gallery.sort(({ date: d1 }, { date: d2 }) => d1 < d2 ? 1 : d1 === d2 ? 0 : -1);
        if (action === 'page') {
            state.galleryPage = state.galleryNextPage;
        }
        state.gallery = gallery;
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
        autoStopDrawing: false,
    });

    painter.painting = mooseToGrid(image);
    painter.color = colors.defaultValue; // remove dumb errors from dom
    painter.colour = colors.defaultValue;
    painter.drawing = false;
    painter.saveAs(':blob:').then(cb);
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
        autoStopDrawing: false,
    });

    painter.painting = mooseShadeToGrid(image,shade);
    painter.color = colors.defaultValue; // remove dumb errors from dom
    painter.colour = colors.defaultValue;
    painter.draw();
    painter.drawing = false;
    painter.saveAs(':blob:').then(cb);
}

function generateGalleryExtendedMoose(image, shade, isHd, cb) {
    let painter = new GridPaint({
        width: isHd ?
            sizeInfo.hd.width :
            sizeInfo.normal.width,
        height: isHd ?
            sizeInfo.hd.height :
            sizeInfo.normal.height,
        cellWidth: 16,
        cellHeight: 24,
        palette: colors.fullExtendedColors,
        autoStopDrawing: false,
    });

    painter.painting = mooseExtendedToGrid(image,shade);
    painter.color = colors.defaultValue; // remove dumb errors from dom
    painter.colour = colors.defaultValue;
    painter.draw();
    painter.drawing = false;
    painter.saveAs(':blob:').then(cb);
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

    state.debounce = {
        query: null,
    };

    state.inClipboard = null;

    emitter.on('gallery-age', (value) => {
        state.query.age = value;
        emitter.emit('gallery-get');
    });

    emitter.on('gallery-name', (value) => {
        state.query.name = value;
        clearTimeout(state.debounce.query);
        state.debounce.query = setTimeout(() => {
            emitter.emit('gallery-get');
        }, 250);
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

    // setting this to undefined has the effect of turning the modal off.
    emitter.on('gallery-modal', (moose) => {
        if (moose === undefined &&
            getParameterByName('view') &&
            isGalleryRoute.test(window.location.hash)
        ) {
            window.location.hash = '#gallery';
        }
        state.galleryModal = moose;
        emitter.emit('render');
    });

    emitter.on('clipboard-link', mooseName => {
        state.inClipboard = mooseName;
        emitter.emit('render');
    });

    emitter.on('view-moose', name => {
        getMoose(name, (err, body) => {
            if (!err && body && body.image) {
                if (body.extended) {
                    generateGalleryExtendedMoose(
                        body.image, body.shade, body.hd, blob => {
                            emitter.emit(
                                'gallery-modal', {
                                    name,
                                    image: blob,
                                    url: URL.createObjectURL(blob),
                                },
                            );
                        },
                    );
                }
                else if (body.shaded) {
                    generateGalleryShadedMoose(
                        body.image, body.shade, body.hd, blob => {
                            emitter.emit(
                                'gallery-modal', {
                                    name,
                                    image: blob,
                                    url: URL.createObjectURL(blob),
                                },
                            );
                        },
                    );
                }
                else {
                    generateGalleryMoose(
                        body.image, body.hd, blob => {
                            emitter.emit(
                                'gallery-modal', {
                                    name,
                                    image: blob,
                                    url: URL.createObjectURL(blob),
                                },
                            );
                        },
                    );
                }
            }
        });
    });

    emitter.on('pushState', () => {
        if (!isGalleryRoute.test(window.location.hash)) return;
        if (!getParameterByName('view') && state.galleryModal) {
            return emitter.emit('gallery-modal', undefined);
        }
        else if (!getParameterByName('view')) return;
        emitter.emit('view-moose', getParameterByName('view'));
    });

    if (getParameterByName('view')) {
        emitter.emit('view-moose', getParameterByName('view'));
    }

    emitter.emit('gallery-get');
};
