'use strict';
module.exports = function(t) {
    return new Promise(resolve => {
        setTimeout(() => resolve(), t);
    });
};
