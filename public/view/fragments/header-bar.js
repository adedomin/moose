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


const html = require('choo/html');

module.exports = function(activeTab, subtitle, status) {
    /* eslint indent: off */
    return html`
      <div>
      <div class="nav">
        <div class="nav-left">
          <a class="nav-item is-tab" href="#">
            <img src="moose.png" alt="Moose Logo">
          </a>
          <a class="nav-item ${activeTab === 'root' ? 'is-active' : ''} is-tab"
             href="#">
            Create
          </a>
          <a class="nav-item ${activeTab === 'gallery' ? 'is-active' : ''} is-tab"
             href="#gallery">
            Gallery
          </a>
          <a data-no-routing 
              class=" nav-item is-tab" 
              href="/dump"
          >
            DB Dump
          </a>
        </div>
      </div>

      <div class="hero is-${status}">
        <div class="hero-body">
          <div class="container">
            <h1 class="title">Moose</h1>
            <h2 class="subtitle">${subtitle}</h2>
          </div>
        </div>
      </div>
      </div>
    `;
};
