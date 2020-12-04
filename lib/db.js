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
const sqlite3 = require('sqlite3');
const each = require('async.each');
const dflt = require('./default.js');

function rowToMoose(row) {
    if (!row) return row;
    row.created = new Date(row.created);
    // these values are 0 or 1 due to sqlite3 type storage
    row.hd = !!row.hd;
    row.shaded = !!row.shaded;
    return row;
}
module.exports.rowToMoose = rowToMoose;

function mooseToRow(moose) {
    return {
        $name: moose.name || null,
        $created: moose.created.toISOString() || null,
        $image: moose.image || null,
        $shade: moose.shade || '',
        $hd: moose.hd === true ? 1 : 0,
        $shaded: moose.shaded === true ? 1 : 0,
    };
}

function notInt(val) {
    return (
        isNaN(val) ||
        !isFinite(val) ||
        !Number.isInteger(val)
    );
}

module.exports.MooseDB = class MooseDB {
    constructor(path) {
        this.path = path;
    }
    open(cb) {
        this.db = new sqlite3.Database(this.path, err => {
            if (err) throw err;
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS Moose (
                    name TEXT UNQIUE NOT NULL,
                    created TEXT NOT NULL,
                    image BLOB NOT NULL,
                    shade BLOB,
                    hd INTEGER,
                    shaded INTEGER
                );
                CREATE UNIQUE INDEX IF NOT EXISTS Moose_NameIdx ON Moose (name);
                CREATE INDEX IF NOT EXISTS Moose_CreatedIdx ON Moose (created);

                CREATE VIRTUAL TABLE IF NOT EXISTS MooseSearch USING fts5(
                    moose_rowid, moose_name, tokenize = 'porter unicode61'
                );

                CREATE TRIGGER IF NOT EXISTS Moose_DelTrigger AFTER DELETE ON Moose
                BEGIN
                    DELETE FROM MooseSearch WHERE moose_rowid = OLD.rowid;
                END;

                CREATE TRIGGER IF NOT EXISTS Moose_InsertTrigger AFTER INSERT ON Moose
                BEGIN
                    INSERT INTO MooseSearch(moose_rowid, moose_name) VALUES (NEW.rowid, NEW.name);
                END;
            `, cb);
        });
    }
    getMooseByName(name, cb) {
        this.db.get('SELECT * FROM Moose WHERE name = ?;', name, (err, row) => {
            cb(err, rowToMoose(row));
        });
    }
    getGalleryPage(query, offset, limit, order, cb) {
        if (order === 'oldest') order = 'ASC';
        else order = 'DESC';

        if (notInt(+offset) || notInt(+limit)) {
            return cb(new TypeError('offset or limit is not a number'));
        }

        if (query) {
            return this._findMooseByQuery(query, offset, limit, order, cb);
        }
        else {
            this.db.all(`
                SELECT * FROM Moose
                ORDER BY created ${order}
                LIMIT ${+offset}, ${+limit};
            `, (err, rows) => {
                if (err) return cb(err);
                cb(err, rows.map(rowToMoose));
            });
        }
    }
    _findMooseByQuery(query, offset, limit, order, cb) {
        // escape strange query features in FTS5
        const newQ = query.split(/\s+/).map((word, ind, arr) => {
            if ((word === 'AND' || word === 'OR') && ind !== (arr.length-1)) {
                return word;
            }
            return `"${word.replace(/"/g, '""')}"`;
        }).join(' ');

        this.db.all(`
            SELECT Moose.* FROM Moose
            INNER JOIN (
              SELECT moose_rowid FROM MooseSearch
              WHERE moose_name MATCH ?
              ORDER BY RANK
            )
            ON Moose.rowid == moose_rowid
            ORDER BY created ${order}
            LIMIT ${+offset}, ${+limit};
        `, newQ, (err, rows) => {
            if (err) return cb(err);
            cb(err, rows.map(rowToMoose));
        });
    }
    getRandomMoose(cb) {
        this.db.get(`
            SELECT * FROM Moose
            LIMIT
                abs(RANDOM() % max(( SELECT count(*) FROM Moose ),1)),
                1;
        `, (err, row) => {
            cb(err, rowToMoose(row));
        });
    }
    getLatestMoose(cb) {
        this.db.get(`
            SELECT * FROM Moose
            WHERE created = (
                SELECT max(created) FROM Moose
            );
        `, (err, row) => {
            cb(err, rowToMoose(row));
        });
    }
    saveMoose(moose, cb) {
        this.db.run(`
            INSERT INTO Moose(
                name,
                created,
                image,
                shade,
                hd,
                shaded
            ) VALUES (
                $name,
                $created,
                $image,
                $shade,
                $hd,
                $shaded
            );
        `, mooseToRow(moose), cb);
    }
    bulkSaveMoose(meese, cb) {
        this.db.run('BEGIN TRANSACTION;', err => {
            if (err) return cb(err);
            each(meese, (moose, cb) => {
                this.saveMoose(moose, err => {
                    if (err) {
                        // unique name, means we likely have this moose
                        if (err.code === 'SQLITE_CONSTRAINT') cb();
                        else                                  cb(err);
                    }
                    else cb();
                });
            }, (e) => {
                if (e) {
                    this.db.run('ROLLBACK;', err => {
                        if (err) cb(e, err);
                        else     cb(e);
                    });
                }
                else {
                    this.db.run('COMMIT;', err => {
                        if (err) cb(err);
                        else     cb();
                    });
                }
            });
        });
    }
    deleteMoose(moose, cb) {
        this.db.run(`
            DELETE FROM Moose WHERE name = ?;
        `, moose, cb);
    }
    dumpMoose(cb) {
        this.db.all(`
            SELECT * FROM Moose;
        `, (err, rows) => {
            if (err) return cb(err);
            cb(err, rows.map(rowToMoose));
        });
    }
    [Symbol.asyncIterator]() {
        let page = 0;

        return {
            next: () => {
                return new Promise((resolve, reject) => {
                    this.getGalleryPage(
                        undefined /* unused query parameter */,
                        page*1000 /* page-num */,
                        1000 /* page-size */,
                        'oldest',
                        (err, meese) => {
                            if (err || !meese) {
                                reject({ done: true, value: dflt(err, Error('Unknwon')) });
                                return;
                            }
                            if (meese.length <= 0) {
                                resolve({ done: true });
                                return;
                            }

                            ++page;
                            resolve({ done: false, value: meese });
                        },
                    );
                });
            },
        };
    }
};
