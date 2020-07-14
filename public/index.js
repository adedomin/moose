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

const choo = require('choo');
const root = require('./view/root.js');
const gallery = require('./view/gallery.js');
const rootState = require('./use/root-use.js');
const galleryState = require('./use/gallery-use.js');
const app = choo();

app.use(rootState);
app.use(galleryState);

app.route('/', root);
app.route('/gallery', gallery);

document.body.appendChild(app.start());
