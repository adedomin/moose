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
'use strict';

function request(req, cb) {
    let err = null;
    fetch(req.uri, req)
        .then(res => {
            if (!res.ok) {
                err = res.statusText;
            }
            return res.json();
        })
        .then(json => {
            cb(err, json);
        })
        .catch(e => {
            cb(e, null);
        });
}

module.exports = request;
module.exports.saveMoose = function(moose, cb) {
    request({
        uri: 'new',
        method: 'put',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(moose),
    }, cb);
};
module.exports.getMoose = function(moose, cb) {
    request({ uri: `moose/${encodeURIComponent(moose)}` }, cb);
};
module.exports.getGalleryPage = function(age, query, page, cb) {
    request({
        uri: `gallery/${age}?q=${encodeURIComponent(query)}&p=${page}`,
    }, cb);
};
