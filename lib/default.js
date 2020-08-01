'use strict';

module.exports = function(value, defaultVal) {
    return value == undefined ? defaultVal : value;
};
