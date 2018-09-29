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
const sqlite3 = require('sqlite3');

function rowToMoose(row) {
    return {
        id: row[0],
        name: row[1],
        created: row[2],
        image: row[3],
        shade: row[4],
        hd: row[5] == true,
        shaded: row[6] == true,
    };
}

class MooseDB {
    constructor(_db) {
        this.db = _db;
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS Moose (
                name TEXT NOT NULL,
                created TEXT NOT NULL,
                image BLOB NOT NULL,
                shade BLOB,
                hd INTEGER,
                shaded INTEGER
            );
            CREATE INDEX IF NOT EXISTS Moose_NameIdx ON Moose (name);
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
                INSERT INTO MooseSearch VALUES (NEW.rowid, NEW.name);
            END;
        `, err => {
            throw err;
        });
    }
    getMooseById(id, cb) {
        this.db.get('SELECT * FROM Moose WHERE rowid = ?;', id, cb);
    }
    getMooseByName(name, cb) {
        this.db.get('SELECT * FROM Moose WHERE name = ?;', name, cb);
    }
    findMooseByQuery(query, limit, cb) {
        this.db.all(`
            SELECT Moose.* FROM Moose
            INNER JOIN (
              SELECT moose_rowid FROM MooseSearch
              WHERE moose_name
              MATCH ?
              ORDER BY RANK
              LIMIT ?
            )
            ON Moose.rowid == moose_id;
        `, query, limit, cb);
    }
    getRandomMoose(cb) {
        this.db.get(`
            SELECT * FROM Moose
            LIMIT
                abs(RANDOM() % max(( SELECT count(*) FROM Moose ),1)),
                1;
        `, cb);
    }
    getLatestMoose(cb) {
        this.db.get(`
            SELECT * FROM Moose
            WHERE created = (
                SELECT max(created) FROM Moose
            );
        `, cb);
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
            )
        `, moose, cb);
    }
}

module.exports = (path) => {
    return MooseDB(
        new sqlite3.Database(
            path || require(process.env.CONFIG_PATH).moose.db
        )
    );
};
