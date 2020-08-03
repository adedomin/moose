'use strict';

module.exports = function(value, defaultVal) {
    return value == null ? defaultVal : value;
};
