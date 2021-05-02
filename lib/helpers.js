'use strict';

/**
   @param {number} t Time in miliseconds.
*/
function delay(t) {
    return new Promise(resolve => {
        setTimeout(() => resolve(), t);
    });
};

/** @enum {number} */
const SplitType = {
    word: 0,
    space: 1,
};

/**
 * Split string into tuples of type, value
 * @param {string} input
 * @returns {Generator<[SplitType, string]>} stream of tuples.
 */
function* split(input) {
    // start state depends on if we have leading space or not.
    let state = input[0] !== ' '
        ? /* word  */ SplitType.word
        : /* space */ SplitType.space;
    let tokenStart = 0;
    for (let i = 0; i < input.length; ++i) {
        const chr = input[i];
        switch (state) {
        case SplitType.word:
            if (chr === ' ') {
                yield [ SplitType.word, input.slice(tokenStart, i) ];
                tokenStart = i;
                state = SplitType.space;
            }
            break;
        case SplitType.space:
            if (chr !== ' ') {
                yield [ SplitType.space, input.slice(tokenStart, i) ];
                tokenStart = i;
                state = SplitType.word;
            }
            break;
        }
    }
    yield [ state, input.slice(tokenStart) ];
}

module.exports = {
    delay,
    SplitType,
    split,
};
