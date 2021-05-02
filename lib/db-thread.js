// Copyright (C) 2021  Anthony DeDominic <adedomin@gmail.com>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

const { parentPort } = require('worker_threads');
const MooseDB = require('./db.js');

module.exports = function(db_path) {
    const db = MooseDB(db_path);
    parentPort.on('message', ({ sql, parameters }) => {
    const result = db.prepare(sql).all(...parameters);
    parentPort.postMessage(result);
    });
}
