(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util/');
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = (function () {
  return function foo() {}.name === 'foo';
}());
function pToString (obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' +  name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' +
         self.operator + ' ' +
         truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if ((actual === null || typeof actual !== 'object') &&
             (expected === null || typeof expected !== 'object')) {
    return strict ? actual === expected : actual == expected;

  // If both values are instances of typed arrays, wrap their underlying
  // ArrayBuffers in a Buffer each to increase performance
  // This optimization requires the arrays to have the same type as checked by
  // Object.prototype.toString (aka pToString). Never perform binary
  // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
  // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) &&
             pToString(actual) === pToString(expected) &&
             !(actual instanceof Float32Array ||
               actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer),
                   new Uint8Array(expected.buffer)) === 0;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || {actual: [], expected: []};

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b))
    return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
      return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}


// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if ((isUnwantedException &&
      userProvidedMessage &&
      expectedException(actual, expected)) ||
      isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function(err) { if (err) throw err; };

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"util/":55}],2:[function(require,module,exports){
'use strict';

var eachOf = require('async.eachof');
var withoutIndex = require('async.util.withoutindex');

module.exports = function each(arr, iterator, cb) {
    return eachOf(arr, withoutIndex(iterator), cb);
};

},{"async.eachof":3,"async.util.withoutindex":11}],3:[function(require,module,exports){
'use strict';

var once = require('async.util.once');
var noop = require('async.util.noop');
var onlyOnce = require('async.util.onlyonce');
var keyIterator = require('async.util.keyiterator');

module.exports = function eachOf(object, iterator, callback) {
    callback = once(callback || noop);
    object = object || [];

    var iter = keyIterator(object);
    var key, completed = 0;

    while ((key = iter()) != null) {
        completed += 1;
        iterator(object[key], key, onlyOnce(done));
    }

    if (completed === 0) callback(null);

    function done(err) {
        completed--;
        if (err) {
            callback(err);
        }
        // Check key is null in case iterator isn't exhausted
        // and done resolved synchronously.
        else if (key === null && completed <= 0) {
            callback(null);
        }
    }
};

},{"async.util.keyiterator":6,"async.util.noop":8,"async.util.once":9,"async.util.onlyonce":10}],4:[function(require,module,exports){
'use strict';

module.exports = Array.isArray || function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};

},{}],5:[function(require,module,exports){
'use strict';

var isArray = require('async.util.isarray');

module.exports = function isArrayLike(arr) {
    return isArray(arr) || (
        // has a positive integer length property
        typeof arr.length === 'number' &&
        arr.length >= 0 &&
        arr.length % 1 === 0
    );
};

},{"async.util.isarray":4}],6:[function(require,module,exports){
'use strict';

var _keys = require('async.util.keys');
var isArrayLike = require('async.util.isarraylike');

module.exports = function keyIterator(coll) {
    var i = -1;
    var len;
    var keys;
    if (isArrayLike(coll)) {
        len = coll.length;
        return function next() {
            i++;
            return i < len ? i : null;
        };
    } else {
        keys = _keys(coll);
        len = keys.length;
        return function next() {
            i++;
            return i < len ? keys[i] : null;
        };
    }
};

},{"async.util.isarraylike":5,"async.util.keys":7}],7:[function(require,module,exports){
'use strict';

module.exports = Object.keys || function keys(obj) {
    var _keys = [];
    for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
            _keys.push(k);
        }
    }
    return _keys;
};

},{}],8:[function(require,module,exports){
'use strict';

module.exports = function noop () {};

},{}],9:[function(require,module,exports){
'use strict';

module.exports = function once(fn) {
    return function() {
        if (fn === null) return;
        fn.apply(this, arguments);
        fn = null;
    };
};

},{}],10:[function(require,module,exports){
'use strict';

module.exports = function only_once(fn) {
    return function() {
        if (fn === null) throw new Error('Callback was already called.');
        fn.apply(this, arguments);
        fn = null;
    };
};

},{}],11:[function(require,module,exports){
'use strict';

module.exports = function withoutIndex(iterator) {
    return function(value, index, callback) {
        return iterator(value, callback);
    };
};

},{}],12:[function(require,module,exports){
var document = require('global/document')
var hyperx = require('hyperx')
var onload = require('on-load')

var SVGNS = 'http://www.w3.org/2000/svg'
var XLINKNS = 'http://www.w3.org/1999/xlink'

var BOOL_PROPS = {
  autofocus: 1,
  checked: 1,
  defaultchecked: 1,
  disabled: 1,
  formnovalidate: 1,
  indeterminate: 1,
  readonly: 1,
  required: 1,
  selected: 1,
  willvalidate: 1
}
var COMMENT_TAG = '!--'
var SVG_TAGS = [
  'svg',
  'altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor',
  'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile',
  'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix',
  'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting',
  'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB',
  'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode',
  'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting',
  'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'font', 'font-face',
  'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri',
  'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image', 'line',
  'linearGradient', 'marker', 'mask', 'metadata', 'missing-glyph', 'mpath',
  'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect',
  'set', 'stop', 'switch', 'symbol', 'text', 'textPath', 'title', 'tref',
  'tspan', 'use', 'view', 'vkern'
]

function belCreateElement (tag, props, children) {
  var el

  // If an svg tag, it needs a namespace
  if (SVG_TAGS.indexOf(tag) !== -1) {
    props.namespace = SVGNS
  }

  // If we are using a namespace
  var ns = false
  if (props.namespace) {
    ns = props.namespace
    delete props.namespace
  }

  // Create the element
  if (ns) {
    el = document.createElementNS(ns, tag)
  } else if (tag === COMMENT_TAG) {
    return document.createComment(props.comment)
  } else {
    el = document.createElement(tag)
  }

  // If adding onload events
  if (props.onload || props.onunload) {
    var load = props.onload || function () {}
    var unload = props.onunload || function () {}
    onload(el, function belOnload () {
      load(el)
    }, function belOnunload () {
      unload(el)
    },
    // We have to use non-standard `caller` to find who invokes `belCreateElement`
    belCreateElement.caller.caller.caller)
    delete props.onload
    delete props.onunload
  }

  // Create the properties
  for (var p in props) {
    if (props.hasOwnProperty(p)) {
      var key = p.toLowerCase()
      var val = props[p]
      // Normalize className
      if (key === 'classname') {
        key = 'class'
        p = 'class'
      }
      // The for attribute gets transformed to htmlFor, but we just set as for
      if (p === 'htmlFor') {
        p = 'for'
      }
      // If a property is boolean, set itself to the key
      if (BOOL_PROPS[key]) {
        if (val === 'true') val = key
        else if (val === 'false') continue
      }
      // If a property prefers being set directly vs setAttribute
      if (key.slice(0, 2) === 'on') {
        el[p] = val
      } else {
        if (ns) {
          if (p === 'xlink:href') {
            el.setAttributeNS(XLINKNS, p, val)
          } else if (/^xmlns($|:)/i.test(p)) {
            // skip xmlns definitions
          } else {
            el.setAttributeNS(null, p, val)
          }
        } else {
          el.setAttribute(p, val)
        }
      }
    }
  }

  function appendChild (childs) {
    if (!Array.isArray(childs)) return
    for (var i = 0; i < childs.length; i++) {
      var node = childs[i]
      if (Array.isArray(node)) {
        appendChild(node)
        continue
      }

      if (typeof node === 'number' ||
        typeof node === 'boolean' ||
        typeof node === 'function' ||
        node instanceof Date ||
        node instanceof RegExp) {
        node = node.toString()
      }

      if (typeof node === 'string') {
        if (el.lastChild && el.lastChild.nodeName === '#text') {
          el.lastChild.nodeValue += node
          continue
        }
        node = document.createTextNode(node)
      }

      if (node && node.nodeType) {
        el.appendChild(node)
      }
    }
  }
  appendChild(children)

  return el
}

module.exports = hyperx(belCreateElement, {comments: true})
module.exports.default = module.exports
module.exports.createElement = belCreateElement

},{"global/document":24,"hyperx":36,"on-load":49}],13:[function(require,module,exports){

},{}],14:[function(require,module,exports){
'use strict';
// For more information about browser field, check out the browser field at https://github.com/substack/browserify-handbook#browser-field.

var styleElementsInsertedAtTop = [];

var insertStyleElement = function(styleElement, options) {
    var head = document.head || document.getElementsByTagName('head')[0];
    var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];

    options = options || {};
    options.insertAt = options.insertAt || 'bottom';

    if (options.insertAt === 'top') {
        if (!lastStyleElementInsertedAtTop) {
            head.insertBefore(styleElement, head.firstChild);
        } else if (lastStyleElementInsertedAtTop.nextSibling) {
            head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
        } else {
            head.appendChild(styleElement);
        }
        styleElementsInsertedAtTop.push(styleElement);
    } else if (options.insertAt === 'bottom') {
        head.appendChild(styleElement);
    } else {
        throw new Error('Invalid value for parameter \'insertAt\'. Must be \'top\' or \'bottom\'.');
    }
};

module.exports = {
    // Create a <link> tag with optional data attributes
    createLink: function(href, attributes) {
        var head = document.head || document.getElementsByTagName('head')[0];
        var link = document.createElement('link');

        link.href = href;
        link.rel = 'stylesheet';

        for (var key in attributes) {
            if ( ! attributes.hasOwnProperty(key)) {
                continue;
            }
            var value = attributes[key];
            link.setAttribute('data-' + key, value);
        }

        head.appendChild(link);
    },
    // Create a <style> tag with optional data attributes
    createStyle: function(cssText, attributes, extraOptions) {
        extraOptions = extraOptions || {};

        var style = document.createElement('style');
        style.type = 'text/css';

        for (var key in attributes) {
            if ( ! attributes.hasOwnProperty(key)) {
                continue;
            }
            var value = attributes[key];
            style.setAttribute('data-' + key, value);
        }

        if (style.sheet) { // for jsdom and IE9+
            style.innerHTML = cssText;
            style.sheet.cssText = cssText;
            insertStyleElement(style, { insertAt: extraOptions.insertAt });
        } else if (style.styleSheet) { // for IE8 and below
            insertStyleElement(style, { insertAt: extraOptions.insertAt });
            style.styleSheet.cssText = cssText;
        } else { // for Chrome, Firefox, and Safari
            style.appendChild(document.createTextNode(cssText));
            insertStyleElement(style, { insertAt: extraOptions.insertAt });
        }
    }
};

},{}],15:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],16:[function(require,module,exports){
var css = "/*! bulma.io v0.4.1 | MIT License | github.com/jgthms/bulma */\n@-webkit-keyframes spinAround {\n  from {\n    -webkit-transform: rotate(0deg);\n    transform: rotate(0deg);\n  }\n\n  to {\n    -webkit-transform: rotate(359deg);\n    transform: rotate(359deg);\n  }\n}\n@keyframes spinAround {\n  from {\n    -webkit-transform: rotate(0deg);\n    transform: rotate(0deg);\n  }\n\n  to {\n    -webkit-transform: rotate(359deg);\n    transform: rotate(359deg);\n  }\n}\n/*! minireset.css v0.0.2 | MIT License | github.com/jgthms/minireset.css */\nhtml,\nbody,\np,\nol,\nul,\nli,\ndl,\ndt,\ndd,\nblockquote,\nfigure,\nfieldset,\nlegend,\ntextarea,\npre,\niframe,\nhr,\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  margin: 0;\n  padding: 0;\n}\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  font-size: 100%;\n  font-weight: normal;\n}\nul {\n  list-style: none;\n}\nbutton,\ninput,\nselect,\ntextarea {\n  margin: 0;\n}\nhtml {\n  box-sizing: border-box;\n}\n* {\n  box-sizing: inherit;\n}\n*:before,\n*:after {\n  box-sizing: inherit;\n}\nimg,\nembed,\nobject,\naudio,\nvideo {\n  height: auto;\n  max-width: 100%;\n}\niframe {\n  border: 0;\n}\ntable {\n  border-collapse: collapse;\n  border-spacing: 0;\n}\ntd,\nth {\n  padding: 0;\n  text-align: left;\n}\nhtml {\n  background-color: #fff;\n  font-size: 16px;\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n  min-width: 300px;\n  overflow-x: hidden;\n  overflow-y: scroll;\n  text-rendering: optimizeLegibility;\n}\narticle,\naside,\nfigure,\nfooter,\nheader,\nhgroup,\nsection {\n  display: block;\n}\nbody,\nbutton,\ninput,\nselect,\ntextarea {\n  font-family: BlinkMacSystemFont, -apple-system, \"Segoe UI\", \"Roboto\", \"Oxygen\", \"Ubuntu\", \"Cantarell\", \"Fira Sans\", \"Droid Sans\", \"Helvetica Neue\", \"Helvetica\", \"Arial\", sans-serif;\n}\ncode,\npre {\n  -moz-osx-font-smoothing: auto;\n  -webkit-font-smoothing: auto;\n  font-family: monospace;\n}\nbody {\n  color: #4a4a4a;\n  font-size: 1rem;\n  font-weight: 400;\n  line-height: 1.5;\n}\na {\n  color: #00d1b2;\n  cursor: pointer;\n  text-decoration: none;\n  -webkit-transition: none 86ms ease-out;\n  transition: none 86ms ease-out;\n}\na:hover {\n  color: #363636;\n}\ncode {\n  background-color: whitesmoke;\n  color: #ff3860;\n  font-size: 0.8em;\n  font-weight: normal;\n  padding: 0.25em 0.5em 0.25em;\n}\nhr {\n  background-color: #dbdbdb;\n  border: none;\n  display: block;\n  height: 1px;\n  margin: 1.5rem 0;\n}\nimg {\n  max-width: 100%;\n}\ninput[type=\"checkbox\"],\ninput[type=\"radio\"] {\n  vertical-align: baseline;\n}\nsmall {\n  font-size: 0.8em;\n}\nspan {\n  font-style: inherit;\n  font-weight: inherit;\n}\nstrong {\n  color: #363636;\n  font-weight: 700;\n}\npre {\n  background-color: whitesmoke;\n  color: #4a4a4a;\n  font-size: 0.8em;\n  white-space: pre;\n  word-wrap: normal;\n}\npre code {\n  -webkit-overflow-scrolling: touch;\n  background: none;\n  color: inherit;\n  display: block;\n  font-size: 1em;\n  overflow-x: auto;\n  padding: 1.25rem 1.5rem;\n}\ntable {\n  width: 100%;\n}\ntable td,\ntable th {\n  text-align: left;\n  vertical-align: top;\n}\ntable th {\n  color: #363636;\n}\n.is-block {\n  display: block;\n}\n@media screen and (max-width: 768px) {\n  .is-block-mobile {\n    display: block !important;\n  }\n}\n@media screen and (min-width: 769px), print {\n  .is-block-tablet {\n    display: block !important;\n  }\n}\n@media screen and (min-width: 769px) and (max-width: 999px) {\n  .is-block-tablet-only {\n    display: block !important;\n  }\n}\n@media screen and (max-width: 999px) {\n  .is-block-touch {\n    display: block !important;\n  }\n}\n@media screen and (min-width: 1000px) {\n  .is-block-desktop {\n    display: block !important;\n  }\n}\n@media screen and (min-width: 1000px) and (max-width: 1191px) {\n  .is-block-desktop-only {\n    display: block !important;\n  }\n}\n@media screen and (min-width: 1192px) {\n  .is-block-widescreen {\n    display: block !important;\n  }\n}\n.is-flex {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n}\n@media screen and (max-width: 768px) {\n  .is-flex-mobile {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n  }\n}\n@media screen and (min-width: 769px), print {\n  .is-flex-tablet {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n  }\n}\n@media screen and (min-width: 769px) and (max-width: 999px) {\n  .is-flex-tablet-only {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n  }\n}\n@media screen and (max-width: 999px) {\n  .is-flex-touch {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n  }\n}\n@media screen and (min-width: 1000px) {\n  .is-flex-desktop {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n  }\n}\n@media screen and (min-width: 1000px) and (max-width: 1191px) {\n  .is-flex-desktop-only {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n  }\n}\n@media screen and (min-width: 1192px) {\n  .is-flex-widescreen {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n  }\n}\n.is-inline {\n  display: inline;\n}\n@media screen and (max-width: 768px) {\n  .is-inline-mobile {\n    display: inline !important;\n  }\n}\n@media screen and (min-width: 769px), print {\n  .is-inline-tablet {\n    display: inline !important;\n  }\n}\n@media screen and (min-width: 769px) and (max-width: 999px) {\n  .is-inline-tablet-only {\n    display: inline !important;\n  }\n}\n@media screen and (max-width: 999px) {\n  .is-inline-touch {\n    display: inline !important;\n  }\n}\n@media screen and (min-width: 1000px) {\n  .is-inline-desktop {\n    display: inline !important;\n  }\n}\n@media screen and (min-width: 1000px) and (max-width: 1191px) {\n  .is-inline-desktop-only {\n    display: inline !important;\n  }\n}\n@media screen and (min-width: 1192px) {\n  .is-inline-widescreen {\n    display: inline !important;\n  }\n}\n.is-inline-block {\n  display: inline-block;\n}\n@media screen and (max-width: 768px) {\n  .is-inline-block-mobile {\n    display: inline-block !important;\n  }\n}\n@media screen and (min-width: 769px), print {\n  .is-inline-block-tablet {\n    display: inline-block !important;\n  }\n}\n@media screen and (min-width: 769px) and (max-width: 999px) {\n  .is-inline-block-tablet-only {\n    display: inline-block !important;\n  }\n}\n@media screen and (max-width: 999px) {\n  .is-inline-block-touch {\n    display: inline-block !important;\n  }\n}\n@media screen and (min-width: 1000px) {\n  .is-inline-block-desktop {\n    display: inline-block !important;\n  }\n}\n@media screen and (min-width: 1000px) and (max-width: 1191px) {\n  .is-inline-block-desktop-only {\n    display: inline-block !important;\n  }\n}\n@media screen and (min-width: 1192px) {\n  .is-inline-block-widescreen {\n    display: inline-block !important;\n  }\n}\n.is-inline-flex {\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n}\n@media screen and (max-width: 768px) {\n  .is-inline-flex-mobile {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n  }\n}\n@media screen and (min-width: 769px), print {\n  .is-inline-flex-tablet {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n  }\n}\n@media screen and (min-width: 769px) and (max-width: 999px) {\n  .is-inline-flex-tablet-only {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n  }\n}\n@media screen and (max-width: 999px) {\n  .is-inline-flex-touch {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n  }\n}\n@media screen and (min-width: 1000px) {\n  .is-inline-flex-desktop {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n  }\n}\n@media screen and (min-width: 1000px) and (max-width: 1191px) {\n  .is-inline-flex-desktop-only {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n  }\n}\n@media screen and (min-width: 1192px) {\n  .is-inline-flex-widescreen {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n  }\n}\n.is-clearfix:after {\n  clear: both;\n  content: \" \";\n  display: table;\n}\n.is-pulled-left {\n  float: left;\n}\n.is-pulled-right {\n  float: right;\n}\n.is-clipped {\n  overflow: hidden !important;\n}\n.is-overlay {\n  bottom: 0;\n  left: 0;\n  position: absolute;\n  right: 0;\n  top: 0;\n}\n.has-text-centered {\n  text-align: center;\n}\n.has-text-left {\n  text-align: left;\n}\n.has-text-right {\n  text-align: right;\n}\n.has-text-white {\n  color: white;\n}\na.has-text-white:hover,\na.has-text-white:focus {\n  color: #e6e6e6;\n}\n.has-text-black {\n  color: #0a0a0a;\n}\na.has-text-black:hover,\na.has-text-black:focus {\n  color: black;\n}\n.has-text-light {\n  color: whitesmoke;\n}\na.has-text-light:hover,\na.has-text-light:focus {\n  color: #dbdbdb;\n}\n.has-text-dark {\n  color: #363636;\n}\na.has-text-dark:hover,\na.has-text-dark:focus {\n  color: #1c1c1c;\n}\n.has-text-primary {\n  color: #00d1b2;\n}\na.has-text-primary:hover,\na.has-text-primary:focus {\n  color: #009e86;\n}\n.has-text-info {\n  color: #3273dc;\n}\na.has-text-info:hover,\na.has-text-info:focus {\n  color: #205bbc;\n}\n.has-text-success {\n  color: #23d160;\n}\na.has-text-success:hover,\na.has-text-success:focus {\n  color: #1ca64c;\n}\n.has-text-warning {\n  color: #ffdd57;\n}\na.has-text-warning:hover,\na.has-text-warning:focus {\n  color: #ffd324;\n}\n.has-text-danger {\n  color: #ff3860;\n}\na.has-text-danger:hover,\na.has-text-danger:focus {\n  color: #ff0537;\n}\n.is-hidden {\n  display: none !important;\n}\n@media screen and (max-width: 768px) {\n  .is-hidden-mobile {\n    display: none !important;\n  }\n}\n@media screen and (min-width: 769px), print {\n  .is-hidden-tablet {\n    display: none !important;\n  }\n}\n@media screen and (min-width: 769px) and (max-width: 999px) {\n  .is-hidden-tablet-only {\n    display: none !important;\n  }\n}\n@media screen and (max-width: 999px) {\n  .is-hidden-touch {\n    display: none !important;\n  }\n}\n@media screen and (min-width: 1000px) {\n  .is-hidden-desktop {\n    display: none !important;\n  }\n}\n@media screen and (min-width: 1000px) and (max-width: 1191px) {\n  .is-hidden-desktop-only {\n    display: none !important;\n  }\n}\n@media screen and (min-width: 1192px) {\n  .is-hidden-widescreen {\n    display: none !important;\n  }\n}\n.is-marginless {\n  margin: 0 !important;\n}\n.is-paddingless {\n  padding: 0 !important;\n}\n.is-unselectable {\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n.box {\n  background-color: white;\n  border-radius: 5px;\n  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);\n  display: block;\n  padding: 1.25rem;\n}\n.box:not(:last-child) {\n  margin-bottom: 1.5rem;\n}\na.box:hover,\na.box:focus {\n  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px #00d1b2;\n}\na.box:active {\n  box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.2), 0 0 0 1px #00d1b2;\n}\n.button {\n  -moz-appearance: none;\n  -webkit-appearance: none;\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  border: 1px solid transparent;\n  border-radius: 3px;\n  box-shadow: none;\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  font-size: 1rem;\n  height: 2.25em;\n  -webkit-box-pack: start;\n  -ms-flex-pack: start;\n  justify-content: flex-start;\n  line-height: 1.5;\n  padding-bottom: calc(0.375em - 1px);\n  padding-left: calc(0.625em - 1px);\n  padding-right: calc(0.625em - 1px);\n  padding-top: calc(0.375em - 1px);\n  position: relative;\n  vertical-align: top;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  background-color: white;\n  border-color: #dbdbdb;\n  color: #363636;\n  cursor: pointer;\n  -webkit-box-pack: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n  padding-left: 0.75em;\n  padding-right: 0.75em;\n  text-align: center;\n  white-space: nowrap;\n}\n.button:focus,\n.button.is-focused,\n.button:active,\n.button.is-active {\n  outline: none;\n}\n.button[disabled] {\n  cursor: not-allowed;\n}\n.button strong {\n  color: inherit;\n}\n.button .icon,\n.button .icon.is-small,\n.button .icon.is-medium,\n.button .icon.is-large {\n  height: 1.5em;\n  width: 1.5em;\n}\n.button .icon:first-child:not(:last-child) {\n  margin-left: calc(-0.375em - 1px);\n  margin-right: 0.1875em;\n}\n.button .icon:last-child:not(:first-child) {\n  margin-left: 0.1875em;\n  margin-right: calc(-0.375em - 1px);\n}\n.button .icon:first-child:last-child {\n  margin-left: calc(-0.375em - 1px);\n  margin-right: calc(-0.375em - 1px);\n}\n.button:hover,\n.button.is-hovered {\n  border-color: #b5b5b5;\n  color: #363636;\n}\n.button:focus,\n.button.is-focused {\n  border-color: #00d1b2;\n  box-shadow: 0 0 0.5em rgba(0, 209, 178, 0.25);\n  color: #363636;\n}\n.button:active,\n.button.is-active {\n  border-color: #4a4a4a;\n  box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.2);\n  color: #363636;\n}\n.button.is-link {\n  background-color: transparent;\n  border-color: transparent;\n  color: #4a4a4a;\n  text-decoration: underline;\n}\n.button.is-link:hover,\n.button.is-link.is-hovered,\n.button.is-link:focus,\n.button.is-link.is-focused,\n.button.is-link:active,\n.button.is-link.is-active {\n  background-color: whitesmoke;\n  color: #363636;\n}\n.button.is-link[disabled] {\n  background-color: transparent;\n  border-color: transparent;\n  box-shadow: none;\n}\n.button.is-white {\n  background-color: white;\n  border-color: transparent;\n  color: #0a0a0a;\n}\n.button.is-white:hover,\n.button.is-white.is-hovered {\n  background-color: #f9f9f9;\n  border-color: transparent;\n  color: #0a0a0a;\n}\n.button.is-white:focus,\n.button.is-white.is-focused {\n  border-color: transparent;\n  box-shadow: 0 0 0.5em rgba(255, 255, 255, 0.25);\n  color: #0a0a0a;\n}\n.button.is-white:active,\n.button.is-white.is-active {\n  background-color: #f2f2f2;\n  border-color: transparent;\n  box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.2);\n  color: #0a0a0a;\n}\n.button.is-white[disabled] {\n  background-color: white;\n  border-color: transparent;\n  box-shadow: none;\n}\n.button.is-white.is-inverted {\n  background-color: #0a0a0a;\n  color: white;\n}\n.button.is-white.is-inverted:hover {\n  background-color: black;\n}\n.button.is-white.is-inverted[disabled] {\n  background-color: #0a0a0a;\n  border-color: transparent;\n  box-shadow: none;\n  color: white;\n}\n.button.is-white.is-loading:after {\n  border-color: transparent transparent #0a0a0a #0a0a0a !important;\n}\n.button.is-white.is-outlined {\n  background-color: transparent;\n  border-color: white;\n  color: white;\n}\n.button.is-white.is-outlined:hover,\n.button.is-white.is-outlined:focus {\n  background-color: white;\n  border-color: white;\n  color: #0a0a0a;\n}\n.button.is-white.is-outlined.is-loading:after {\n  border-color: transparent transparent white white !important;\n}\n.button.is-white.is-outlined[disabled] {\n  background-color: transparent;\n  border-color: white;\n  box-shadow: none;\n  color: white;\n}\n.button.is-white.is-inverted.is-outlined {\n  background-color: transparent;\n  border-color: #0a0a0a;\n  color: #0a0a0a;\n}\n.button.is-white.is-inverted.is-outlined:hover,\n.button.is-white.is-inverted.is-outlined:focus {\n  background-color: #0a0a0a;\n  color: white;\n}\n.button.is-white.is-inverted.is-outlined[disabled] {\n  background-color: transparent;\n  border-color: #0a0a0a;\n  box-shadow: none;\n  color: #0a0a0a;\n}\n.button.is-black {\n  background-color: #0a0a0a;\n  border-color: transparent;\n  color: white;\n}\n.button.is-black:hover,\n.button.is-black.is-hovered {\n  background-color: #040404;\n  border-color: transparent;\n  color: white;\n}\n.button.is-black:focus,\n.button.is-black.is-focused {\n  border-color: transparent;\n  box-shadow: 0 0 0.5em rgba(10, 10, 10, 0.25);\n  color: white;\n}\n.button.is-black:active,\n.button.is-black.is-active {\n  background-color: black;\n  border-color: transparent;\n  box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.2);\n  color: white;\n}\n.button.is-black[disabled] {\n  background-color: #0a0a0a;\n  border-color: transparent;\n  box-shadow: none;\n}\n.button.is-black.is-inverted {\n  background-color: white;\n  color: #0a0a0a;\n}\n.button.is-black.is-inverted:hover {\n  background-color: #f2f2f2;\n}\n.button.is-black.is-inverted[disabled] {\n  background-color: white;\n  border-color: transparent;\n  box-shadow: none;\n  color: #0a0a0a;\n}\n.button.is-black.is-loading:after {\n  border-color: transparent transparent white white !important;\n}\n.button.is-black.is-outlined {\n  background-color: transparent;\n  border-color: #0a0a0a;\n  color: #0a0a0a;\n}\n.button.is-black.is-outlined:hover,\n.button.is-black.is-outlined:focus {\n  background-color: #0a0a0a;\n  border-color: #0a0a0a;\n  color: white;\n}\n.button.is-black.is-outlined.is-loading:after {\n  border-color: transparent transparent #0a0a0a #0a0a0a !important;\n}\n.button.is-black.is-outlined[disabled] {\n  background-color: transparent;\n  border-color: #0a0a0a;\n  box-shadow: none;\n  color: #0a0a0a;\n}\n.button.is-black.is-inverted.is-outlined {\n  background-color: transparent;\n  border-color: white;\n  color: white;\n}\n.button.is-black.is-inverted.is-outlined:hover,\n.button.is-black.is-inverted.is-outlined:focus {\n  background-color: white;\n  color: #0a0a0a;\n}\n.button.is-black.is-inverted.is-outlined[disabled] {\n  background-color: transparent;\n  border-color: white;\n  box-shadow: none;\n  color: white;\n}\n.button.is-light {\n  background-color: whitesmoke;\n  border-color: transparent;\n  color: #363636;\n}\n.button.is-light:hover,\n.button.is-light.is-hovered {\n  background-color: #eeeeee;\n  border-color: transparent;\n  color: #363636;\n}\n.button.is-light:focus,\n.button.is-light.is-focused {\n  border-color: transparent;\n  box-shadow: 0 0 0.5em rgba(245, 245, 245, 0.25);\n  color: #363636;\n}\n.button.is-light:active,\n.button.is-light.is-active {\n  background-color: #e8e8e8;\n  border-color: transparent;\n  box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.2);\n  color: #363636;\n}\n.button.is-light[disabled] {\n  background-color: whitesmoke;\n  border-color: transparent;\n  box-shadow: none;\n}\n.button.is-light.is-inverted {\n  background-color: #363636;\n  color: whitesmoke;\n}\n.button.is-light.is-inverted:hover {\n  background-color: #292929;\n}\n.button.is-light.is-inverted[disabled] {\n  background-color: #363636;\n  border-color: transparent;\n  box-shadow: none;\n  color: whitesmoke;\n}\n.button.is-light.is-loading:after {\n  border-color: transparent transparent #363636 #363636 !important;\n}\n.button.is-light.is-outlined {\n  background-color: transparent;\n  border-color: whitesmoke;\n  color: whitesmoke;\n}\n.button.is-light.is-outlined:hover,\n.button.is-light.is-outlined:focus {\n  background-color: whitesmoke;\n  border-color: whitesmoke;\n  color: #363636;\n}\n.button.is-light.is-outlined.is-loading:after {\n  border-color: transparent transparent whitesmoke whitesmoke !important;\n}\n.button.is-light.is-outlined[disabled] {\n  background-color: transparent;\n  border-color: whitesmoke;\n  box-shadow: none;\n  color: whitesmoke;\n}\n.button.is-light.is-inverted.is-outlined {\n  background-color: transparent;\n  border-color: #363636;\n  color: #363636;\n}\n.button.is-light.is-inverted.is-outlined:hover,\n.button.is-light.is-inverted.is-outlined:focus {\n  background-color: #363636;\n  color: whitesmoke;\n}\n.button.is-light.is-inverted.is-outlined[disabled] {\n  background-color: transparent;\n  border-color: #363636;\n  box-shadow: none;\n  color: #363636;\n}\n.button.is-dark {\n  background-color: #363636;\n  border-color: transparent;\n  color: whitesmoke;\n}\n.button.is-dark:hover,\n.button.is-dark.is-hovered {\n  background-color: #2f2f2f;\n  border-color: transparent;\n  color: whitesmoke;\n}\n.button.is-dark:focus,\n.button.is-dark.is-focused {\n  border-color: transparent;\n  box-shadow: 0 0 0.5em rgba(54, 54, 54, 0.25);\n  color: whitesmoke;\n}\n.button.is-dark:active,\n.button.is-dark.is-active {\n  background-color: #292929;\n  border-color: transparent;\n  box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.2);\n  color: whitesmoke;\n}\n.button.is-dark[disabled] {\n  background-color: #363636;\n  border-color: transparent;\n  box-shadow: none;\n}\n.button.is-dark.is-inverted {\n  background-color: whitesmoke;\n  color: #363636;\n}\n.button.is-dark.is-inverted:hover {\n  background-color: #e8e8e8;\n}\n.button.is-dark.is-inverted[disabled] {\n  background-color: whitesmoke;\n  border-color: transparent;\n  box-shadow: none;\n  color: #363636;\n}\n.button.is-dark.is-loading:after {\n  border-color: transparent transparent whitesmoke whitesmoke !important;\n}\n.button.is-dark.is-outlined {\n  background-color: transparent;\n  border-color: #363636;\n  color: #363636;\n}\n.button.is-dark.is-outlined:hover,\n.button.is-dark.is-outlined:focus {\n  background-color: #363636;\n  border-color: #363636;\n  color: whitesmoke;\n}\n.button.is-dark.is-outlined.is-loading:after {\n  border-color: transparent transparent #363636 #363636 !important;\n}\n.button.is-dark.is-outlined[disabled] {\n  background-color: transparent;\n  border-color: #363636;\n  box-shadow: none;\n  color: #363636;\n}\n.button.is-dark.is-inverted.is-outlined {\n  background-color: transparent;\n  border-color: whitesmoke;\n  color: whitesmoke;\n}\n.button.is-dark.is-inverted.is-outlined:hover,\n.button.is-dark.is-inverted.is-outlined:focus {\n  background-color: whitesmoke;\n  color: #363636;\n}\n.button.is-dark.is-inverted.is-outlined[disabled] {\n  background-color: transparent;\n  border-color: whitesmoke;\n  box-shadow: none;\n  color: whitesmoke;\n}\n.button.is-primary {\n  background-color: #00d1b2;\n  border-color: transparent;\n  color: #fff;\n}\n.button.is-primary:hover,\n.button.is-primary.is-hovered {\n  background-color: #00c4a7;\n  border-color: transparent;\n  color: #fff;\n}\n.button.is-primary:focus,\n.button.is-primary.is-focused {\n  border-color: transparent;\n  box-shadow: 0 0 0.5em rgba(0, 209, 178, 0.25);\n  color: #fff;\n}\n.button.is-primary:active,\n.button.is-primary.is-active {\n  background-color: #00b89c;\n  border-color: transparent;\n  box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.2);\n  color: #fff;\n}\n.button.is-primary[disabled] {\n  background-color: #00d1b2;\n  border-color: transparent;\n  box-shadow: none;\n}\n.button.is-primary.is-inverted {\n  background-color: #fff;\n  color: #00d1b2;\n}\n.button.is-primary.is-inverted:hover {\n  background-color: #f2f2f2;\n}\n.button.is-primary.is-inverted[disabled] {\n  background-color: #fff;\n  border-color: transparent;\n  box-shadow: none;\n  color: #00d1b2;\n}\n.button.is-primary.is-loading:after {\n  border-color: transparent transparent #fff #fff !important;\n}\n.button.is-primary.is-outlined {\n  background-color: transparent;\n  border-color: #00d1b2;\n  color: #00d1b2;\n}\n.button.is-primary.is-outlined:hover,\n.button.is-primary.is-outlined:focus {\n  background-color: #00d1b2;\n  border-color: #00d1b2;\n  color: #fff;\n}\n.button.is-primary.is-outlined.is-loading:after {\n  border-color: transparent transparent #00d1b2 #00d1b2 !important;\n}\n.button.is-primary.is-outlined[disabled] {\n  background-color: transparent;\n  border-color: #00d1b2;\n  box-shadow: none;\n  color: #00d1b2;\n}\n.button.is-primary.is-inverted.is-outlined {\n  background-color: transparent;\n  border-color: #fff;\n  color: #fff;\n}\n.button.is-primary.is-inverted.is-outlined:hover,\n.button.is-primary.is-inverted.is-outlined:focus {\n  background-color: #fff;\n  color: #00d1b2;\n}\n.button.is-primary.is-inverted.is-outlined[disabled] {\n  background-color: transparent;\n  border-color: #fff;\n  box-shadow: none;\n  color: #fff;\n}\n.button.is-info {\n  background-color: #3273dc;\n  border-color: transparent;\n  color: #fff;\n}\n.button.is-info:hover,\n.button.is-info.is-hovered {\n  background-color: #276cda;\n  border-color: transparent;\n  color: #fff;\n}\n.button.is-info:focus,\n.button.is-info.is-focused {\n  border-color: transparent;\n  box-shadow: 0 0 0.5em rgba(50, 115, 220, 0.25);\n  color: #fff;\n}\n.button.is-info:active,\n.button.is-info.is-active {\n  background-color: #2366d1;\n  border-color: transparent;\n  box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.2);\n  color: #fff;\n}\n.button.is-info[disabled] {\n  background-color: #3273dc;\n  border-color: transparent;\n  box-shadow: none;\n}\n.button.is-info.is-inverted {\n  background-color: #fff;\n  color: #3273dc;\n}\n.button.is-info.is-inverted:hover {\n  background-color: #f2f2f2;\n}\n.button.is-info.is-inverted[disabled] {\n  background-color: #fff;\n  border-color: transparent;\n  box-shadow: none;\n  color: #3273dc;\n}\n.button.is-info.is-loading:after {\n  border-color: transparent transparent #fff #fff !important;\n}\n.button.is-info.is-outlined {\n  background-color: transparent;\n  border-color: #3273dc;\n  color: #3273dc;\n}\n.button.is-info.is-outlined:hover,\n.button.is-info.is-outlined:focus {\n  background-color: #3273dc;\n  border-color: #3273dc;\n  color: #fff;\n}\n.button.is-info.is-outlined.is-loading:after {\n  border-color: transparent transparent #3273dc #3273dc !important;\n}\n.button.is-info.is-outlined[disabled] {\n  background-color: transparent;\n  border-color: #3273dc;\n  box-shadow: none;\n  color: #3273dc;\n}\n.button.is-info.is-inverted.is-outlined {\n  background-color: transparent;\n  border-color: #fff;\n  color: #fff;\n}\n.button.is-info.is-inverted.is-outlined:hover,\n.button.is-info.is-inverted.is-outlined:focus {\n  background-color: #fff;\n  color: #3273dc;\n}\n.button.is-info.is-inverted.is-outlined[disabled] {\n  background-color: transparent;\n  border-color: #fff;\n  box-shadow: none;\n  color: #fff;\n}\n.button.is-success {\n  background-color: #23d160;\n  border-color: transparent;\n  color: #fff;\n}\n.button.is-success:hover,\n.button.is-success.is-hovered {\n  background-color: #22c65b;\n  border-color: transparent;\n  color: #fff;\n}\n.button.is-success:focus,\n.button.is-success.is-focused {\n  border-color: transparent;\n  box-shadow: 0 0 0.5em rgba(35, 209, 96, 0.25);\n  color: #fff;\n}\n.button.is-success:active,\n.button.is-success.is-active {\n  background-color: #20bc56;\n  border-color: transparent;\n  box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.2);\n  color: #fff;\n}\n.button.is-success[disabled] {\n  background-color: #23d160;\n  border-color: transparent;\n  box-shadow: none;\n}\n.button.is-success.is-inverted {\n  background-color: #fff;\n  color: #23d160;\n}\n.button.is-success.is-inverted:hover {\n  background-color: #f2f2f2;\n}\n.button.is-success.is-inverted[disabled] {\n  background-color: #fff;\n  border-color: transparent;\n  box-shadow: none;\n  color: #23d160;\n}\n.button.is-success.is-loading:after {\n  border-color: transparent transparent #fff #fff !important;\n}\n.button.is-success.is-outlined {\n  background-color: transparent;\n  border-color: #23d160;\n  color: #23d160;\n}\n.button.is-success.is-outlined:hover,\n.button.is-success.is-outlined:focus {\n  background-color: #23d160;\n  border-color: #23d160;\n  color: #fff;\n}\n.button.is-success.is-outlined.is-loading:after {\n  border-color: transparent transparent #23d160 #23d160 !important;\n}\n.button.is-success.is-outlined[disabled] {\n  background-color: transparent;\n  border-color: #23d160;\n  box-shadow: none;\n  color: #23d160;\n}\n.button.is-success.is-inverted.is-outlined {\n  background-color: transparent;\n  border-color: #fff;\n  color: #fff;\n}\n.button.is-success.is-inverted.is-outlined:hover,\n.button.is-success.is-inverted.is-outlined:focus {\n  background-color: #fff;\n  color: #23d160;\n}\n.button.is-success.is-inverted.is-outlined[disabled] {\n  background-color: transparent;\n  border-color: #fff;\n  box-shadow: none;\n  color: #fff;\n}\n.button.is-warning {\n  background-color: #ffdd57;\n  border-color: transparent;\n  color: rgba(0, 0, 0, 0.7);\n}\n.button.is-warning:hover,\n.button.is-warning.is-hovered {\n  background-color: #ffdb4a;\n  border-color: transparent;\n  color: rgba(0, 0, 0, 0.7);\n}\n.button.is-warning:focus,\n.button.is-warning.is-focused {\n  border-color: transparent;\n  box-shadow: 0 0 0.5em rgba(255, 221, 87, 0.25);\n  color: rgba(0, 0, 0, 0.7);\n}\n.button.is-warning:active,\n.button.is-warning.is-active {\n  background-color: #ffd83d;\n  border-color: transparent;\n  box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.2);\n  color: rgba(0, 0, 0, 0.7);\n}\n.button.is-warning[disabled] {\n  background-color: #ffdd57;\n  border-color: transparent;\n  box-shadow: none;\n}\n.button.is-warning.is-inverted {\n  background-color: rgba(0, 0, 0, 0.7);\n  color: #ffdd57;\n}\n.button.is-warning.is-inverted:hover {\n  background-color: rgba(0, 0, 0, 0.7);\n}\n.button.is-warning.is-inverted[disabled] {\n  background-color: rgba(0, 0, 0, 0.7);\n  border-color: transparent;\n  box-shadow: none;\n  color: #ffdd57;\n}\n.button.is-warning.is-loading:after {\n  border-color: transparent transparent rgba(0, 0, 0, 0.7) rgba(0, 0, 0, 0.7) !important;\n}\n.button.is-warning.is-outlined {\n  background-color: transparent;\n  border-color: #ffdd57;\n  color: #ffdd57;\n}\n.button.is-warning.is-outlined:hover,\n.button.is-warning.is-outlined:focus {\n  background-color: #ffdd57;\n  border-color: #ffdd57;\n  color: rgba(0, 0, 0, 0.7);\n}\n.button.is-warning.is-outlined.is-loading:after {\n  border-color: transparent transparent #ffdd57 #ffdd57 !important;\n}\n.button.is-warning.is-outlined[disabled] {\n  background-color: transparent;\n  border-color: #ffdd57;\n  box-shadow: none;\n  color: #ffdd57;\n}\n.button.is-warning.is-inverted.is-outlined {\n  background-color: transparent;\n  border-color: rgba(0, 0, 0, 0.7);\n  color: rgba(0, 0, 0, 0.7);\n}\n.button.is-warning.is-inverted.is-outlined:hover,\n.button.is-warning.is-inverted.is-outlined:focus {\n  background-color: rgba(0, 0, 0, 0.7);\n  color: #ffdd57;\n}\n.button.is-warning.is-inverted.is-outlined[disabled] {\n  background-color: transparent;\n  border-color: rgba(0, 0, 0, 0.7);\n  box-shadow: none;\n  color: rgba(0, 0, 0, 0.7);\n}\n.button.is-danger {\n  background-color: #ff3860;\n  border-color: transparent;\n  color: #fff;\n}\n.button.is-danger:hover,\n.button.is-danger.is-hovered {\n  background-color: #ff2b56;\n  border-color: transparent;\n  color: #fff;\n}\n.button.is-danger:focus,\n.button.is-danger.is-focused {\n  border-color: transparent;\n  box-shadow: 0 0 0.5em rgba(255, 56, 96, 0.25);\n  color: #fff;\n}\n.button.is-danger:active,\n.button.is-danger.is-active {\n  background-color: #ff1f4b;\n  border-color: transparent;\n  box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.2);\n  color: #fff;\n}\n.button.is-danger[disabled] {\n  background-color: #ff3860;\n  border-color: transparent;\n  box-shadow: none;\n}\n.button.is-danger.is-inverted {\n  background-color: #fff;\n  color: #ff3860;\n}\n.button.is-danger.is-inverted:hover {\n  background-color: #f2f2f2;\n}\n.button.is-danger.is-inverted[disabled] {\n  background-color: #fff;\n  border-color: transparent;\n  box-shadow: none;\n  color: #ff3860;\n}\n.button.is-danger.is-loading:after {\n  border-color: transparent transparent #fff #fff !important;\n}\n.button.is-danger.is-outlined {\n  background-color: transparent;\n  border-color: #ff3860;\n  color: #ff3860;\n}\n.button.is-danger.is-outlined:hover,\n.button.is-danger.is-outlined:focus {\n  background-color: #ff3860;\n  border-color: #ff3860;\n  color: #fff;\n}\n.button.is-danger.is-outlined.is-loading:after {\n  border-color: transparent transparent #ff3860 #ff3860 !important;\n}\n.button.is-danger.is-outlined[disabled] {\n  background-color: transparent;\n  border-color: #ff3860;\n  box-shadow: none;\n  color: #ff3860;\n}\n.button.is-danger.is-inverted.is-outlined {\n  background-color: transparent;\n  border-color: #fff;\n  color: #fff;\n}\n.button.is-danger.is-inverted.is-outlined:hover,\n.button.is-danger.is-inverted.is-outlined:focus {\n  background-color: #fff;\n  color: #ff3860;\n}\n.button.is-danger.is-inverted.is-outlined[disabled] {\n  background-color: transparent;\n  border-color: #fff;\n  box-shadow: none;\n  color: #fff;\n}\n.button.is-small {\n  border-radius: 2px;\n  font-size: 0.75rem;\n}\n.button.is-medium {\n  font-size: 1.25rem;\n}\n.button.is-large {\n  font-size: 1.5rem;\n}\n.button[disabled] {\n  background-color: white;\n  border-color: #dbdbdb;\n  box-shadow: none;\n  opacity: 0.5;\n}\n.button.is-fullwidth {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  width: 100%;\n}\n.button.is-loading {\n  color: transparent !important;\n  pointer-events: none;\n}\n.button.is-loading:after {\n  -webkit-animation: spinAround 500ms infinite linear;\n  animation: spinAround 500ms infinite linear;\n  border: 2px solid #dbdbdb;\n  border-radius: 290486px;\n  border-right-color: transparent;\n  border-top-color: transparent;\n  content: \"\";\n  display: block;\n  height: 1em;\n  position: relative;\n  width: 1em;\n  position: absolute;\n  left: calc(50% - (1em / 2));\n  top: calc(50% - (1em / 2));\n  position: absolute !important;\n}\nbutton.button,\ninput[type=\"submit\"].button {\n  line-height: 1;\n  padding-bottom: 0.4em;\n  padding-top: 0.35em;\n}\n.content {\n  color: #4a4a4a;\n}\n.content:not(:last-child) {\n  margin-bottom: 1.5rem;\n}\n.content li + li {\n  margin-top: 0.25em;\n}\n.content p:not(:last-child),\n.content dl:not(:last-child),\n.content ol:not(:last-child),\n.content ul:not(:last-child),\n.content blockquote:not(:last-child),\n.content pre:not(:last-child),\n.content table:not(:last-child) {\n  margin-bottom: 1em;\n}\n.content h1,\n.content h2,\n.content h3,\n.content h4,\n.content h5,\n.content h6 {\n  color: #363636;\n  font-weight: 400;\n  line-height: 1.125;\n}\n.content h1 {\n  font-size: 2em;\n  margin-bottom: 0.5em;\n}\n.content h1:not(:first-child) {\n  margin-top: 1em;\n}\n.content h2 {\n  font-size: 1.75em;\n  margin-bottom: 0.5714em;\n}\n.content h2:not(:first-child) {\n  margin-top: 1.1428em;\n}\n.content h3 {\n  font-size: 1.5em;\n  margin-bottom: 0.6666em;\n}\n.content h3:not(:first-child) {\n  margin-top: 1.3333em;\n}\n.content h4 {\n  font-size: 1.25em;\n  margin-bottom: 0.8em;\n}\n.content h5 {\n  font-size: 1.125em;\n  margin-bottom: 0.8888em;\n}\n.content h6 {\n  font-size: 1em;\n  margin-bottom: 1em;\n}\n.content blockquote {\n  background-color: whitesmoke;\n  border-left: 5px solid #dbdbdb;\n  padding: 1.25em 1.5em;\n}\n.content ol {\n  list-style: decimal outside;\n  margin-left: 2em;\n  margin-right: 2em;\n  margin-top: 1em;\n}\n.content ul {\n  list-style: disc outside;\n  margin-left: 2em;\n  margin-right: 2em;\n  margin-top: 1em;\n}\n.content ul ul {\n  list-style-type: circle;\n  margin-top: 0.5em;\n}\n.content ul ul ul {\n  list-style-type: square;\n}\n.content dd {\n  margin-left: 2em;\n}\n.content pre {\n  -webkit-overflow-scrolling: touch;\n  overflow-x: auto;\n  padding: 1.25em 1.5em;\n  white-space: pre;\n  word-wrap: normal;\n}\n.content table {\n  width: 100%;\n}\n.content table td,\n.content table th {\n  border: 1px solid #dbdbdb;\n  border-width: 0 0 1px;\n  padding: 0.5em 0.75em;\n  vertical-align: top;\n}\n.content table th {\n  color: #363636;\n  text-align: left;\n}\n.content table tr:hover {\n  background-color: whitesmoke;\n}\n.content table thead td,\n.content table thead th {\n  border-width: 0 0 2px;\n  color: #363636;\n}\n.content table tfoot td,\n.content table tfoot th {\n  border-width: 2px 0 0;\n  color: #363636;\n}\n.content table tbody tr:last-child td,\n.content table tbody tr:last-child th {\n  border-bottom-width: 0;\n}\n.content.is-small {\n  font-size: 0.75rem;\n}\n.content.is-medium {\n  font-size: 1.25rem;\n}\n.content.is-large {\n  font-size: 1.5rem;\n}\n.input,\n.textarea {\n  -moz-appearance: none;\n  -webkit-appearance: none;\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  border: 1px solid transparent;\n  border-radius: 3px;\n  box-shadow: none;\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  font-size: 1rem;\n  height: 2.25em;\n  -webkit-box-pack: start;\n  -ms-flex-pack: start;\n  justify-content: flex-start;\n  line-height: 1.5;\n  padding-bottom: calc(0.375em - 1px);\n  padding-left: calc(0.625em - 1px);\n  padding-right: calc(0.625em - 1px);\n  padding-top: calc(0.375em - 1px);\n  position: relative;\n  vertical-align: top;\n  background-color: white;\n  border-color: #dbdbdb;\n  color: #363636;\n  box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.1);\n  max-width: 100%;\n  width: 100%;\n}\n.input:focus,\n.input.is-focused,\n.input:active,\n.input.is-active,\n.textarea:focus,\n.textarea.is-focused,\n.textarea:active,\n.textarea.is-active {\n  outline: none;\n}\n.input[disabled],\n.textarea[disabled] {\n  cursor: not-allowed;\n}\n.input:hover,\n.input.is-hovered,\n.textarea:hover,\n.textarea.is-hovered {\n  border-color: #b5b5b5;\n}\n.input:focus,\n.input.is-focused,\n.input:active,\n.input.is-active,\n.textarea:focus,\n.textarea.is-focused,\n.textarea:active,\n.textarea.is-active {\n  border-color: #00d1b2;\n}\n.input[disabled],\n.textarea[disabled] {\n  background-color: whitesmoke;\n  border-color: whitesmoke;\n  box-shadow: none;\n  color: #7a7a7a;\n}\n.input[disabled]::-moz-placeholder,\n.textarea[disabled]::-moz-placeholder {\n  color: rgba(54, 54, 54, 0.3);\n}\n.input[disabled]::-webkit-input-placeholder,\n.textarea[disabled]::-webkit-input-placeholder {\n  color: rgba(54, 54, 54, 0.3);\n}\n.input[disabled]:-moz-placeholder,\n.textarea[disabled]:-moz-placeholder {\n  color: rgba(54, 54, 54, 0.3);\n}\n.input[disabled]:-ms-input-placeholder,\n.textarea[disabled]:-ms-input-placeholder {\n  color: rgba(54, 54, 54, 0.3);\n}\n.input[type=\"search\"],\n.textarea[type=\"search\"] {\n  border-radius: 290486px;\n}\n.input.is-white,\n.textarea.is-white {\n  border-color: white;\n}\n.input.is-black,\n.textarea.is-black {\n  border-color: #0a0a0a;\n}\n.input.is-light,\n.textarea.is-light {\n  border-color: whitesmoke;\n}\n.input.is-dark,\n.textarea.is-dark {\n  border-color: #363636;\n}\n.input.is-primary,\n.textarea.is-primary {\n  border-color: #00d1b2;\n}\n.input.is-info,\n.textarea.is-info {\n  border-color: #3273dc;\n}\n.input.is-success,\n.textarea.is-success {\n  border-color: #23d160;\n}\n.input.is-warning,\n.textarea.is-warning {\n  border-color: #ffdd57;\n}\n.input.is-danger,\n.textarea.is-danger {\n  border-color: #ff3860;\n}\n.input.is-small,\n.textarea.is-small {\n  border-radius: 2px;\n  font-size: 0.75rem;\n}\n.input.is-medium,\n.textarea.is-medium {\n  font-size: 1.25rem;\n}\n.input.is-large,\n.textarea.is-large {\n  font-size: 1.5rem;\n}\n.input.is-fullwidth,\n.textarea.is-fullwidth {\n  display: block;\n  width: 100%;\n}\n.input.is-inline,\n.textarea.is-inline {\n  display: inline;\n  width: auto;\n}\n.textarea {\n  display: block;\n  max-height: 600px;\n  max-width: 100%;\n  min-height: 120px;\n  min-width: 100%;\n  padding: 0.625em;\n  resize: vertical;\n}\n.checkbox,\n.radio {\n  cursor: pointer;\n  display: inline-block;\n  line-height: 1.25;\n  position: relative;\n}\n.checkbox input,\n.radio input {\n  cursor: pointer;\n}\n.checkbox:hover,\n.radio:hover {\n  color: #363636;\n}\n.checkbox[disabled],\n.radio[disabled] {\n  color: #7a7a7a;\n  cursor: not-allowed;\n}\n.radio + .radio {\n  margin-left: 0.5em;\n}\n.select {\n  display: inline-block;\n  height: 2.25em;\n  position: relative;\n  vertical-align: top;\n}\n.select:after {\n  border: 1px solid #00d1b2;\n  border-right: 0;\n  border-top: 0;\n  content: \" \";\n  display: block;\n  height: 0.5em;\n  pointer-events: none;\n  position: absolute;\n  -webkit-transform: rotate(-45deg);\n  transform: rotate(-45deg);\n  width: 0.5em;\n  margin-top: -0.375em;\n  right: 1.125em;\n  top: 50%;\n  z-index: 4;\n}\n.select select {\n  -moz-appearance: none;\n  -webkit-appearance: none;\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  border: 1px solid transparent;\n  border-radius: 3px;\n  box-shadow: none;\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  font-size: 1rem;\n  height: 2.25em;\n  -webkit-box-pack: start;\n  -ms-flex-pack: start;\n  justify-content: flex-start;\n  line-height: 1.5;\n  padding-bottom: calc(0.375em - 1px);\n  padding-left: calc(0.625em - 1px);\n  padding-right: calc(0.625em - 1px);\n  padding-top: calc(0.375em - 1px);\n  position: relative;\n  vertical-align: top;\n  background-color: white;\n  border-color: #dbdbdb;\n  color: #363636;\n  cursor: pointer;\n  display: block;\n  font-size: 1em;\n  outline: none;\n  padding-right: 2.5em;\n}\n.select select:focus,\n.select select.is-focused,\n.select select:active,\n.select select.is-active {\n  outline: none;\n}\n.select select[disabled] {\n  cursor: not-allowed;\n}\n.select select:hover,\n.select select.is-hovered {\n  border-color: #b5b5b5;\n}\n.select select:focus,\n.select select.is-focused,\n.select select:active,\n.select select.is-active {\n  border-color: #00d1b2;\n}\n.select select[disabled] {\n  background-color: whitesmoke;\n  border-color: whitesmoke;\n  box-shadow: none;\n  color: #7a7a7a;\n}\n.select select[disabled]::-moz-placeholder {\n  color: rgba(54, 54, 54, 0.3);\n}\n.select select[disabled]::-webkit-input-placeholder {\n  color: rgba(54, 54, 54, 0.3);\n}\n.select select[disabled]:-moz-placeholder {\n  color: rgba(54, 54, 54, 0.3);\n}\n.select select[disabled]:-ms-input-placeholder {\n  color: rgba(54, 54, 54, 0.3);\n}\n.select select:hover {\n  border-color: #b5b5b5;\n}\n.select select::-ms-expand {\n  display: none;\n}\n.select select[disabled]:hover {\n  border-color: whitesmoke;\n}\n.select:hover:after {\n  border-color: #363636;\n}\n.select.is-white select {\n  border-color: white;\n}\n.select.is-black select {\n  border-color: #0a0a0a;\n}\n.select.is-light select {\n  border-color: whitesmoke;\n}\n.select.is-dark select {\n  border-color: #363636;\n}\n.select.is-primary select {\n  border-color: #00d1b2;\n}\n.select.is-info select {\n  border-color: #3273dc;\n}\n.select.is-success select {\n  border-color: #23d160;\n}\n.select.is-warning select {\n  border-color: #ffdd57;\n}\n.select.is-danger select {\n  border-color: #ff3860;\n}\n.select.is-small {\n  border-radius: 2px;\n  font-size: 0.75rem;\n}\n.select.is-medium {\n  font-size: 1.25rem;\n}\n.select.is-large {\n  font-size: 1.5rem;\n}\n.select.is-disabled:after {\n  border-color: #7a7a7a;\n}\n.select.is-fullwidth {\n  width: 100%;\n}\n.select.is-fullwidth select {\n  width: 100%;\n}\n.select.is-loading:after {\n  -webkit-animation: spinAround 500ms infinite linear;\n  animation: spinAround 500ms infinite linear;\n  border: 2px solid #dbdbdb;\n  border-radius: 290486px;\n  border-right-color: transparent;\n  border-top-color: transparent;\n  content: \"\";\n  display: block;\n  height: 1em;\n  position: relative;\n  width: 1em;\n  margin-top: 0;\n  position: absolute;\n  right: 0.625em;\n  top: 0.625em;\n  -webkit-transform: none;\n  transform: none;\n}\n.label {\n  color: #363636;\n  display: block;\n  font-size: 1rem;\n  font-weight: 700;\n}\n.label:not(:last-child) {\n  margin-bottom: 0.5em;\n}\n.label.is-small {\n  font-size: 0.75rem;\n}\n.label.is-medium {\n  font-size: 1.25rem;\n}\n.label.is-large {\n  font-size: 1.5rem;\n}\n.help {\n  display: block;\n  font-size: 0.75rem;\n  margin-top: 0.25rem;\n}\n.help.is-white {\n  color: white;\n}\n.help.is-black {\n  color: #0a0a0a;\n}\n.help.is-light {\n  color: whitesmoke;\n}\n.help.is-dark {\n  color: #363636;\n}\n.help.is-primary {\n  color: #00d1b2;\n}\n.help.is-info {\n  color: #3273dc;\n}\n.help.is-success {\n  color: #23d160;\n}\n.help.is-warning {\n  color: #ffdd57;\n}\n.help.is-danger {\n  color: #ff3860;\n}\n.field:not(:last-child) {\n  margin-bottom: 0.75rem;\n}\n.field.has-addons {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: start;\n  -ms-flex-pack: start;\n  justify-content: flex-start;\n}\n.field.has-addons .control {\n  margin-right: -1px;\n}\n.field.has-addons .control:first-child .button,\n.field.has-addons .control:first-child .input,\n.field.has-addons .control:first-child .select select {\n  border-bottom-left-radius: 3px;\n  border-top-left-radius: 3px;\n}\n.field.has-addons .control:last-child .button,\n.field.has-addons .control:last-child .input,\n.field.has-addons .control:last-child .select select {\n  border-bottom-right-radius: 3px;\n  border-top-right-radius: 3px;\n}\n.field.has-addons .control .button,\n.field.has-addons .control .input,\n.field.has-addons .control .select select {\n  border-radius: 0;\n}\n.field.has-addons .control .button:hover,\n.field.has-addons .control .button.is-hovered,\n.field.has-addons .control .input:hover,\n.field.has-addons .control .input.is-hovered,\n.field.has-addons .control .select select:hover,\n.field.has-addons .control .select select.is-hovered {\n  z-index: 2;\n}\n.field.has-addons .control .button:focus,\n.field.has-addons .control .button.is-focused,\n.field.has-addons .control .button:active,\n.field.has-addons .control .button.is-active,\n.field.has-addons .control .input:focus,\n.field.has-addons .control .input.is-focused,\n.field.has-addons .control .input:active,\n.field.has-addons .control .input.is-active,\n.field.has-addons .control .select select:focus,\n.field.has-addons .control .select select.is-focused,\n.field.has-addons .control .select select:active,\n.field.has-addons .control .select select.is-active {\n  z-index: 3;\n}\n.field.has-addons .control .button:focus:hover,\n.field.has-addons .control .button.is-focused:hover,\n.field.has-addons .control .button:active:hover,\n.field.has-addons .control .button.is-active:hover,\n.field.has-addons .control .input:focus:hover,\n.field.has-addons .control .input.is-focused:hover,\n.field.has-addons .control .input:active:hover,\n.field.has-addons .control .input.is-active:hover,\n.field.has-addons .control .select select:focus:hover,\n.field.has-addons .control .select select.is-focused:hover,\n.field.has-addons .control .select select:active:hover,\n.field.has-addons .control .select select.is-active:hover {\n  z-index: 4;\n}\n.field.has-addons .control.is-expanded {\n  -webkit-box-flex: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n  -ms-flex-negative: 0;\n  flex-shrink: 0;\n}\n.field.has-addons.has-addons-centered {\n  -webkit-box-pack: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n}\n.field.has-addons.has-addons-right {\n  -webkit-box-pack: end;\n  -ms-flex-pack: end;\n  justify-content: flex-end;\n}\n.field.has-addons.has-addons-fullwidth .control {\n  -webkit-box-flex: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n  -ms-flex-negative: 0;\n  flex-shrink: 0;\n}\n.field.is-grouped {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: start;\n  -ms-flex-pack: start;\n  justify-content: flex-start;\n}\n.field.is-grouped > .control {\n  -ms-flex-negative: 0;\n  flex-shrink: 0;\n}\n.field.is-grouped > .control:not(:last-child) {\n  margin-bottom: 0;\n  margin-right: 0.75rem;\n}\n.field.is-grouped > .control.is-expanded {\n  -webkit-box-flex: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n  -ms-flex-negative: 1;\n  flex-shrink: 1;\n}\n.field.is-grouped.is-grouped-centered {\n  -webkit-box-pack: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n}\n.field.is-grouped.is-grouped-right {\n  -webkit-box-pack: end;\n  -ms-flex-pack: end;\n  justify-content: flex-end;\n}\n@media screen and (min-width: 769px), print {\n  .field.is-horizontal {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n  }\n}\n.field-label .label {\n  font-size: inherit;\n}\n@media screen and (max-width: 768px) {\n  .field-label {\n    margin-bottom: 0.5rem;\n  }\n}\n@media screen and (min-width: 769px), print {\n  .field-label {\n    -ms-flex-preferred-size: 0;\n    flex-basis: 0;\n    -webkit-box-flex: 1;\n    -ms-flex-positive: 1;\n    flex-grow: 1;\n    -ms-flex-negative: 0;\n    flex-shrink: 0;\n    margin-right: 1.5rem;\n    text-align: right;\n  }\n\n  .field-label.is-small {\n    font-size: 0.75rem;\n    padding-top: 0.375em;\n  }\n\n  .field-label.is-normal {\n    padding-top: 0.375em;\n  }\n\n  .field-label.is-medium {\n    font-size: 1.25rem;\n    padding-top: 0.375em;\n  }\n\n  .field-label.is-large {\n    font-size: 1.5rem;\n    padding-top: 0.375em;\n  }\n}\n@media screen and (min-width: 769px), print {\n  .field-body {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex-preferred-size: 0;\n    flex-basis: 0;\n    -webkit-box-flex: 5;\n    -ms-flex-positive: 5;\n    flex-grow: 5;\n    -ms-flex-negative: 1;\n    flex-shrink: 1;\n  }\n\n  .field-body .field {\n    -ms-flex-negative: 1;\n    flex-shrink: 1;\n  }\n\n  .field-body .field:not(.is-narrow) {\n    -webkit-box-flex: 1;\n    -ms-flex-positive: 1;\n    flex-grow: 1;\n  }\n\n  .field-body .field:not(:last-child) {\n    margin-bottom: 0;\n    margin-right: 0.75rem;\n  }\n}\n.control {\n  font-size: 1rem;\n  position: relative;\n  text-align: left;\n}\n.control.has-icon .icon {\n  color: #dbdbdb;\n  height: 2.25em;\n  pointer-events: none;\n  position: absolute;\n  top: 0;\n  width: 2.25em;\n  z-index: 4;\n}\n.control.has-icon .input:focus + .icon {\n  color: #7a7a7a;\n}\n.control.has-icon .input.is-small + .icon {\n  font-size: 0.75rem;\n}\n.control.has-icon .input.is-medium + .icon {\n  font-size: 1.25rem;\n}\n.control.has-icon .input.is-large + .icon {\n  font-size: 1.5rem;\n}\n.control.has-icon:not(.has-icon-right) .icon {\n  left: 0;\n}\n.control.has-icon:not(.has-icon-right) .input {\n  padding-left: 2.25em;\n}\n.control.has-icon.has-icon-right .icon {\n  right: 0;\n}\n.control.has-icon.has-icon-right .input {\n  padding-right: 2.25em;\n}\n.control.has-icons-left .input:focus ~ .icon,\n.control.has-icons-right .input:focus ~ .icon {\n  color: #7a7a7a;\n}\n.control.has-icons-left .input.is-small ~ .icon,\n.control.has-icons-right .input.is-small ~ .icon {\n  font-size: 0.75rem;\n}\n.control.has-icons-left .input.is-medium ~ .icon,\n.control.has-icons-right .input.is-medium ~ .icon {\n  font-size: 1.25rem;\n}\n.control.has-icons-left .input.is-large ~ .icon,\n.control.has-icons-right .input.is-large ~ .icon {\n  font-size: 1.5rem;\n}\n.control.has-icons-left .icon,\n.control.has-icons-right .icon {\n  color: #dbdbdb;\n  height: 2.25em;\n  pointer-events: none;\n  position: absolute;\n  top: 0;\n  width: 2.25em;\n  z-index: 4;\n}\n.control.has-icons-left .input {\n  padding-left: 2.25em;\n}\n.control.has-icons-left .icon.is-left {\n  left: 0;\n}\n.control.has-icons-right .input {\n  padding-right: 2.25em;\n}\n.control.has-icons-right .icon.is-right {\n  right: 0;\n}\n.control.is-loading:after {\n  -webkit-animation: spinAround 500ms infinite linear;\n  animation: spinAround 500ms infinite linear;\n  border: 2px solid #dbdbdb;\n  border-radius: 290486px;\n  border-right-color: transparent;\n  border-top-color: transparent;\n  content: \"\";\n  display: block;\n  height: 1em;\n  position: relative;\n  width: 1em;\n  position: absolute !important;\n  right: 0.625em;\n  top: 0.625em;\n}\n.icon {\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  -webkit-box-pack: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n  height: 1.5rem;\n  width: 1.5rem;\n}\n.icon .fa {\n  font-size: 21px;\n}\n.icon.is-small {\n  height: 1rem;\n  width: 1rem;\n}\n.icon.is-small .fa {\n  font-size: 14px;\n}\n.icon.is-medium {\n  height: 2rem;\n  width: 2rem;\n}\n.icon.is-medium .fa {\n  font-size: 28px;\n}\n.icon.is-large {\n  height: 3rem;\n  width: 3rem;\n}\n.icon.is-large .fa {\n  font-size: 42px;\n}\n.image {\n  display: block;\n  position: relative;\n}\n.image img {\n  display: block;\n  height: auto;\n  width: 100%;\n}\n.image.is-square img,\n.image.is-1by1 img,\n.image.is-4by3 img,\n.image.is-3by2 img,\n.image.is-16by9 img,\n.image.is-2by1 img {\n  bottom: 0;\n  left: 0;\n  position: absolute;\n  right: 0;\n  top: 0;\n  height: 100%;\n  width: 100%;\n}\n.image.is-square,\n.image.is-1by1 {\n  padding-top: 100%;\n}\n.image.is-4by3 {\n  padding-top: 75%;\n}\n.image.is-3by2 {\n  padding-top: 66.6666%;\n}\n.image.is-16by9 {\n  padding-top: 56.25%;\n}\n.image.is-2by1 {\n  padding-top: 50%;\n}\n.image.is-16x16 {\n  height: 16px;\n  width: 16px;\n}\n.image.is-24x24 {\n  height: 24px;\n  width: 24px;\n}\n.image.is-32x32 {\n  height: 32px;\n  width: 32px;\n}\n.image.is-48x48 {\n  height: 48px;\n  width: 48px;\n}\n.image.is-64x64 {\n  height: 64px;\n  width: 64px;\n}\n.image.is-96x96 {\n  height: 96px;\n  width: 96px;\n}\n.image.is-128x128 {\n  height: 128px;\n  width: 128px;\n}\n.notification {\n  background-color: whitesmoke;\n  border-radius: 3px;\n  padding: 1.25rem 2.5rem 1.25rem 1.5rem;\n  position: relative;\n}\n.notification:not(:last-child) {\n  margin-bottom: 1.5rem;\n}\n.notification a:not(.button) {\n  color: currentColor;\n  text-decoration: underline;\n}\n.notification code,\n.notification pre {\n  background: white;\n}\n.notification pre code {\n  background: transparent;\n}\n.notification > .delete {\n  position: absolute;\n  right: 0.5em;\n  top: 0.5em;\n}\n.notification .title,\n.notification .subtitle,\n.notification .content {\n  color: inherit;\n}\n.notification.is-white {\n  background-color: white;\n  color: #0a0a0a;\n}\n.notification.is-black {\n  background-color: #0a0a0a;\n  color: white;\n}\n.notification.is-light {\n  background-color: whitesmoke;\n  color: #363636;\n}\n.notification.is-dark {\n  background-color: #363636;\n  color: whitesmoke;\n}\n.notification.is-primary {\n  background-color: #00d1b2;\n  color: #fff;\n}\n.notification.is-info {\n  background-color: #3273dc;\n  color: #fff;\n}\n.notification.is-success {\n  background-color: #23d160;\n  color: #fff;\n}\n.notification.is-warning {\n  background-color: #ffdd57;\n  color: rgba(0, 0, 0, 0.7);\n}\n.notification.is-danger {\n  background-color: #ff3860;\n  color: #fff;\n}\n.progress {\n  -moz-appearance: none;\n  -webkit-appearance: none;\n  border: none;\n  border-radius: 290486px;\n  display: block;\n  height: 1rem;\n  overflow: hidden;\n  padding: 0;\n  width: 100%;\n}\n.progress:not(:last-child) {\n  margin-bottom: 1.5rem;\n}\n.progress::-webkit-progress-bar {\n  background-color: #dbdbdb;\n}\n.progress::-webkit-progress-value {\n  background-color: #4a4a4a;\n}\n.progress::-moz-progress-bar {\n  background-color: #4a4a4a;\n}\n.progress.is-white::-webkit-progress-value {\n  background-color: white;\n}\n.progress.is-white::-moz-progress-bar {\n  background-color: white;\n}\n.progress.is-black::-webkit-progress-value {\n  background-color: #0a0a0a;\n}\n.progress.is-black::-moz-progress-bar {\n  background-color: #0a0a0a;\n}\n.progress.is-light::-webkit-progress-value {\n  background-color: whitesmoke;\n}\n.progress.is-light::-moz-progress-bar {\n  background-color: whitesmoke;\n}\n.progress.is-dark::-webkit-progress-value {\n  background-color: #363636;\n}\n.progress.is-dark::-moz-progress-bar {\n  background-color: #363636;\n}\n.progress.is-primary::-webkit-progress-value {\n  background-color: #00d1b2;\n}\n.progress.is-primary::-moz-progress-bar {\n  background-color: #00d1b2;\n}\n.progress.is-info::-webkit-progress-value {\n  background-color: #3273dc;\n}\n.progress.is-info::-moz-progress-bar {\n  background-color: #3273dc;\n}\n.progress.is-success::-webkit-progress-value {\n  background-color: #23d160;\n}\n.progress.is-success::-moz-progress-bar {\n  background-color: #23d160;\n}\n.progress.is-warning::-webkit-progress-value {\n  background-color: #ffdd57;\n}\n.progress.is-warning::-moz-progress-bar {\n  background-color: #ffdd57;\n}\n.progress.is-danger::-webkit-progress-value {\n  background-color: #ff3860;\n}\n.progress.is-danger::-moz-progress-bar {\n  background-color: #ff3860;\n}\n.progress.is-small {\n  height: 0.75rem;\n}\n.progress.is-medium {\n  height: 1.25rem;\n}\n.progress.is-large {\n  height: 1.5rem;\n}\n.table {\n  background-color: white;\n  color: #363636;\n  margin-bottom: 1.5rem;\n  width: 100%;\n}\n.table td,\n.table th {\n  border: 1px solid #dbdbdb;\n  border-width: 0 0 1px;\n  padding: 0.5em 0.75em;\n  vertical-align: top;\n}\n.table td.is-narrow,\n.table th.is-narrow {\n  white-space: nowrap;\n  width: 1%;\n}\n.table th {\n  color: #363636;\n  text-align: left;\n}\n.table tr:hover {\n  background-color: #fafafa;\n}\n.table tr.is-selected {\n  background-color: #00d1b2;\n  color: #fff;\n}\n.table tr.is-selected a,\n.table tr.is-selected strong {\n  color: currentColor;\n}\n.table tr.is-selected td,\n.table tr.is-selected th {\n  border-color: #fff;\n  color: currentColor;\n}\n.table thead td,\n.table thead th {\n  border-width: 0 0 2px;\n  color: #7a7a7a;\n}\n.table tfoot td,\n.table tfoot th {\n  border-width: 2px 0 0;\n  color: #7a7a7a;\n}\n.table tbody tr:last-child td,\n.table tbody tr:last-child th {\n  border-bottom-width: 0;\n}\n.table.is-bordered td,\n.table.is-bordered th {\n  border-width: 1px;\n}\n.table.is-bordered tr:last-child td,\n.table.is-bordered tr:last-child th {\n  border-bottom-width: 1px;\n}\n.table.is-narrow td,\n.table.is-narrow th {\n  padding: 0.25em 0.5em;\n}\n.table.is-striped tbody tr:nth-child(even) {\n  background-color: #fafafa;\n}\n.table.is-striped tbody tr:nth-child(even):hover {\n  background-color: whitesmoke;\n}\n.tag {\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  background-color: whitesmoke;\n  border-radius: 290486px;\n  color: #4a4a4a;\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  font-size: 0.75rem;\n  height: 2em;\n  -webkit-box-pack: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n  line-height: 1.5;\n  padding-left: 0.875em;\n  padding-right: 0.875em;\n  white-space: nowrap;\n}\n.tag .delete {\n  margin-left: 0.25em;\n  margin-right: -0.375em;\n}\n.tag.is-white {\n  background-color: white;\n  color: #0a0a0a;\n}\n.tag.is-black {\n  background-color: #0a0a0a;\n  color: white;\n}\n.tag.is-light {\n  background-color: whitesmoke;\n  color: #363636;\n}\n.tag.is-dark {\n  background-color: #363636;\n  color: whitesmoke;\n}\n.tag.is-primary {\n  background-color: #00d1b2;\n  color: #fff;\n}\n.tag.is-info {\n  background-color: #3273dc;\n  color: #fff;\n}\n.tag.is-success {\n  background-color: #23d160;\n  color: #fff;\n}\n.tag.is-warning {\n  background-color: #ffdd57;\n  color: rgba(0, 0, 0, 0.7);\n}\n.tag.is-danger {\n  background-color: #ff3860;\n  color: #fff;\n}\n.tag.is-medium {\n  font-size: 1rem;\n}\n.tag.is-large {\n  font-size: 1.25rem;\n}\n.title,\n.subtitle {\n  word-break: break-word;\n}\n.title:not(:last-child),\n.subtitle:not(:last-child) {\n  margin-bottom: 1.5rem;\n}\n.title em,\n.title span,\n.subtitle em,\n.subtitle span {\n  font-weight: 300;\n}\n.title strong,\n.subtitle strong {\n  font-weight: 500;\n}\n.title .tag,\n.subtitle .tag {\n  vertical-align: middle;\n}\n.title {\n  color: #363636;\n  font-size: 2rem;\n  font-weight: 300;\n  line-height: 1.125;\n}\n.title strong {\n  color: inherit;\n}\n.title + .highlight {\n  margin-top: -0.75rem;\n}\n.title:not(.is-spaced) + .subtitle {\n  margin-top: -1.5rem;\n}\n.title.is-1 {\n  font-size: 3rem;\n}\n.title.is-2 {\n  font-size: 2.5rem;\n}\n.title.is-3 {\n  font-size: 2rem;\n}\n.title.is-4 {\n  font-size: 1.5rem;\n}\n.title.is-5 {\n  font-size: 1.25rem;\n}\n.title.is-6 {\n  font-size: 1rem;\n}\n.subtitle {\n  color: #4a4a4a;\n  font-size: 1.25rem;\n  font-weight: 300;\n  line-height: 1.25;\n}\n.subtitle strong {\n  color: #363636;\n}\n.subtitle:not(.is-spaced) + .title {\n  margin-top: -1.5rem;\n}\n.subtitle.is-1 {\n  font-size: 3rem;\n}\n.subtitle.is-2 {\n  font-size: 2.5rem;\n}\n.subtitle.is-3 {\n  font-size: 2rem;\n}\n.subtitle.is-4 {\n  font-size: 1.5rem;\n}\n.subtitle.is-5 {\n  font-size: 1.25rem;\n}\n.subtitle.is-6 {\n  font-size: 1rem;\n}\n.block:not(:last-child) {\n  margin-bottom: 1.5rem;\n}\n.container {\n  position: relative;\n}\n@media screen and (min-width: 1000px) {\n  .container {\n    margin: 0 auto;\n    max-width: 960px;\n    width: 960px;\n  }\n\n  .container.is-fluid {\n    margin: 0 20px;\n    max-width: none;\n    width: auto;\n  }\n}\n@media screen and (min-width: 1192px) {\n  .container {\n    max-width: 1152px;\n    width: 1152px;\n  }\n}\n@media screen and (min-width: 1384px) {\n  .container {\n    max-width: 1344px;\n    width: 1344px;\n  }\n}\n.delete {\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  -moz-appearance: none;\n  -webkit-appearance: none;\n  background-color: rgba(10, 10, 10, 0.2);\n  border: none;\n  border-radius: 290486px;\n  cursor: pointer;\n  display: inline-block;\n  font-size: 1rem;\n  height: 20px;\n  outline: none;\n  position: relative;\n  vertical-align: top;\n  width: 20px;\n}\n.delete:before,\n.delete:after {\n  background-color: white;\n  content: \"\";\n  display: block;\n  left: 50%;\n  position: absolute;\n  top: 50%;\n  -webkit-transform: translateX(-50%) translateY(-50%) rotate(45deg);\n  transform: translateX(-50%) translateY(-50%) rotate(45deg);\n  -webkit-transform-origin: center center;\n  transform-origin: center center;\n}\n.delete:before {\n  height: 2px;\n  width: 50%;\n}\n.delete:after {\n  height: 50%;\n  width: 2px;\n}\n.delete:hover,\n.delete:focus {\n  background-color: rgba(10, 10, 10, 0.3);\n}\n.delete:active {\n  background-color: rgba(10, 10, 10, 0.4);\n}\n.delete.is-small {\n  height: 16px;\n  width: 16px;\n}\n.delete.is-medium {\n  height: 24px;\n  width: 24px;\n}\n.delete.is-large {\n  height: 32px;\n  width: 32px;\n}\n.fa {\n  font-size: 21px;\n  text-align: center;\n  vertical-align: top;\n}\n.heading {\n  display: block;\n  font-size: 11px;\n  letter-spacing: 1px;\n  margin-bottom: 5px;\n  text-transform: uppercase;\n}\n.highlight {\n  font-weight: 400;\n  max-width: 100%;\n  overflow: hidden;\n  padding: 0;\n}\n.highlight:not(:last-child) {\n  margin-bottom: 1.5rem;\n}\n.highlight pre {\n  overflow: auto;\n  max-width: 100%;\n}\n.loader {\n  -webkit-animation: spinAround 500ms infinite linear;\n  animation: spinAround 500ms infinite linear;\n  border: 2px solid #dbdbdb;\n  border-radius: 290486px;\n  border-right-color: transparent;\n  border-top-color: transparent;\n  content: \"\";\n  display: block;\n  height: 1em;\n  position: relative;\n  width: 1em;\n}\n.number {\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  background-color: whitesmoke;\n  border-radius: 290486px;\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  font-size: 1.25rem;\n  height: 2em;\n  -webkit-box-pack: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n  margin-right: 1.5rem;\n  min-width: 2.5em;\n  padding: 0.25rem 0.5rem;\n  text-align: center;\n  vertical-align: top;\n}\n.card-header {\n  -webkit-box-align: stretch;\n  -ms-flex-align: stretch;\n  align-items: stretch;\n  box-shadow: 0 1px 2px rgba(10, 10, 10, 0.1);\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n}\n.card-header-title {\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  color: #363636;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-flex: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n  font-weight: 700;\n  padding: 0.75rem;\n}\n.card-header-icon {\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  cursor: pointer;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n  padding: 0.75rem;\n}\n.card-image {\n  display: block;\n  position: relative;\n}\n.card-content {\n  padding: 1.5rem;\n}\n.card-footer {\n  border-top: 1px solid #dbdbdb;\n  -webkit-box-align: stretch;\n  -ms-flex-align: stretch;\n  align-items: stretch;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n}\n.card-footer-item {\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-preferred-size: 0;\n  flex-basis: 0;\n  -webkit-box-flex: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n  -ms-flex-negative: 0;\n  flex-shrink: 0;\n  -webkit-box-pack: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n  padding: 0.75rem;\n}\n.card-footer-item:not(:last-child) {\n  border-right: 1px solid #dbdbdb;\n}\n.card {\n  background-color: white;\n  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);\n  color: #4a4a4a;\n  max-width: 100%;\n  position: relative;\n}\n.card .media:not(:last-child) {\n  margin-bottom: 0.75rem;\n}\n.level-item {\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-preferred-size: auto;\n  flex-basis: auto;\n  -webkit-box-flex: 0;\n  -ms-flex-positive: 0;\n  flex-grow: 0;\n  -ms-flex-negative: 0;\n  flex-shrink: 0;\n  -webkit-box-pack: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n}\n.level-item .title,\n.level-item .subtitle {\n  margin-bottom: 0;\n}\n@media screen and (max-width: 768px) {\n  .level-item:not(:last-child) {\n    margin-bottom: 0.75rem;\n  }\n}\n.level-left,\n.level-right {\n  -ms-flex-preferred-size: auto;\n  flex-basis: auto;\n  -webkit-box-flex: 0;\n  -ms-flex-positive: 0;\n  flex-grow: 0;\n  -ms-flex-negative: 0;\n  flex-shrink: 0;\n}\n.level-left .level-item:not(:last-child),\n.level-right .level-item:not(:last-child) {\n  margin-right: 0.75rem;\n}\n.level-left .level-item.is-flexible,\n.level-right .level-item.is-flexible {\n  -webkit-box-flex: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n}\n.level-left {\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  -webkit-box-pack: start;\n  -ms-flex-pack: start;\n  justify-content: flex-start;\n}\n@media screen and (max-width: 768px) {\n  .level-left + .level-right {\n    margin-top: 1.5rem;\n  }\n}\n@media screen and (min-width: 769px), print {\n  .level-left {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n  }\n}\n.level-right {\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  -webkit-box-pack: end;\n  -ms-flex-pack: end;\n  justify-content: flex-end;\n}\n@media screen and (min-width: 769px), print {\n  .level-right {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n  }\n}\n.level {\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  -webkit-box-pack: justify;\n  -ms-flex-pack: justify;\n  justify-content: space-between;\n}\n.level:not(:last-child) {\n  margin-bottom: 1.5rem;\n}\n.level code {\n  border-radius: 3px;\n}\n.level img {\n  display: inline-block;\n  vertical-align: top;\n}\n.level.is-mobile {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n}\n.level.is-mobile .level-left,\n.level.is-mobile .level-right {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n}\n.level.is-mobile .level-left + .level-right {\n  margin-top: 0;\n}\n.level.is-mobile .level-item:not(:last-child) {\n  margin-bottom: 0;\n}\n.level.is-mobile .level-item:not(.is-narrow) {\n  -webkit-box-flex: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n}\n@media screen and (min-width: 769px), print {\n  .level {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n  }\n\n  .level > .level-item:not(.is-narrow) {\n    -webkit-box-flex: 1;\n    -ms-flex-positive: 1;\n    flex-grow: 1;\n  }\n}\n.media-left,\n.media-right {\n  -ms-flex-preferred-size: auto;\n  flex-basis: auto;\n  -webkit-box-flex: 0;\n  -ms-flex-positive: 0;\n  flex-grow: 0;\n  -ms-flex-negative: 0;\n  flex-shrink: 0;\n}\n.media-left {\n  margin-right: 1rem;\n}\n.media-right {\n  margin-left: 1rem;\n}\n.media-content {\n  -ms-flex-preferred-size: auto;\n  flex-basis: auto;\n  -webkit-box-flex: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n  -ms-flex-negative: 1;\n  flex-shrink: 1;\n  text-align: left;\n}\n.media {\n  -webkit-box-align: start;\n  -ms-flex-align: start;\n  align-items: flex-start;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  text-align: left;\n}\n.media .content:not(:last-child) {\n  margin-bottom: 0.75rem;\n}\n.media .media {\n  border-top: 1px solid rgba(219, 219, 219, 0.5);\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  padding-top: 0.75rem;\n}\n.media .media .content:not(:last-child),\n.media .media .control:not(:last-child) {\n  margin-bottom: 0.5rem;\n}\n.media .media .media {\n  padding-top: 0.5rem;\n}\n.media .media .media + .media {\n  margin-top: 0.5rem;\n}\n.media + .media {\n  border-top: 1px solid rgba(219, 219, 219, 0.5);\n  margin-top: 1rem;\n  padding-top: 1rem;\n}\n.media.is-large + .media {\n  margin-top: 1.5rem;\n  padding-top: 1.5rem;\n}\n.menu {\n  font-size: 1rem;\n}\n.menu-list {\n  line-height: 1.25;\n}\n.menu-list a {\n  border-radius: 2px;\n  color: #4a4a4a;\n  display: block;\n  padding: 0.5em 0.75em;\n}\n.menu-list a:hover {\n  background-color: whitesmoke;\n  color: #00d1b2;\n}\n.menu-list a.is-active {\n  background-color: #00d1b2;\n  color: #fff;\n}\n.menu-list li ul {\n  border-left: 1px solid #dbdbdb;\n  margin: 0.75em;\n  padding-left: 0.75em;\n}\n.menu-label {\n  color: #7a7a7a;\n  font-size: 0.8em;\n  letter-spacing: 0.1em;\n  text-transform: uppercase;\n}\n.menu-label:not(:first-child) {\n  margin-top: 1em;\n}\n.menu-label:not(:last-child) {\n  margin-bottom: 1em;\n}\n.message {\n  background-color: whitesmoke;\n  border-radius: 3px;\n  font-size: 1rem;\n}\n.message:not(:last-child) {\n  margin-bottom: 1.5rem;\n}\n.message.is-white {\n  background-color: white;\n}\n.message.is-white .message-header {\n  background-color: white;\n  color: #0a0a0a;\n}\n.message.is-white .message-body {\n  border-color: white;\n  color: #4d4d4d;\n}\n.message.is-black {\n  background-color: #fafafa;\n}\n.message.is-black .message-header {\n  background-color: #0a0a0a;\n  color: white;\n}\n.message.is-black .message-body {\n  border-color: #0a0a0a;\n  color: #090909;\n}\n.message.is-light {\n  background-color: #fafafa;\n}\n.message.is-light .message-header {\n  background-color: whitesmoke;\n  color: #363636;\n}\n.message.is-light .message-body {\n  border-color: whitesmoke;\n  color: #505050;\n}\n.message.is-dark {\n  background-color: #fafafa;\n}\n.message.is-dark .message-header {\n  background-color: #363636;\n  color: whitesmoke;\n}\n.message.is-dark .message-body {\n  border-color: #363636;\n  color: #2a2a2a;\n}\n.message.is-primary {\n  background-color: #f5fffd;\n}\n.message.is-primary .message-header {\n  background-color: #00d1b2;\n  color: #fff;\n}\n.message.is-primary .message-body {\n  border-color: #00d1b2;\n  color: #021310;\n}\n.message.is-info {\n  background-color: #f6f9fe;\n}\n.message.is-info .message-header {\n  background-color: #3273dc;\n  color: #fff;\n}\n.message.is-info .message-body {\n  border-color: #3273dc;\n  color: #22509a;\n}\n.message.is-success {\n  background-color: #f6fef9;\n}\n.message.is-success .message-header {\n  background-color: #23d160;\n  color: #fff;\n}\n.message.is-success .message-body {\n  border-color: #23d160;\n  color: #0e301a;\n}\n.message.is-warning {\n  background-color: #fffdf5;\n}\n.message.is-warning .message-header {\n  background-color: #ffdd57;\n  color: rgba(0, 0, 0, 0.7);\n}\n.message.is-warning .message-body {\n  border-color: #ffdd57;\n  color: #3b3108;\n}\n.message.is-danger {\n  background-color: #fff5f7;\n}\n.message.is-danger .message-header {\n  background-color: #ff3860;\n  color: #fff;\n}\n.message.is-danger .message-body {\n  border-color: #ff3860;\n  color: #cd0930;\n}\n.message-header {\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  background-color: #4a4a4a;\n  border-radius: 3px 3px 0 0;\n  color: #fff;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: justify;\n  -ms-flex-pack: justify;\n  justify-content: space-between;\n  line-height: 1.25;\n  padding: 0.5em 0.75em;\n  position: relative;\n}\n.message-header a,\n.message-header strong {\n  color: inherit;\n}\n.message-header a {\n  text-decoration: underline;\n}\n.message-header .delete {\n  -webkit-box-flex: 0;\n  -ms-flex-positive: 0;\n  flex-grow: 0;\n  -ms-flex-negative: 0;\n  flex-shrink: 0;\n  margin-left: 0.75em;\n}\n.message-header + .message-body {\n  border-top-left-radius: 0;\n  border-top-right-radius: 0;\n  border-top: none;\n}\n.message-body {\n  border: 1px solid #dbdbdb;\n  border-radius: 3px;\n  color: #4a4a4a;\n  padding: 1em 1.25em;\n}\n.message-body a,\n.message-body strong {\n  color: inherit;\n}\n.message-body a {\n  text-decoration: underline;\n}\n.message-body code,\n.message-body pre {\n  background: white;\n}\n.message-body pre code {\n  background: transparent;\n}\n.modal-background {\n  bottom: 0;\n  left: 0;\n  position: absolute;\n  right: 0;\n  top: 0;\n  background-color: rgba(10, 10, 10, 0.86);\n}\n.modal-content,\n.modal-card {\n  margin: 0 20px;\n  max-height: calc(100vh - 160px);\n  overflow: auto;\n  position: relative;\n  width: 100%;\n}\n@media screen and (min-width: 769px), print {\n  .modal-content,\n  .modal-card {\n    margin: 0 auto;\n    max-height: calc(100vh - 40px);\n    width: 640px;\n  }\n}\n.modal-close {\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  -moz-appearance: none;\n  -webkit-appearance: none;\n  background-color: rgba(10, 10, 10, 0.2);\n  border: none;\n  border-radius: 290486px;\n  cursor: pointer;\n  display: inline-block;\n  font-size: 1rem;\n  height: 20px;\n  outline: none;\n  position: relative;\n  vertical-align: top;\n  width: 20px;\n  background: none;\n  height: 40px;\n  position: fixed;\n  right: 20px;\n  top: 20px;\n  width: 40px;\n}\n.modal-close:before,\n.modal-close:after {\n  background-color: white;\n  content: \"\";\n  display: block;\n  left: 50%;\n  position: absolute;\n  top: 50%;\n  -webkit-transform: translateX(-50%) translateY(-50%) rotate(45deg);\n  transform: translateX(-50%) translateY(-50%) rotate(45deg);\n  -webkit-transform-origin: center center;\n  transform-origin: center center;\n}\n.modal-close:before {\n  height: 2px;\n  width: 50%;\n}\n.modal-close:after {\n  height: 50%;\n  width: 2px;\n}\n.modal-close:hover,\n.modal-close:focus {\n  background-color: rgba(10, 10, 10, 0.3);\n}\n.modal-close:active {\n  background-color: rgba(10, 10, 10, 0.4);\n}\n.modal-close.is-small {\n  height: 16px;\n  width: 16px;\n}\n.modal-close.is-medium {\n  height: 24px;\n  width: 24px;\n}\n.modal-close.is-large {\n  height: 32px;\n  width: 32px;\n}\n.modal-card {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  max-height: calc(100vh - 40px);\n  overflow: hidden;\n}\n.modal-card-head,\n.modal-card-foot {\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  background-color: whitesmoke;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-negative: 0;\n  flex-shrink: 0;\n  -webkit-box-pack: start;\n  -ms-flex-pack: start;\n  justify-content: flex-start;\n  padding: 20px;\n  position: relative;\n}\n.modal-card-head {\n  border-bottom: 1px solid #dbdbdb;\n  border-top-left-radius: 5px;\n  border-top-right-radius: 5px;\n}\n.modal-card-title {\n  color: #363636;\n  -webkit-box-flex: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n  -ms-flex-negative: 0;\n  flex-shrink: 0;\n  font-size: 1.5rem;\n  line-height: 1;\n}\n.modal-card-foot {\n  border-bottom-left-radius: 5px;\n  border-bottom-right-radius: 5px;\n  border-top: 1px solid #dbdbdb;\n}\n.modal-card-foot .button:not(:last-child) {\n  margin-right: 10px;\n}\n.modal-card-body {\n  -webkit-overflow-scrolling: touch;\n  background-color: white;\n  -webkit-box-flex: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n  -ms-flex-negative: 1;\n  flex-shrink: 1;\n  overflow: auto;\n  padding: 20px;\n}\n.modal {\n  bottom: 0;\n  left: 0;\n  position: absolute;\n  right: 0;\n  top: 0;\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  display: none;\n  -webkit-box-pack: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n  overflow: hidden;\n  position: fixed;\n  z-index: 20;\n}\n.modal.is-active {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n}\n.nav-toggle {\n  cursor: pointer;\n  display: block;\n  height: 3.25rem;\n  position: relative;\n  width: 3.25rem;\n}\n.nav-toggle span {\n  background-color: #4a4a4a;\n  display: block;\n  height: 1px;\n  left: 50%;\n  margin-left: -7px;\n  position: absolute;\n  top: 50%;\n  -webkit-transition: none 86ms ease-out;\n  transition: none 86ms ease-out;\n  -webkit-transition-property: background, left, opacity, -webkit-transform;\n  transition-property: background, left, opacity, -webkit-transform;\n  transition-property: background, left, opacity, transform;\n  transition-property: background, left, opacity, transform, -webkit-transform;\n  width: 15px;\n}\n.nav-toggle span:nth-child(1) {\n  margin-top: -6px;\n}\n.nav-toggle span:nth-child(2) {\n  margin-top: -1px;\n}\n.nav-toggle span:nth-child(3) {\n  margin-top: 4px;\n}\n.nav-toggle:hover {\n  background-color: whitesmoke;\n}\n.nav-toggle.is-active span {\n  background-color: #00d1b2;\n}\n.nav-toggle.is-active span:nth-child(1) {\n  margin-left: -5px;\n  -webkit-transform: rotate(45deg);\n  transform: rotate(45deg);\n  -webkit-transform-origin: left top;\n  transform-origin: left top;\n}\n.nav-toggle.is-active span:nth-child(2) {\n  opacity: 0;\n}\n.nav-toggle.is-active span:nth-child(3) {\n  margin-left: -5px;\n  -webkit-transform: rotate(-45deg);\n  transform: rotate(-45deg);\n  -webkit-transform-origin: left bottom;\n  transform-origin: left bottom;\n}\n@media screen and (min-width: 769px), print {\n  .nav-toggle {\n    display: none;\n  }\n}\n.nav-item {\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-flex: 0;\n  -ms-flex-positive: 0;\n  flex-grow: 0;\n  -ms-flex-negative: 0;\n  flex-shrink: 0;\n  font-size: 1rem;\n  -webkit-box-pack: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n  line-height: 1.5;\n  padding: 0.5rem 0.75rem;\n}\n.nav-item a {\n  -webkit-box-flex: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n  -ms-flex-negative: 0;\n  flex-shrink: 0;\n}\n.nav-item img {\n  max-height: 1.75rem;\n}\n.nav-item .tag:first-child:not(:last-child) {\n  margin-right: 0.5rem;\n}\n.nav-item .tag:last-child:not(:first-child) {\n  margin-left: 0.5rem;\n}\n@media screen and (max-width: 768px) {\n  .nav-item {\n    -webkit-box-pack: start;\n    -ms-flex-pack: start;\n    justify-content: flex-start;\n  }\n}\n.nav-item a,\na.nav-item {\n  color: #7a7a7a;\n}\n.nav-item a:hover,\na.nav-item:hover {\n  color: #363636;\n}\n.nav-item a.is-active,\na.nav-item.is-active {\n  color: #363636;\n}\n.nav-item a.is-tab,\na.nav-item.is-tab {\n  border-bottom: 1px solid transparent;\n  border-top: 1px solid transparent;\n  padding-bottom: calc(0.75rem - 1px);\n  padding-left: 1rem;\n  padding-right: 1rem;\n  padding-top: calc(0.75rem - 1px);\n}\n.nav-item a.is-tab:hover,\na.nav-item.is-tab:hover {\n  border-bottom-color: #00d1b2;\n  border-top-color: transparent;\n}\n.nav-item a.is-tab.is-active,\na.nav-item.is-tab.is-active {\n  border-bottom: 3px solid #00d1b2;\n  color: #00d1b2;\n  padding-bottom: calc(0.75rem - 3px);\n}\n@media screen and (min-width: 1000px) {\n  .nav-item a.is-brand,\n  a.nav-item.is-brand {\n    padding-left: 0;\n  }\n}\n.nav-left,\n.nav-right {\n  -webkit-overflow-scrolling: touch;\n  -webkit-box-align: stretch;\n  -ms-flex-align: stretch;\n  align-items: stretch;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-flex: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n  -ms-flex-negative: 0;\n  flex-shrink: 0;\n  max-width: 100%;\n  overflow: auto;\n}\n@media screen and (min-width: 1192px) {\n  .nav-left,\n  .nav-right {\n    -ms-flex-preferred-size: 0;\n    flex-basis: 0;\n  }\n}\n.nav-left {\n  -webkit-box-pack: start;\n  -ms-flex-pack: start;\n  justify-content: flex-start;\n  white-space: nowrap;\n}\n.nav-right {\n  -webkit-box-pack: end;\n  -ms-flex-pack: end;\n  justify-content: flex-end;\n}\n.nav-center {\n  -webkit-box-align: stretch;\n  -ms-flex-align: stretch;\n  align-items: stretch;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-flex: 0;\n  -ms-flex-positive: 0;\n  flex-grow: 0;\n  -ms-flex-negative: 0;\n  flex-shrink: 0;\n  -webkit-box-pack: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n  margin-left: auto;\n  margin-right: auto;\n}\n@media screen and (max-width: 768px) {\n  .nav-menu.nav-right {\n    background-color: white;\n    box-shadow: 0 4px 7px rgba(10, 10, 10, 0.1);\n    left: 0;\n    display: none;\n    right: 0;\n    top: 100%;\n    position: absolute;\n  }\n\n  .nav-menu.nav-right .nav-item {\n    border-top: 1px solid rgba(219, 219, 219, 0.5);\n    padding: 0.75rem;\n  }\n\n  .nav-menu.nav-right.is-active {\n    display: block;\n  }\n}\n.nav {\n  -webkit-box-align: stretch;\n  -ms-flex-align: stretch;\n  align-items: stretch;\n  background-color: white;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  height: 3.25rem;\n  position: relative;\n  text-align: center;\n  z-index: 10;\n}\n.nav > .container {\n  -webkit-box-align: stretch;\n  -ms-flex-align: stretch;\n  align-items: stretch;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  min-height: 3.25rem;\n  width: 100%;\n}\n.nav.has-shadow {\n  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1);\n}\n.pagination {\n  font-size: 1rem;\n  margin: -0.25rem;\n}\n.pagination.is-small {\n  font-size: 0.75rem;\n}\n.pagination.is-medium {\n  font-size: 1.25rem;\n}\n.pagination.is-large {\n  font-size: 1.5rem;\n}\n.pagination,\n.pagination-list {\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n  text-align: center;\n}\n.pagination-previous,\n.pagination-next,\n.pagination-link,\n.pagination-ellipsis {\n  -moz-appearance: none;\n  -webkit-appearance: none;\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  border: 1px solid transparent;\n  border-radius: 3px;\n  box-shadow: none;\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  font-size: 1rem;\n  height: 2.25em;\n  -webkit-box-pack: start;\n  -ms-flex-pack: start;\n  justify-content: flex-start;\n  line-height: 1.5;\n  padding-bottom: calc(0.375em - 1px);\n  padding-left: calc(0.625em - 1px);\n  padding-right: calc(0.625em - 1px);\n  padding-top: calc(0.375em - 1px);\n  position: relative;\n  vertical-align: top;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  font-size: 1em;\n  padding-left: 0.5em;\n  padding-right: 0.5em;\n  -webkit-box-pack: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n  margin: 0.25rem;\n  text-align: center;\n}\n.pagination-previous:focus,\n.pagination-previous.is-focused,\n.pagination-previous:active,\n.pagination-previous.is-active,\n.pagination-next:focus,\n.pagination-next.is-focused,\n.pagination-next:active,\n.pagination-next.is-active,\n.pagination-link:focus,\n.pagination-link.is-focused,\n.pagination-link:active,\n.pagination-link.is-active,\n.pagination-ellipsis:focus,\n.pagination-ellipsis.is-focused,\n.pagination-ellipsis:active,\n.pagination-ellipsis.is-active {\n  outline: none;\n}\n.pagination-previous[disabled],\n.pagination-next[disabled],\n.pagination-link[disabled],\n.pagination-ellipsis[disabled] {\n  cursor: not-allowed;\n}\n.pagination-previous,\n.pagination-next,\n.pagination-link {\n  border-color: #dbdbdb;\n  min-width: 2.25em;\n}\n.pagination-previous:hover,\n.pagination-next:hover,\n.pagination-link:hover {\n  border-color: #b5b5b5;\n  color: #363636;\n}\n.pagination-previous:focus,\n.pagination-next:focus,\n.pagination-link:focus {\n  border-color: #00d1b2;\n}\n.pagination-previous:active,\n.pagination-next:active,\n.pagination-link:active {\n  box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.2);\n}\n.pagination-previous[disabled],\n.pagination-next[disabled],\n.pagination-link[disabled] {\n  background-color: #dbdbdb;\n  border-color: #dbdbdb;\n  box-shadow: none;\n  color: #7a7a7a;\n  opacity: 0.5;\n}\n.pagination-previous,\n.pagination-next {\n  padding-left: 0.75em;\n  padding-right: 0.75em;\n  white-space: nowrap;\n}\n.pagination-link.is-current {\n  background-color: #00d1b2;\n  border-color: #00d1b2;\n  color: #fff;\n}\n.pagination-ellipsis {\n  color: #b5b5b5;\n  pointer-events: none;\n}\n.pagination-list {\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap;\n}\n@media screen and (max-width: 768px) {\n  .pagination {\n    -ms-flex-wrap: wrap;\n    flex-wrap: wrap;\n  }\n\n  .pagination-previous,\n  .pagination-next {\n    -webkit-box-flex: 1;\n    -ms-flex-positive: 1;\n    flex-grow: 1;\n    -ms-flex-negative: 1;\n    flex-shrink: 1;\n  }\n\n  .pagination-list li {\n    -webkit-box-flex: 1;\n    -ms-flex-positive: 1;\n    flex-grow: 1;\n    -ms-flex-negative: 1;\n    flex-shrink: 1;\n  }\n}\n@media screen and (min-width: 769px), print {\n  .pagination-list {\n    -webkit-box-flex: 1;\n    -ms-flex-positive: 1;\n    flex-grow: 1;\n    -ms-flex-negative: 1;\n    flex-shrink: 1;\n    -webkit-box-pack: start;\n    -ms-flex-pack: start;\n    justify-content: flex-start;\n    -webkit-box-ordinal-group: 2;\n    -ms-flex-order: 1;\n    order: 1;\n  }\n\n  .pagination-previous {\n    -webkit-box-ordinal-group: 3;\n    -ms-flex-order: 2;\n    order: 2;\n  }\n\n  .pagination-next {\n    -webkit-box-ordinal-group: 4;\n    -ms-flex-order: 3;\n    order: 3;\n  }\n\n  .pagination {\n    -webkit-box-pack: justify;\n    -ms-flex-pack: justify;\n    justify-content: space-between;\n  }\n\n  .pagination.is-centered .pagination-previous {\n    -webkit-box-ordinal-group: 2;\n    -ms-flex-order: 1;\n    order: 1;\n  }\n\n  .pagination.is-centered .pagination-list {\n    -webkit-box-pack: center;\n    -ms-flex-pack: center;\n    justify-content: center;\n    -webkit-box-ordinal-group: 3;\n    -ms-flex-order: 2;\n    order: 2;\n  }\n\n  .pagination.is-centered .pagination-next {\n    -webkit-box-ordinal-group: 4;\n    -ms-flex-order: 3;\n    order: 3;\n  }\n\n  .pagination.is-right .pagination-previous {\n    -webkit-box-ordinal-group: 2;\n    -ms-flex-order: 1;\n    order: 1;\n  }\n\n  .pagination.is-right .pagination-next {\n    -webkit-box-ordinal-group: 3;\n    -ms-flex-order: 2;\n    order: 2;\n  }\n\n  .pagination.is-right .pagination-list {\n    -webkit-box-pack: end;\n    -ms-flex-pack: end;\n    justify-content: flex-end;\n    -webkit-box-ordinal-group: 4;\n    -ms-flex-order: 3;\n    order: 3;\n  }\n}\n.panel {\n  font-size: 1rem;\n}\n.panel:not(:last-child) {\n  margin-bottom: 1.5rem;\n}\n.panel-heading,\n.panel-tabs,\n.panel-block {\n  border-bottom: 1px solid #dbdbdb;\n  border-left: 1px solid #dbdbdb;\n  border-right: 1px solid #dbdbdb;\n}\n.panel-heading:first-child,\n.panel-tabs:first-child,\n.panel-block:first-child {\n  border-top: 1px solid #dbdbdb;\n}\n.panel-heading {\n  background-color: whitesmoke;\n  border-radius: 3px 3px 0 0;\n  color: #363636;\n  font-size: 1.25em;\n  font-weight: 300;\n  line-height: 1.25;\n  padding: 0.5em 0.75em;\n}\n.panel-tabs {\n  -webkit-box-align: end;\n  -ms-flex-align: end;\n  align-items: flex-end;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  font-size: 0.875em;\n  -webkit-box-pack: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n}\n.panel-tabs a {\n  border-bottom: 1px solid #dbdbdb;\n  margin-bottom: -1px;\n  padding: 0.5em;\n}\n.panel-tabs a.is-active {\n  border-bottom-color: #4a4a4a;\n  color: #363636;\n}\n.panel-list a {\n  color: #4a4a4a;\n}\n.panel-list a:hover {\n  color: #00d1b2;\n}\n.panel-block {\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  color: #363636;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: start;\n  -ms-flex-pack: start;\n  justify-content: flex-start;\n  padding: 0.5em 0.75em;\n}\n.panel-block input[type=\"checkbox\"] {\n  margin-right: 0.75em;\n}\n.panel-block > .control {\n  -webkit-box-flex: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n  -ms-flex-negative: 1;\n  flex-shrink: 1;\n  width: 100%;\n}\n.panel-block.is-wrapped {\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap;\n}\n.panel-block.is-active {\n  border-left-color: #00d1b2;\n  color: #363636;\n}\n.panel-block.is-active .panel-icon {\n  color: #00d1b2;\n}\na.panel-block,\nlabel.panel-block {\n  cursor: pointer;\n}\na.panel-block:hover,\nlabel.panel-block:hover {\n  background-color: whitesmoke;\n}\n.panel-icon {\n  display: inline-block;\n  font-size: 14px;\n  height: 1em;\n  line-height: 1em;\n  text-align: center;\n  vertical-align: top;\n  width: 1em;\n  color: #7a7a7a;\n  margin-right: 0.75em;\n}\n.panel-icon .fa {\n  font-size: inherit;\n  line-height: inherit;\n}\n.tabs {\n  -webkit-overflow-scrolling: touch;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  -webkit-box-align: stretch;\n  -ms-flex-align: stretch;\n  align-items: stretch;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  font-size: 1rem;\n  -webkit-box-pack: justify;\n  -ms-flex-pack: justify;\n  justify-content: space-between;\n  overflow: hidden;\n  overflow-x: auto;\n  white-space: nowrap;\n}\n.tabs:not(:last-child) {\n  margin-bottom: 1.5rem;\n}\n.tabs a {\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  border-bottom: 1px solid #dbdbdb;\n  color: #4a4a4a;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n  margin-bottom: -1px;\n  padding: 0.5em 1em;\n  vertical-align: top;\n}\n.tabs a:hover {\n  border-bottom-color: #363636;\n  color: #363636;\n}\n.tabs li {\n  display: block;\n}\n.tabs li.is-active a {\n  border-bottom-color: #00d1b2;\n  color: #00d1b2;\n}\n.tabs ul {\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  border-bottom: 1px solid #dbdbdb;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-flex: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n  -ms-flex-negative: 0;\n  flex-shrink: 0;\n  -webkit-box-pack: start;\n  -ms-flex-pack: start;\n  justify-content: flex-start;\n}\n.tabs ul.is-left {\n  padding-right: 0.75em;\n}\n.tabs ul.is-center {\n  -webkit-box-flex: 0;\n  -ms-flex: none;\n  flex: none;\n  -webkit-box-pack: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n  padding-left: 0.75em;\n  padding-right: 0.75em;\n}\n.tabs ul.is-right {\n  -webkit-box-pack: end;\n  -ms-flex-pack: end;\n  justify-content: flex-end;\n  padding-left: 0.75em;\n}\n.tabs .icon:first-child {\n  margin-right: 0.5em;\n}\n.tabs .icon:last-child {\n  margin-left: 0.5em;\n}\n.tabs.is-centered ul {\n  -webkit-box-pack: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n}\n.tabs.is-right ul {\n  -webkit-box-pack: end;\n  -ms-flex-pack: end;\n  justify-content: flex-end;\n}\n.tabs.is-boxed a {\n  border: 1px solid transparent;\n  border-radius: 3px 3px 0 0;\n}\n.tabs.is-boxed a:hover {\n  background-color: whitesmoke;\n  border-bottom-color: #dbdbdb;\n}\n.tabs.is-boxed li.is-active a {\n  background-color: white;\n  border-color: #dbdbdb;\n  border-bottom-color: transparent !important;\n}\n.tabs.is-fullwidth li {\n  -webkit-box-flex: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n  -ms-flex-negative: 0;\n  flex-shrink: 0;\n}\n.tabs.is-toggle a {\n  border: 1px solid #dbdbdb;\n  margin-bottom: 0;\n  position: relative;\n}\n.tabs.is-toggle a:hover {\n  background-color: whitesmoke;\n  border-color: #b5b5b5;\n  z-index: 2;\n}\n.tabs.is-toggle li + li {\n  margin-left: -1px;\n}\n.tabs.is-toggle li:first-child a {\n  border-radius: 3px 0 0 3px;\n}\n.tabs.is-toggle li:last-child a {\n  border-radius: 0 3px 3px 0;\n}\n.tabs.is-toggle li.is-active a {\n  background-color: #00d1b2;\n  border-color: #00d1b2;\n  color: #fff;\n  z-index: 1;\n}\n.tabs.is-toggle ul {\n  border-bottom: none;\n}\n.tabs.is-small {\n  font-size: 0.75rem;\n}\n.tabs.is-medium {\n  font-size: 1.25rem;\n}\n.tabs.is-large {\n  font-size: 1.5rem;\n}\n.column {\n  display: block;\n  -ms-flex-preferred-size: 0;\n  flex-basis: 0;\n  -webkit-box-flex: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n  -ms-flex-negative: 1;\n  flex-shrink: 1;\n  padding: 0.75rem;\n}\n.columns.is-mobile > .column.is-narrow {\n  -webkit-box-flex: 0;\n  -ms-flex: none;\n  flex: none;\n}\n.columns.is-mobile > .column.is-full {\n  -webkit-box-flex: 0;\n  -ms-flex: none;\n  flex: none;\n  width: 100%;\n}\n.columns.is-mobile > .column.is-three-quarters {\n  -webkit-box-flex: 0;\n  -ms-flex: none;\n  flex: none;\n  width: 75%;\n}\n.columns.is-mobile > .column.is-two-thirds {\n  -webkit-box-flex: 0;\n  -ms-flex: none;\n  flex: none;\n  width: 66.6666%;\n}\n.columns.is-mobile > .column.is-half {\n  -webkit-box-flex: 0;\n  -ms-flex: none;\n  flex: none;\n  width: 50%;\n}\n.columns.is-mobile > .column.is-one-third {\n  -webkit-box-flex: 0;\n  -ms-flex: none;\n  flex: none;\n  width: 33.3333%;\n}\n.columns.is-mobile > .column.is-one-quarter {\n  -webkit-box-flex: 0;\n  -ms-flex: none;\n  flex: none;\n  width: 25%;\n}\n.columns.is-mobile > .column.is-offset-three-quarters {\n  margin-left: 75%;\n}\n.columns.is-mobile > .column.is-offset-two-thirds {\n  margin-left: 66.6666%;\n}\n.columns.is-mobile > .column.is-offset-half {\n  margin-left: 50%;\n}\n.columns.is-mobile > .column.is-offset-one-third {\n  margin-left: 33.3333%;\n}\n.columns.is-mobile > .column.is-offset-one-quarter {\n  margin-left: 25%;\n}\n.columns.is-mobile > .column.is-1 {\n  -webkit-box-flex: 0;\n  -ms-flex: none;\n  flex: none;\n  width: 8.33333%;\n}\n.columns.is-mobile > .column.is-offset-1 {\n  margin-left: 8.33333%;\n}\n.columns.is-mobile > .column.is-2 {\n  -webkit-box-flex: 0;\n  -ms-flex: none;\n  flex: none;\n  width: 16.66667%;\n}\n.columns.is-mobile > .column.is-offset-2 {\n  margin-left: 16.66667%;\n}\n.columns.is-mobile > .column.is-3 {\n  -webkit-box-flex: 0;\n  -ms-flex: none;\n  flex: none;\n  width: 25%;\n}\n.columns.is-mobile > .column.is-offset-3 {\n  margin-left: 25%;\n}\n.columns.is-mobile > .column.is-4 {\n  -webkit-box-flex: 0;\n  -ms-flex: none;\n  flex: none;\n  width: 33.33333%;\n}\n.columns.is-mobile > .column.is-offset-4 {\n  margin-left: 33.33333%;\n}\n.columns.is-mobile > .column.is-5 {\n  -webkit-box-flex: 0;\n  -ms-flex: none;\n  flex: none;\n  width: 41.66667%;\n}\n.columns.is-mobile > .column.is-offset-5 {\n  margin-left: 41.66667%;\n}\n.columns.is-mobile > .column.is-6 {\n  -webkit-box-flex: 0;\n  -ms-flex: none;\n  flex: none;\n  width: 50%;\n}\n.columns.is-mobile > .column.is-offset-6 {\n  margin-left: 50%;\n}\n.columns.is-mobile > .column.is-7 {\n  -webkit-box-flex: 0;\n  -ms-flex: none;\n  flex: none;\n  width: 58.33333%;\n}\n.columns.is-mobile > .column.is-offset-7 {\n  margin-left: 58.33333%;\n}\n.columns.is-mobile > .column.is-8 {\n  -webkit-box-flex: 0;\n  -ms-flex: none;\n  flex: none;\n  width: 66.66667%;\n}\n.columns.is-mobile > .column.is-offset-8 {\n  margin-left: 66.66667%;\n}\n.columns.is-mobile > .column.is-9 {\n  -webkit-box-flex: 0;\n  -ms-flex: none;\n  flex: none;\n  width: 75%;\n}\n.columns.is-mobile > .column.is-offset-9 {\n  margin-left: 75%;\n}\n.columns.is-mobile > .column.is-10 {\n  -webkit-box-flex: 0;\n  -ms-flex: none;\n  flex: none;\n  width: 83.33333%;\n}\n.columns.is-mobile > .column.is-offset-10 {\n  margin-left: 83.33333%;\n}\n.columns.is-mobile > .column.is-11 {\n  -webkit-box-flex: 0;\n  -ms-flex: none;\n  flex: none;\n  width: 91.66667%;\n}\n.columns.is-mobile > .column.is-offset-11 {\n  margin-left: 91.66667%;\n}\n.columns.is-mobile > .column.is-12 {\n  -webkit-box-flex: 0;\n  -ms-flex: none;\n  flex: none;\n  width: 100%;\n}\n.columns.is-mobile > .column.is-offset-12 {\n  margin-left: 100%;\n}\n@media screen and (max-width: 768px) {\n  .column.is-narrow-mobile {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n  }\n\n  .column.is-full-mobile {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 100%;\n  }\n\n  .column.is-three-quarters-mobile {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 75%;\n  }\n\n  .column.is-two-thirds-mobile {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 66.6666%;\n  }\n\n  .column.is-half-mobile {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 50%;\n  }\n\n  .column.is-one-third-mobile {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 33.3333%;\n  }\n\n  .column.is-one-quarter-mobile {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 25%;\n  }\n\n  .column.is-offset-three-quarters-mobile {\n    margin-left: 75%;\n  }\n\n  .column.is-offset-two-thirds-mobile {\n    margin-left: 66.6666%;\n  }\n\n  .column.is-offset-half-mobile {\n    margin-left: 50%;\n  }\n\n  .column.is-offset-one-third-mobile {\n    margin-left: 33.3333%;\n  }\n\n  .column.is-offset-one-quarter-mobile {\n    margin-left: 25%;\n  }\n\n  .column.is-1-mobile {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 8.33333%;\n  }\n\n  .column.is-offset-1-mobile {\n    margin-left: 8.33333%;\n  }\n\n  .column.is-2-mobile {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 16.66667%;\n  }\n\n  .column.is-offset-2-mobile {\n    margin-left: 16.66667%;\n  }\n\n  .column.is-3-mobile {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 25%;\n  }\n\n  .column.is-offset-3-mobile {\n    margin-left: 25%;\n  }\n\n  .column.is-4-mobile {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 33.33333%;\n  }\n\n  .column.is-offset-4-mobile {\n    margin-left: 33.33333%;\n  }\n\n  .column.is-5-mobile {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 41.66667%;\n  }\n\n  .column.is-offset-5-mobile {\n    margin-left: 41.66667%;\n  }\n\n  .column.is-6-mobile {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 50%;\n  }\n\n  .column.is-offset-6-mobile {\n    margin-left: 50%;\n  }\n\n  .column.is-7-mobile {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 58.33333%;\n  }\n\n  .column.is-offset-7-mobile {\n    margin-left: 58.33333%;\n  }\n\n  .column.is-8-mobile {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 66.66667%;\n  }\n\n  .column.is-offset-8-mobile {\n    margin-left: 66.66667%;\n  }\n\n  .column.is-9-mobile {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 75%;\n  }\n\n  .column.is-offset-9-mobile {\n    margin-left: 75%;\n  }\n\n  .column.is-10-mobile {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 83.33333%;\n  }\n\n  .column.is-offset-10-mobile {\n    margin-left: 83.33333%;\n  }\n\n  .column.is-11-mobile {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 91.66667%;\n  }\n\n  .column.is-offset-11-mobile {\n    margin-left: 91.66667%;\n  }\n\n  .column.is-12-mobile {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 100%;\n  }\n\n  .column.is-offset-12-mobile {\n    margin-left: 100%;\n  }\n}\n@media screen and (min-width: 769px), print {\n  .column.is-narrow,\n  .column.is-narrow-tablet {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n  }\n\n  .column.is-full,\n  .column.is-full-tablet {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 100%;\n  }\n\n  .column.is-three-quarters,\n  .column.is-three-quarters-tablet {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 75%;\n  }\n\n  .column.is-two-thirds,\n  .column.is-two-thirds-tablet {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 66.6666%;\n  }\n\n  .column.is-half,\n  .column.is-half-tablet {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 50%;\n  }\n\n  .column.is-one-third,\n  .column.is-one-third-tablet {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 33.3333%;\n  }\n\n  .column.is-one-quarter,\n  .column.is-one-quarter-tablet {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 25%;\n  }\n\n  .column.is-offset-three-quarters,\n  .column.is-offset-three-quarters-tablet {\n    margin-left: 75%;\n  }\n\n  .column.is-offset-two-thirds,\n  .column.is-offset-two-thirds-tablet {\n    margin-left: 66.6666%;\n  }\n\n  .column.is-offset-half,\n  .column.is-offset-half-tablet {\n    margin-left: 50%;\n  }\n\n  .column.is-offset-one-third,\n  .column.is-offset-one-third-tablet {\n    margin-left: 33.3333%;\n  }\n\n  .column.is-offset-one-quarter,\n  .column.is-offset-one-quarter-tablet {\n    margin-left: 25%;\n  }\n\n  .column.is-1,\n  .column.is-1-tablet {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 8.33333%;\n  }\n\n  .column.is-offset-1,\n  .column.is-offset-1-tablet {\n    margin-left: 8.33333%;\n  }\n\n  .column.is-2,\n  .column.is-2-tablet {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 16.66667%;\n  }\n\n  .column.is-offset-2,\n  .column.is-offset-2-tablet {\n    margin-left: 16.66667%;\n  }\n\n  .column.is-3,\n  .column.is-3-tablet {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 25%;\n  }\n\n  .column.is-offset-3,\n  .column.is-offset-3-tablet {\n    margin-left: 25%;\n  }\n\n  .column.is-4,\n  .column.is-4-tablet {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 33.33333%;\n  }\n\n  .column.is-offset-4,\n  .column.is-offset-4-tablet {\n    margin-left: 33.33333%;\n  }\n\n  .column.is-5,\n  .column.is-5-tablet {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 41.66667%;\n  }\n\n  .column.is-offset-5,\n  .column.is-offset-5-tablet {\n    margin-left: 41.66667%;\n  }\n\n  .column.is-6,\n  .column.is-6-tablet {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 50%;\n  }\n\n  .column.is-offset-6,\n  .column.is-offset-6-tablet {\n    margin-left: 50%;\n  }\n\n  .column.is-7,\n  .column.is-7-tablet {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 58.33333%;\n  }\n\n  .column.is-offset-7,\n  .column.is-offset-7-tablet {\n    margin-left: 58.33333%;\n  }\n\n  .column.is-8,\n  .column.is-8-tablet {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 66.66667%;\n  }\n\n  .column.is-offset-8,\n  .column.is-offset-8-tablet {\n    margin-left: 66.66667%;\n  }\n\n  .column.is-9,\n  .column.is-9-tablet {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 75%;\n  }\n\n  .column.is-offset-9,\n  .column.is-offset-9-tablet {\n    margin-left: 75%;\n  }\n\n  .column.is-10,\n  .column.is-10-tablet {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 83.33333%;\n  }\n\n  .column.is-offset-10,\n  .column.is-offset-10-tablet {\n    margin-left: 83.33333%;\n  }\n\n  .column.is-11,\n  .column.is-11-tablet {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 91.66667%;\n  }\n\n  .column.is-offset-11,\n  .column.is-offset-11-tablet {\n    margin-left: 91.66667%;\n  }\n\n  .column.is-12,\n  .column.is-12-tablet {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 100%;\n  }\n\n  .column.is-offset-12,\n  .column.is-offset-12-tablet {\n    margin-left: 100%;\n  }\n}\n@media screen and (min-width: 1000px) {\n  .column.is-narrow-desktop {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n  }\n\n  .column.is-full-desktop {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 100%;\n  }\n\n  .column.is-three-quarters-desktop {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 75%;\n  }\n\n  .column.is-two-thirds-desktop {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 66.6666%;\n  }\n\n  .column.is-half-desktop {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 50%;\n  }\n\n  .column.is-one-third-desktop {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 33.3333%;\n  }\n\n  .column.is-one-quarter-desktop {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 25%;\n  }\n\n  .column.is-offset-three-quarters-desktop {\n    margin-left: 75%;\n  }\n\n  .column.is-offset-two-thirds-desktop {\n    margin-left: 66.6666%;\n  }\n\n  .column.is-offset-half-desktop {\n    margin-left: 50%;\n  }\n\n  .column.is-offset-one-third-desktop {\n    margin-left: 33.3333%;\n  }\n\n  .column.is-offset-one-quarter-desktop {\n    margin-left: 25%;\n  }\n\n  .column.is-1-desktop {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 8.33333%;\n  }\n\n  .column.is-offset-1-desktop {\n    margin-left: 8.33333%;\n  }\n\n  .column.is-2-desktop {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 16.66667%;\n  }\n\n  .column.is-offset-2-desktop {\n    margin-left: 16.66667%;\n  }\n\n  .column.is-3-desktop {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 25%;\n  }\n\n  .column.is-offset-3-desktop {\n    margin-left: 25%;\n  }\n\n  .column.is-4-desktop {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 33.33333%;\n  }\n\n  .column.is-offset-4-desktop {\n    margin-left: 33.33333%;\n  }\n\n  .column.is-5-desktop {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 41.66667%;\n  }\n\n  .column.is-offset-5-desktop {\n    margin-left: 41.66667%;\n  }\n\n  .column.is-6-desktop {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 50%;\n  }\n\n  .column.is-offset-6-desktop {\n    margin-left: 50%;\n  }\n\n  .column.is-7-desktop {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 58.33333%;\n  }\n\n  .column.is-offset-7-desktop {\n    margin-left: 58.33333%;\n  }\n\n  .column.is-8-desktop {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 66.66667%;\n  }\n\n  .column.is-offset-8-desktop {\n    margin-left: 66.66667%;\n  }\n\n  .column.is-9-desktop {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 75%;\n  }\n\n  .column.is-offset-9-desktop {\n    margin-left: 75%;\n  }\n\n  .column.is-10-desktop {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 83.33333%;\n  }\n\n  .column.is-offset-10-desktop {\n    margin-left: 83.33333%;\n  }\n\n  .column.is-11-desktop {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 91.66667%;\n  }\n\n  .column.is-offset-11-desktop {\n    margin-left: 91.66667%;\n  }\n\n  .column.is-12-desktop {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 100%;\n  }\n\n  .column.is-offset-12-desktop {\n    margin-left: 100%;\n  }\n}\n@media screen and (min-width: 1192px) {\n  .column.is-narrow-widescreen {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n  }\n\n  .column.is-full-widescreen {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 100%;\n  }\n\n  .column.is-three-quarters-widescreen {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 75%;\n  }\n\n  .column.is-two-thirds-widescreen {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 66.6666%;\n  }\n\n  .column.is-half-widescreen {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 50%;\n  }\n\n  .column.is-one-third-widescreen {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 33.3333%;\n  }\n\n  .column.is-one-quarter-widescreen {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 25%;\n  }\n\n  .column.is-offset-three-quarters-widescreen {\n    margin-left: 75%;\n  }\n\n  .column.is-offset-two-thirds-widescreen {\n    margin-left: 66.6666%;\n  }\n\n  .column.is-offset-half-widescreen {\n    margin-left: 50%;\n  }\n\n  .column.is-offset-one-third-widescreen {\n    margin-left: 33.3333%;\n  }\n\n  .column.is-offset-one-quarter-widescreen {\n    margin-left: 25%;\n  }\n\n  .column.is-1-widescreen {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 8.33333%;\n  }\n\n  .column.is-offset-1-widescreen {\n    margin-left: 8.33333%;\n  }\n\n  .column.is-2-widescreen {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 16.66667%;\n  }\n\n  .column.is-offset-2-widescreen {\n    margin-left: 16.66667%;\n  }\n\n  .column.is-3-widescreen {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 25%;\n  }\n\n  .column.is-offset-3-widescreen {\n    margin-left: 25%;\n  }\n\n  .column.is-4-widescreen {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 33.33333%;\n  }\n\n  .column.is-offset-4-widescreen {\n    margin-left: 33.33333%;\n  }\n\n  .column.is-5-widescreen {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 41.66667%;\n  }\n\n  .column.is-offset-5-widescreen {\n    margin-left: 41.66667%;\n  }\n\n  .column.is-6-widescreen {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 50%;\n  }\n\n  .column.is-offset-6-widescreen {\n    margin-left: 50%;\n  }\n\n  .column.is-7-widescreen {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 58.33333%;\n  }\n\n  .column.is-offset-7-widescreen {\n    margin-left: 58.33333%;\n  }\n\n  .column.is-8-widescreen {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 66.66667%;\n  }\n\n  .column.is-offset-8-widescreen {\n    margin-left: 66.66667%;\n  }\n\n  .column.is-9-widescreen {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 75%;\n  }\n\n  .column.is-offset-9-widescreen {\n    margin-left: 75%;\n  }\n\n  .column.is-10-widescreen {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 83.33333%;\n  }\n\n  .column.is-offset-10-widescreen {\n    margin-left: 83.33333%;\n  }\n\n  .column.is-11-widescreen {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 91.66667%;\n  }\n\n  .column.is-offset-11-widescreen {\n    margin-left: 91.66667%;\n  }\n\n  .column.is-12-widescreen {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 100%;\n  }\n\n  .column.is-offset-12-widescreen {\n    margin-left: 100%;\n  }\n}\n.columns {\n  margin-left: -0.75rem;\n  margin-right: -0.75rem;\n  margin-top: -0.75rem;\n}\n.columns:last-child {\n  margin-bottom: -0.75rem;\n}\n.columns:not(:last-child) {\n  margin-bottom: 0.75rem;\n}\n.columns.is-centered {\n  -webkit-box-pack: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n}\n.columns.is-gapless {\n  margin-left: 0;\n  margin-right: 0;\n  margin-top: 0;\n}\n.columns.is-gapless:last-child {\n  margin-bottom: 0;\n}\n.columns.is-gapless:not(:last-child) {\n  margin-bottom: 1.5rem;\n}\n.columns.is-gapless > .column {\n  margin: 0;\n  padding: 0;\n}\n@media screen and (min-width: 769px), print {\n  .columns.is-grid {\n    -ms-flex-wrap: wrap;\n    flex-wrap: wrap;\n  }\n\n  .columns.is-grid > .column {\n    max-width: 33.3333%;\n    padding: 0.75rem;\n    width: 33.3333%;\n  }\n\n  .columns.is-grid > .column + .column {\n    margin-left: 0;\n  }\n}\n.columns.is-mobile {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n}\n.columns.is-multiline {\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap;\n}\n.columns.is-vcentered {\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n}\n@media screen and (min-width: 769px), print {\n  .columns:not(.is-desktop) {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n  }\n}\n@media screen and (min-width: 1000px) {\n  .columns.is-desktop {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n  }\n}\n.tile {\n  -webkit-box-align: stretch;\n  -ms-flex-align: stretch;\n  align-items: stretch;\n  display: block;\n  -ms-flex-preferred-size: 0;\n  flex-basis: 0;\n  -webkit-box-flex: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n  -ms-flex-negative: 1;\n  flex-shrink: 1;\n  min-height: -webkit-min-content;\n  min-height: -moz-min-content;\n  min-height: min-content;\n}\n.tile.is-ancestor {\n  margin-left: -0.75rem;\n  margin-right: -0.75rem;\n  margin-top: -0.75rem;\n}\n.tile.is-ancestor:last-child {\n  margin-bottom: -0.75rem;\n}\n.tile.is-ancestor:not(:last-child) {\n  margin-bottom: 0.75rem;\n}\n.tile.is-child {\n  margin: 0 !important;\n}\n.tile.is-parent {\n  padding: 0.75rem;\n}\n.tile.is-vertical {\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n  -ms-flex-direction: column;\n  flex-direction: column;\n}\n.tile.is-vertical > .tile.is-child:not(:last-child) {\n  margin-bottom: 1.5rem !important;\n}\n@media screen and (min-width: 769px), print {\n  .tile:not(.is-child) {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n  }\n\n  .tile.is-1 {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 8.33333%;\n  }\n\n  .tile.is-2 {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 16.66667%;\n  }\n\n  .tile.is-3 {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 25%;\n  }\n\n  .tile.is-4 {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 33.33333%;\n  }\n\n  .tile.is-5 {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 41.66667%;\n  }\n\n  .tile.is-6 {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 50%;\n  }\n\n  .tile.is-7 {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 58.33333%;\n  }\n\n  .tile.is-8 {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 66.66667%;\n  }\n\n  .tile.is-9 {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 75%;\n  }\n\n  .tile.is-10 {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 83.33333%;\n  }\n\n  .tile.is-11 {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 91.66667%;\n  }\n\n  .tile.is-12 {\n    -webkit-box-flex: 0;\n    -ms-flex: none;\n    flex: none;\n    width: 100%;\n  }\n}\n.hero-video {\n  bottom: 0;\n  left: 0;\n  position: absolute;\n  right: 0;\n  top: 0;\n  overflow: hidden;\n}\n.hero-video video {\n  left: 50%;\n  min-height: 100%;\n  min-width: 100%;\n  position: absolute;\n  top: 50%;\n  -webkit-transform: translate3d(-50%, -50%, 0);\n  transform: translate3d(-50%, -50%, 0);\n}\n.hero-video.is-transparent {\n  opacity: 0.3;\n}\n@media screen and (max-width: 768px) {\n  .hero-video {\n    display: none;\n  }\n}\n.hero-buttons {\n  margin-top: 1.5rem;\n}\n@media screen and (max-width: 768px) {\n  .hero-buttons .button {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n  }\n\n  .hero-buttons .button:not(:last-child) {\n    margin-bottom: 0.75rem;\n  }\n}\n@media screen and (min-width: 769px), print {\n  .hero-buttons {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-pack: center;\n    -ms-flex-pack: center;\n    justify-content: center;\n  }\n\n  .hero-buttons .button:not(:last-child) {\n    margin-right: 1.5rem;\n  }\n}\n.hero-head,\n.hero-foot {\n  -webkit-box-flex: 0;\n  -ms-flex-positive: 0;\n  flex-grow: 0;\n  -ms-flex-negative: 0;\n  flex-shrink: 0;\n}\n.hero-body {\n  -webkit-box-flex: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n  -ms-flex-negative: 0;\n  flex-shrink: 0;\n  padding: 3rem 1.5rem;\n}\n@media screen and (min-width: 1192px) {\n  .hero-body {\n    padding-left: 0;\n    padding-right: 0;\n  }\n}\n.hero {\n  -webkit-box-align: stretch;\n  -ms-flex-align: stretch;\n  align-items: stretch;\n  background-color: white;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  -webkit-box-pack: justify;\n  -ms-flex-pack: justify;\n  justify-content: space-between;\n}\n.hero .nav {\n  background: none;\n  box-shadow: 0 1px 0 rgba(219, 219, 219, 0.3);\n}\n.hero .tabs ul {\n  border-bottom: none;\n}\n.hero.is-white {\n  background-color: white;\n  color: #0a0a0a;\n}\n.hero.is-white a:not(.button),\n.hero.is-white strong {\n  color: inherit;\n}\n.hero.is-white .title {\n  color: #0a0a0a;\n}\n.hero.is-white .subtitle {\n  color: rgba(10, 10, 10, 0.9);\n}\n.hero.is-white .subtitle a:not(.button),\n.hero.is-white .subtitle strong {\n  color: #0a0a0a;\n}\n.hero.is-white .nav {\n  box-shadow: 0 1px 0 rgba(10, 10, 10, 0.2);\n}\n@media screen and (max-width: 768px) {\n  .hero.is-white .nav-menu {\n    background-color: white;\n  }\n}\n.hero.is-white a.nav-item,\n.hero.is-white .nav-item a:not(.button) {\n  color: rgba(10, 10, 10, 0.7);\n}\n.hero.is-white a.nav-item:hover,\n.hero.is-white a.nav-item.is-active,\n.hero.is-white .nav-item a:not(.button):hover,\n.hero.is-white .nav-item a:not(.button).is-active {\n  color: #0a0a0a;\n}\n.hero.is-white .tabs a {\n  color: #0a0a0a;\n  opacity: 0.9;\n}\n.hero.is-white .tabs a:hover {\n  opacity: 1;\n}\n.hero.is-white .tabs li.is-active a {\n  opacity: 1;\n}\n.hero.is-white .tabs.is-boxed a,\n.hero.is-white .tabs.is-toggle a {\n  color: #0a0a0a;\n}\n.hero.is-white .tabs.is-boxed a:hover,\n.hero.is-white .tabs.is-toggle a:hover {\n  background-color: rgba(10, 10, 10, 0.1);\n}\n.hero.is-white .tabs.is-boxed li.is-active a,\n.hero.is-white .tabs.is-boxed li.is-active a:hover,\n.hero.is-white .tabs.is-toggle li.is-active a,\n.hero.is-white .tabs.is-toggle li.is-active a:hover {\n  background-color: #0a0a0a;\n  border-color: #0a0a0a;\n  color: white;\n}\n.hero.is-white.is-bold {\n  background-image: -webkit-linear-gradient(309deg, #e6e6e6 0%, white 71%, white 100%);\n  background-image: linear-gradient(141deg, #e6e6e6 0%, white 71%, white 100%);\n}\n@media screen and (max-width: 768px) {\n  .hero.is-white.is-bold .nav-menu {\n    background-image: -webkit-linear-gradient(309deg, #e6e6e6 0%, white 71%, white 100%);\n    background-image: linear-gradient(141deg, #e6e6e6 0%, white 71%, white 100%);\n  }\n}\n@media screen and (max-width: 768px) {\n  .hero.is-white .nav-toggle span {\n    background-color: #0a0a0a;\n  }\n\n  .hero.is-white .nav-toggle:hover {\n    background-color: rgba(10, 10, 10, 0.1);\n  }\n\n  .hero.is-white .nav-toggle.is-active span {\n    background-color: #0a0a0a;\n  }\n\n  .hero.is-white .nav-menu .nav-item {\n    border-top-color: rgba(10, 10, 10, 0.2);\n  }\n}\n.hero.is-black {\n  background-color: #0a0a0a;\n  color: white;\n}\n.hero.is-black a:not(.button),\n.hero.is-black strong {\n  color: inherit;\n}\n.hero.is-black .title {\n  color: white;\n}\n.hero.is-black .subtitle {\n  color: rgba(255, 255, 255, 0.9);\n}\n.hero.is-black .subtitle a:not(.button),\n.hero.is-black .subtitle strong {\n  color: white;\n}\n.hero.is-black .nav {\n  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.2);\n}\n@media screen and (max-width: 768px) {\n  .hero.is-black .nav-menu {\n    background-color: #0a0a0a;\n  }\n}\n.hero.is-black a.nav-item,\n.hero.is-black .nav-item a:not(.button) {\n  color: rgba(255, 255, 255, 0.7);\n}\n.hero.is-black a.nav-item:hover,\n.hero.is-black a.nav-item.is-active,\n.hero.is-black .nav-item a:not(.button):hover,\n.hero.is-black .nav-item a:not(.button).is-active {\n  color: white;\n}\n.hero.is-black .tabs a {\n  color: white;\n  opacity: 0.9;\n}\n.hero.is-black .tabs a:hover {\n  opacity: 1;\n}\n.hero.is-black .tabs li.is-active a {\n  opacity: 1;\n}\n.hero.is-black .tabs.is-boxed a,\n.hero.is-black .tabs.is-toggle a {\n  color: white;\n}\n.hero.is-black .tabs.is-boxed a:hover,\n.hero.is-black .tabs.is-toggle a:hover {\n  background-color: rgba(10, 10, 10, 0.1);\n}\n.hero.is-black .tabs.is-boxed li.is-active a,\n.hero.is-black .tabs.is-boxed li.is-active a:hover,\n.hero.is-black .tabs.is-toggle li.is-active a,\n.hero.is-black .tabs.is-toggle li.is-active a:hover {\n  background-color: white;\n  border-color: white;\n  color: #0a0a0a;\n}\n.hero.is-black.is-bold {\n  background-image: -webkit-linear-gradient(309deg, black 0%, #0a0a0a 71%, #181616 100%);\n  background-image: linear-gradient(141deg, black 0%, #0a0a0a 71%, #181616 100%);\n}\n@media screen and (max-width: 768px) {\n  .hero.is-black.is-bold .nav-menu {\n    background-image: -webkit-linear-gradient(309deg, black 0%, #0a0a0a 71%, #181616 100%);\n    background-image: linear-gradient(141deg, black 0%, #0a0a0a 71%, #181616 100%);\n  }\n}\n@media screen and (max-width: 768px) {\n  .hero.is-black .nav-toggle span {\n    background-color: white;\n  }\n\n  .hero.is-black .nav-toggle:hover {\n    background-color: rgba(10, 10, 10, 0.1);\n  }\n\n  .hero.is-black .nav-toggle.is-active span {\n    background-color: white;\n  }\n\n  .hero.is-black .nav-menu .nav-item {\n    border-top-color: rgba(255, 255, 255, 0.2);\n  }\n}\n.hero.is-light {\n  background-color: whitesmoke;\n  color: #363636;\n}\n.hero.is-light a:not(.button),\n.hero.is-light strong {\n  color: inherit;\n}\n.hero.is-light .title {\n  color: #363636;\n}\n.hero.is-light .subtitle {\n  color: rgba(54, 54, 54, 0.9);\n}\n.hero.is-light .subtitle a:not(.button),\n.hero.is-light .subtitle strong {\n  color: #363636;\n}\n.hero.is-light .nav {\n  box-shadow: 0 1px 0 rgba(54, 54, 54, 0.2);\n}\n@media screen and (max-width: 768px) {\n  .hero.is-light .nav-menu {\n    background-color: whitesmoke;\n  }\n}\n.hero.is-light a.nav-item,\n.hero.is-light .nav-item a:not(.button) {\n  color: rgba(54, 54, 54, 0.7);\n}\n.hero.is-light a.nav-item:hover,\n.hero.is-light a.nav-item.is-active,\n.hero.is-light .nav-item a:not(.button):hover,\n.hero.is-light .nav-item a:not(.button).is-active {\n  color: #363636;\n}\n.hero.is-light .tabs a {\n  color: #363636;\n  opacity: 0.9;\n}\n.hero.is-light .tabs a:hover {\n  opacity: 1;\n}\n.hero.is-light .tabs li.is-active a {\n  opacity: 1;\n}\n.hero.is-light .tabs.is-boxed a,\n.hero.is-light .tabs.is-toggle a {\n  color: #363636;\n}\n.hero.is-light .tabs.is-boxed a:hover,\n.hero.is-light .tabs.is-toggle a:hover {\n  background-color: rgba(10, 10, 10, 0.1);\n}\n.hero.is-light .tabs.is-boxed li.is-active a,\n.hero.is-light .tabs.is-boxed li.is-active a:hover,\n.hero.is-light .tabs.is-toggle li.is-active a,\n.hero.is-light .tabs.is-toggle li.is-active a:hover {\n  background-color: #363636;\n  border-color: #363636;\n  color: whitesmoke;\n}\n.hero.is-light.is-bold {\n  background-image: -webkit-linear-gradient(309deg, #dfd8d8 0%, whitesmoke 71%, white 100%);\n  background-image: linear-gradient(141deg, #dfd8d8 0%, whitesmoke 71%, white 100%);\n}\n@media screen and (max-width: 768px) {\n  .hero.is-light.is-bold .nav-menu {\n    background-image: -webkit-linear-gradient(309deg, #dfd8d8 0%, whitesmoke 71%, white 100%);\n    background-image: linear-gradient(141deg, #dfd8d8 0%, whitesmoke 71%, white 100%);\n  }\n}\n@media screen and (max-width: 768px) {\n  .hero.is-light .nav-toggle span {\n    background-color: #363636;\n  }\n\n  .hero.is-light .nav-toggle:hover {\n    background-color: rgba(10, 10, 10, 0.1);\n  }\n\n  .hero.is-light .nav-toggle.is-active span {\n    background-color: #363636;\n  }\n\n  .hero.is-light .nav-menu .nav-item {\n    border-top-color: rgba(54, 54, 54, 0.2);\n  }\n}\n.hero.is-dark {\n  background-color: #363636;\n  color: whitesmoke;\n}\n.hero.is-dark a:not(.button),\n.hero.is-dark strong {\n  color: inherit;\n}\n.hero.is-dark .title {\n  color: whitesmoke;\n}\n.hero.is-dark .subtitle {\n  color: rgba(245, 245, 245, 0.9);\n}\n.hero.is-dark .subtitle a:not(.button),\n.hero.is-dark .subtitle strong {\n  color: whitesmoke;\n}\n.hero.is-dark .nav {\n  box-shadow: 0 1px 0 rgba(245, 245, 245, 0.2);\n}\n@media screen and (max-width: 768px) {\n  .hero.is-dark .nav-menu {\n    background-color: #363636;\n  }\n}\n.hero.is-dark a.nav-item,\n.hero.is-dark .nav-item a:not(.button) {\n  color: rgba(245, 245, 245, 0.7);\n}\n.hero.is-dark a.nav-item:hover,\n.hero.is-dark a.nav-item.is-active,\n.hero.is-dark .nav-item a:not(.button):hover,\n.hero.is-dark .nav-item a:not(.button).is-active {\n  color: whitesmoke;\n}\n.hero.is-dark .tabs a {\n  color: whitesmoke;\n  opacity: 0.9;\n}\n.hero.is-dark .tabs a:hover {\n  opacity: 1;\n}\n.hero.is-dark .tabs li.is-active a {\n  opacity: 1;\n}\n.hero.is-dark .tabs.is-boxed a,\n.hero.is-dark .tabs.is-toggle a {\n  color: whitesmoke;\n}\n.hero.is-dark .tabs.is-boxed a:hover,\n.hero.is-dark .tabs.is-toggle a:hover {\n  background-color: rgba(10, 10, 10, 0.1);\n}\n.hero.is-dark .tabs.is-boxed li.is-active a,\n.hero.is-dark .tabs.is-boxed li.is-active a:hover,\n.hero.is-dark .tabs.is-toggle li.is-active a,\n.hero.is-dark .tabs.is-toggle li.is-active a:hover {\n  background-color: whitesmoke;\n  border-color: whitesmoke;\n  color: #363636;\n}\n.hero.is-dark.is-bold {\n  background-image: -webkit-linear-gradient(309deg, #1f1919 0%, #363636 71%, #463f3f 100%);\n  background-image: linear-gradient(141deg, #1f1919 0%, #363636 71%, #463f3f 100%);\n}\n@media screen and (max-width: 768px) {\n  .hero.is-dark.is-bold .nav-menu {\n    background-image: -webkit-linear-gradient(309deg, #1f1919 0%, #363636 71%, #463f3f 100%);\n    background-image: linear-gradient(141deg, #1f1919 0%, #363636 71%, #463f3f 100%);\n  }\n}\n@media screen and (max-width: 768px) {\n  .hero.is-dark .nav-toggle span {\n    background-color: whitesmoke;\n  }\n\n  .hero.is-dark .nav-toggle:hover {\n    background-color: rgba(10, 10, 10, 0.1);\n  }\n\n  .hero.is-dark .nav-toggle.is-active span {\n    background-color: whitesmoke;\n  }\n\n  .hero.is-dark .nav-menu .nav-item {\n    border-top-color: rgba(245, 245, 245, 0.2);\n  }\n}\n.hero.is-primary {\n  background-color: #00d1b2;\n  color: #fff;\n}\n.hero.is-primary a:not(.button),\n.hero.is-primary strong {\n  color: inherit;\n}\n.hero.is-primary .title {\n  color: #fff;\n}\n.hero.is-primary .subtitle {\n  color: rgba(255, 255, 255, 0.9);\n}\n.hero.is-primary .subtitle a:not(.button),\n.hero.is-primary .subtitle strong {\n  color: #fff;\n}\n.hero.is-primary .nav {\n  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.2);\n}\n@media screen and (max-width: 768px) {\n  .hero.is-primary .nav-menu {\n    background-color: #00d1b2;\n  }\n}\n.hero.is-primary a.nav-item,\n.hero.is-primary .nav-item a:not(.button) {\n  color: rgba(255, 255, 255, 0.7);\n}\n.hero.is-primary a.nav-item:hover,\n.hero.is-primary a.nav-item.is-active,\n.hero.is-primary .nav-item a:not(.button):hover,\n.hero.is-primary .nav-item a:not(.button).is-active {\n  color: #fff;\n}\n.hero.is-primary .tabs a {\n  color: #fff;\n  opacity: 0.9;\n}\n.hero.is-primary .tabs a:hover {\n  opacity: 1;\n}\n.hero.is-primary .tabs li.is-active a {\n  opacity: 1;\n}\n.hero.is-primary .tabs.is-boxed a,\n.hero.is-primary .tabs.is-toggle a {\n  color: #fff;\n}\n.hero.is-primary .tabs.is-boxed a:hover,\n.hero.is-primary .tabs.is-toggle a:hover {\n  background-color: rgba(10, 10, 10, 0.1);\n}\n.hero.is-primary .tabs.is-boxed li.is-active a,\n.hero.is-primary .tabs.is-boxed li.is-active a:hover,\n.hero.is-primary .tabs.is-toggle li.is-active a,\n.hero.is-primary .tabs.is-toggle li.is-active a:hover {\n  background-color: #fff;\n  border-color: #fff;\n  color: #00d1b2;\n}\n.hero.is-primary.is-bold {\n  background-image: -webkit-linear-gradient(309deg, #009e6c 0%, #00d1b2 71%, #00e7eb 100%);\n  background-image: linear-gradient(141deg, #009e6c 0%, #00d1b2 71%, #00e7eb 100%);\n}\n@media screen and (max-width: 768px) {\n  .hero.is-primary.is-bold .nav-menu {\n    background-image: -webkit-linear-gradient(309deg, #009e6c 0%, #00d1b2 71%, #00e7eb 100%);\n    background-image: linear-gradient(141deg, #009e6c 0%, #00d1b2 71%, #00e7eb 100%);\n  }\n}\n@media screen and (max-width: 768px) {\n  .hero.is-primary .nav-toggle span {\n    background-color: #fff;\n  }\n\n  .hero.is-primary .nav-toggle:hover {\n    background-color: rgba(10, 10, 10, 0.1);\n  }\n\n  .hero.is-primary .nav-toggle.is-active span {\n    background-color: #fff;\n  }\n\n  .hero.is-primary .nav-menu .nav-item {\n    border-top-color: rgba(255, 255, 255, 0.2);\n  }\n}\n.hero.is-info {\n  background-color: #3273dc;\n  color: #fff;\n}\n.hero.is-info a:not(.button),\n.hero.is-info strong {\n  color: inherit;\n}\n.hero.is-info .title {\n  color: #fff;\n}\n.hero.is-info .subtitle {\n  color: rgba(255, 255, 255, 0.9);\n}\n.hero.is-info .subtitle a:not(.button),\n.hero.is-info .subtitle strong {\n  color: #fff;\n}\n.hero.is-info .nav {\n  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.2);\n}\n@media screen and (max-width: 768px) {\n  .hero.is-info .nav-menu {\n    background-color: #3273dc;\n  }\n}\n.hero.is-info a.nav-item,\n.hero.is-info .nav-item a:not(.button) {\n  color: rgba(255, 255, 255, 0.7);\n}\n.hero.is-info a.nav-item:hover,\n.hero.is-info a.nav-item.is-active,\n.hero.is-info .nav-item a:not(.button):hover,\n.hero.is-info .nav-item a:not(.button).is-active {\n  color: #fff;\n}\n.hero.is-info .tabs a {\n  color: #fff;\n  opacity: 0.9;\n}\n.hero.is-info .tabs a:hover {\n  opacity: 1;\n}\n.hero.is-info .tabs li.is-active a {\n  opacity: 1;\n}\n.hero.is-info .tabs.is-boxed a,\n.hero.is-info .tabs.is-toggle a {\n  color: #fff;\n}\n.hero.is-info .tabs.is-boxed a:hover,\n.hero.is-info .tabs.is-toggle a:hover {\n  background-color: rgba(10, 10, 10, 0.1);\n}\n.hero.is-info .tabs.is-boxed li.is-active a,\n.hero.is-info .tabs.is-boxed li.is-active a:hover,\n.hero.is-info .tabs.is-toggle li.is-active a,\n.hero.is-info .tabs.is-toggle li.is-active a:hover {\n  background-color: #fff;\n  border-color: #fff;\n  color: #3273dc;\n}\n.hero.is-info.is-bold {\n  background-image: -webkit-linear-gradient(309deg, #1577c6 0%, #3273dc 71%, #4366e5 100%);\n  background-image: linear-gradient(141deg, #1577c6 0%, #3273dc 71%, #4366e5 100%);\n}\n@media screen and (max-width: 768px) {\n  .hero.is-info.is-bold .nav-menu {\n    background-image: -webkit-linear-gradient(309deg, #1577c6 0%, #3273dc 71%, #4366e5 100%);\n    background-image: linear-gradient(141deg, #1577c6 0%, #3273dc 71%, #4366e5 100%);\n  }\n}\n@media screen and (max-width: 768px) {\n  .hero.is-info .nav-toggle span {\n    background-color: #fff;\n  }\n\n  .hero.is-info .nav-toggle:hover {\n    background-color: rgba(10, 10, 10, 0.1);\n  }\n\n  .hero.is-info .nav-toggle.is-active span {\n    background-color: #fff;\n  }\n\n  .hero.is-info .nav-menu .nav-item {\n    border-top-color: rgba(255, 255, 255, 0.2);\n  }\n}\n.hero.is-success {\n  background-color: #23d160;\n  color: #fff;\n}\n.hero.is-success a:not(.button),\n.hero.is-success strong {\n  color: inherit;\n}\n.hero.is-success .title {\n  color: #fff;\n}\n.hero.is-success .subtitle {\n  color: rgba(255, 255, 255, 0.9);\n}\n.hero.is-success .subtitle a:not(.button),\n.hero.is-success .subtitle strong {\n  color: #fff;\n}\n.hero.is-success .nav {\n  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.2);\n}\n@media screen and (max-width: 768px) {\n  .hero.is-success .nav-menu {\n    background-color: #23d160;\n  }\n}\n.hero.is-success a.nav-item,\n.hero.is-success .nav-item a:not(.button) {\n  color: rgba(255, 255, 255, 0.7);\n}\n.hero.is-success a.nav-item:hover,\n.hero.is-success a.nav-item.is-active,\n.hero.is-success .nav-item a:not(.button):hover,\n.hero.is-success .nav-item a:not(.button).is-active {\n  color: #fff;\n}\n.hero.is-success .tabs a {\n  color: #fff;\n  opacity: 0.9;\n}\n.hero.is-success .tabs a:hover {\n  opacity: 1;\n}\n.hero.is-success .tabs li.is-active a {\n  opacity: 1;\n}\n.hero.is-success .tabs.is-boxed a,\n.hero.is-success .tabs.is-toggle a {\n  color: #fff;\n}\n.hero.is-success .tabs.is-boxed a:hover,\n.hero.is-success .tabs.is-toggle a:hover {\n  background-color: rgba(10, 10, 10, 0.1);\n}\n.hero.is-success .tabs.is-boxed li.is-active a,\n.hero.is-success .tabs.is-boxed li.is-active a:hover,\n.hero.is-success .tabs.is-toggle li.is-active a,\n.hero.is-success .tabs.is-toggle li.is-active a:hover {\n  background-color: #fff;\n  border-color: #fff;\n  color: #23d160;\n}\n.hero.is-success.is-bold {\n  background-image: -webkit-linear-gradient(309deg, #12af2f 0%, #23d160 71%, #2ce28a 100%);\n  background-image: linear-gradient(141deg, #12af2f 0%, #23d160 71%, #2ce28a 100%);\n}\n@media screen and (max-width: 768px) {\n  .hero.is-success.is-bold .nav-menu {\n    background-image: -webkit-linear-gradient(309deg, #12af2f 0%, #23d160 71%, #2ce28a 100%);\n    background-image: linear-gradient(141deg, #12af2f 0%, #23d160 71%, #2ce28a 100%);\n  }\n}\n@media screen and (max-width: 768px) {\n  .hero.is-success .nav-toggle span {\n    background-color: #fff;\n  }\n\n  .hero.is-success .nav-toggle:hover {\n    background-color: rgba(10, 10, 10, 0.1);\n  }\n\n  .hero.is-success .nav-toggle.is-active span {\n    background-color: #fff;\n  }\n\n  .hero.is-success .nav-menu .nav-item {\n    border-top-color: rgba(255, 255, 255, 0.2);\n  }\n}\n.hero.is-warning {\n  background-color: #ffdd57;\n  color: rgba(0, 0, 0, 0.7);\n}\n.hero.is-warning a:not(.button),\n.hero.is-warning strong {\n  color: inherit;\n}\n.hero.is-warning .title {\n  color: rgba(0, 0, 0, 0.7);\n}\n.hero.is-warning .subtitle {\n  color: rgba(0, 0, 0, 0.9);\n}\n.hero.is-warning .subtitle a:not(.button),\n.hero.is-warning .subtitle strong {\n  color: rgba(0, 0, 0, 0.7);\n}\n.hero.is-warning .nav {\n  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);\n}\n@media screen and (max-width: 768px) {\n  .hero.is-warning .nav-menu {\n    background-color: #ffdd57;\n  }\n}\n.hero.is-warning a.nav-item,\n.hero.is-warning .nav-item a:not(.button) {\n  color: rgba(0, 0, 0, 0.7);\n}\n.hero.is-warning a.nav-item:hover,\n.hero.is-warning a.nav-item.is-active,\n.hero.is-warning .nav-item a:not(.button):hover,\n.hero.is-warning .nav-item a:not(.button).is-active {\n  color: rgba(0, 0, 0, 0.7);\n}\n.hero.is-warning .tabs a {\n  color: rgba(0, 0, 0, 0.7);\n  opacity: 0.9;\n}\n.hero.is-warning .tabs a:hover {\n  opacity: 1;\n}\n.hero.is-warning .tabs li.is-active a {\n  opacity: 1;\n}\n.hero.is-warning .tabs.is-boxed a,\n.hero.is-warning .tabs.is-toggle a {\n  color: rgba(0, 0, 0, 0.7);\n}\n.hero.is-warning .tabs.is-boxed a:hover,\n.hero.is-warning .tabs.is-toggle a:hover {\n  background-color: rgba(10, 10, 10, 0.1);\n}\n.hero.is-warning .tabs.is-boxed li.is-active a,\n.hero.is-warning .tabs.is-boxed li.is-active a:hover,\n.hero.is-warning .tabs.is-toggle li.is-active a,\n.hero.is-warning .tabs.is-toggle li.is-active a:hover {\n  background-color: rgba(0, 0, 0, 0.7);\n  border-color: rgba(0, 0, 0, 0.7);\n  color: #ffdd57;\n}\n.hero.is-warning.is-bold {\n  background-image: -webkit-linear-gradient(309deg, #ffaf24 0%, #ffdd57 71%, #fffa70 100%);\n  background-image: linear-gradient(141deg, #ffaf24 0%, #ffdd57 71%, #fffa70 100%);\n}\n@media screen and (max-width: 768px) {\n  .hero.is-warning.is-bold .nav-menu {\n    background-image: -webkit-linear-gradient(309deg, #ffaf24 0%, #ffdd57 71%, #fffa70 100%);\n    background-image: linear-gradient(141deg, #ffaf24 0%, #ffdd57 71%, #fffa70 100%);\n  }\n}\n@media screen and (max-width: 768px) {\n  .hero.is-warning .nav-toggle span {\n    background-color: rgba(0, 0, 0, 0.7);\n  }\n\n  .hero.is-warning .nav-toggle:hover {\n    background-color: rgba(10, 10, 10, 0.1);\n  }\n\n  .hero.is-warning .nav-toggle.is-active span {\n    background-color: rgba(0, 0, 0, 0.7);\n  }\n\n  .hero.is-warning .nav-menu .nav-item {\n    border-top-color: rgba(0, 0, 0, 0.2);\n  }\n}\n.hero.is-danger {\n  background-color: #ff3860;\n  color: #fff;\n}\n.hero.is-danger a:not(.button),\n.hero.is-danger strong {\n  color: inherit;\n}\n.hero.is-danger .title {\n  color: #fff;\n}\n.hero.is-danger .subtitle {\n  color: rgba(255, 255, 255, 0.9);\n}\n.hero.is-danger .subtitle a:not(.button),\n.hero.is-danger .subtitle strong {\n  color: #fff;\n}\n.hero.is-danger .nav {\n  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.2);\n}\n@media screen and (max-width: 768px) {\n  .hero.is-danger .nav-menu {\n    background-color: #ff3860;\n  }\n}\n.hero.is-danger a.nav-item,\n.hero.is-danger .nav-item a:not(.button) {\n  color: rgba(255, 255, 255, 0.7);\n}\n.hero.is-danger a.nav-item:hover,\n.hero.is-danger a.nav-item.is-active,\n.hero.is-danger .nav-item a:not(.button):hover,\n.hero.is-danger .nav-item a:not(.button).is-active {\n  color: #fff;\n}\n.hero.is-danger .tabs a {\n  color: #fff;\n  opacity: 0.9;\n}\n.hero.is-danger .tabs a:hover {\n  opacity: 1;\n}\n.hero.is-danger .tabs li.is-active a {\n  opacity: 1;\n}\n.hero.is-danger .tabs.is-boxed a,\n.hero.is-danger .tabs.is-toggle a {\n  color: #fff;\n}\n.hero.is-danger .tabs.is-boxed a:hover,\n.hero.is-danger .tabs.is-toggle a:hover {\n  background-color: rgba(10, 10, 10, 0.1);\n}\n.hero.is-danger .tabs.is-boxed li.is-active a,\n.hero.is-danger .tabs.is-boxed li.is-active a:hover,\n.hero.is-danger .tabs.is-toggle li.is-active a,\n.hero.is-danger .tabs.is-toggle li.is-active a:hover {\n  background-color: #fff;\n  border-color: #fff;\n  color: #ff3860;\n}\n.hero.is-danger.is-bold {\n  background-image: -webkit-linear-gradient(309deg, #ff0561 0%, #ff3860 71%, #ff5257 100%);\n  background-image: linear-gradient(141deg, #ff0561 0%, #ff3860 71%, #ff5257 100%);\n}\n@media screen and (max-width: 768px) {\n  .hero.is-danger.is-bold .nav-menu {\n    background-image: -webkit-linear-gradient(309deg, #ff0561 0%, #ff3860 71%, #ff5257 100%);\n    background-image: linear-gradient(141deg, #ff0561 0%, #ff3860 71%, #ff5257 100%);\n  }\n}\n@media screen and (max-width: 768px) {\n  .hero.is-danger .nav-toggle span {\n    background-color: #fff;\n  }\n\n  .hero.is-danger .nav-toggle:hover {\n    background-color: rgba(10, 10, 10, 0.1);\n  }\n\n  .hero.is-danger .nav-toggle.is-active span {\n    background-color: #fff;\n  }\n\n  .hero.is-danger .nav-menu .nav-item {\n    border-top-color: rgba(255, 255, 255, 0.2);\n  }\n}\n@media screen and (min-width: 769px), print {\n  .hero.is-medium .hero-body {\n    padding-bottom: 9rem;\n    padding-top: 9rem;\n  }\n}\n@media screen and (min-width: 769px), print {\n  .hero.is-large .hero-body {\n    padding-bottom: 18rem;\n    padding-top: 18rem;\n  }\n}\n.hero.is-fullheight {\n  min-height: 100vh;\n}\n.hero.is-fullheight .hero-body {\n  -webkit-box-align: center;\n  -ms-flex-align: center;\n  align-items: center;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n}\n.hero.is-fullheight .hero-body > .container {\n  -webkit-box-flex: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n  -ms-flex-negative: 1;\n  flex-shrink: 1;\n}\n.section {\n  background-color: white;\n  padding: 3rem 1.5rem;\n}\n@media screen and (min-width: 1000px) {\n  .section.is-medium {\n    padding: 9rem 1.5rem;\n  }\n\n  .section.is-large {\n    padding: 18rem 1.5rem;\n  }\n}\n.footer {\n  background-color: whitesmoke;\n  padding: 3rem 1.5rem 6rem;\n}\n/*# sourceMappingURL=bulma.css.map */\n"; (require("browserify-css").createStyle(css, { "href": "node_modules/bulma/css/bulma.css" }, { "insertAt": "bottom" })); module.exports = css;
},{"browserify-css":14}],17:[function(require,module,exports){
module.exports = require('bel')

},{"bel":12}],18:[function(require,module,exports){
var documentReady = require('document-ready')
var nanohistory = require('nanohistory')
var nanorouter = require('nanorouter')
var nanomount = require('nanomount')
var nanomorph = require('nanomorph')
var nanohref = require('nanohref')
var nanoraf = require('nanoraf')
var nanobus = require('nanobus')
var assert = require('assert')

module.exports = Choo

function Choo (opts) {
  opts = opts || {}

  var routerOpts = {
    default: opts.defaultRoute || '/404',
    curry: true
  }

  var timingEnabled = opts.timing === undefined ? true : opts.timing
  var hasWindow = typeof window !== 'undefined'
  var hasPerformance = hasWindow && window.performance && window.performance.mark
  var router = nanorouter(routerOpts)
  var bus = nanobus()
  var rerender = null
  var tree = null
  var state = {}

  return {
    toString: toString,
    use: register,
    mount: mount,
    router: router,
    route: route,
    start: start
  }

  function route (route, handler) {
    router.on(route, function (params) {
      return function () {
        state.params = params
        return handler(state, emit)
      }
    })
  }

  function register (cb) {
    cb(state, bus)
  }

  function start () {
    if (opts.history !== false) {
      nanohistory(function (href) {
        bus.emit('pushState')
      })

      bus.prependListener('pushState', updateHistory.bind(null, 'push'))
      bus.prependListener('replaceState', updateHistory.bind(null, 'replace'))

      function updateHistory (mode, href) {
        if (href) window.history[mode + 'State']({}, null, href)
        bus.emit('render')
        setTimeout(function () {
          scrollIntoView()
        }, 0)
      }

      if (opts.href !== false) {
        nanohref(function (location) {
          var href = location.href
          var currHref = window.location.href
          if (href === currHref) return
          bus.emit('pushState', href)
        })
      }
    }

    rerender = nanoraf(function () {
      if (hasPerformance && timingEnabled) {
        window.performance.mark('choo:renderStart')
      }
      var newTree = router(createLocation())
      tree = nanomorph(tree, newTree)
      assert.notEqual(tree, newTree, 'choo.start: a different node type was returned as the root node on a rerender. Make sure that the root node is always the same type to prevent the application from being unmounted.')
      if (hasPerformance && timingEnabled) {
        window.performance.mark('choo:renderEnd')
        window.performance.measure('choo:render', 'choo:renderStart', 'choo:renderEnd')
      }
    })

    bus.prependListener('render', rerender)

    documentReady(function () {
      bus.emit('DOMContentLoaded')
    })

    tree = router(createLocation())

    return tree
  }

  function emit (eventName, data) {
    bus.emit(eventName, data)
  }

  function mount (selector) {
    var newTree = start()
    documentReady(function () {
      var root = document.querySelector(selector)
      assert.ok(root, 'choo.mount: could not query selector: ' + selector)
      nanomount(root, newTree)
      tree = root
    })
  }

  function toString (location, _state) {
    state = _state || {}
    var html = router(location)
    assert.equal()
    return html.toString()
  }
}

function scrollIntoView () {
  var hash = window.location.hash
  if (hash) {
    try {
      var el = document.querySelector(hash)
      if (el) el.scrollIntoView(true)
    } catch (e) {}
  }
}

function createLocation () {
  var pathname = window.location.pathname.replace(/\/$/, '')
  var hash = window.location.hash.replace(/^#/, '/')
  return pathname + hash
}

},{"assert":1,"document-ready":20,"nanobus":39,"nanohistory":40,"nanohref":41,"nanomorph":42,"nanomount":45,"nanoraf":46,"nanorouter":47}],19:[function(require,module,exports){
(function (global){
/*!
 * deep-diff.
 * Licensed under the MIT License.
 */
;(function(root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function() {
      return factory();
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.DeepDiff = factory();
  }
}(this, function(undefined) {
  'use strict';

  var $scope, conflict, conflictResolution = [];
  if (typeof global === 'object' && global) {
    $scope = global;
  } else if (typeof window !== 'undefined') {
    $scope = window;
  } else {
    $scope = {};
  }
  conflict = $scope.DeepDiff;
  if (conflict) {
    conflictResolution.push(
      function() {
        if ('undefined' !== typeof conflict && $scope.DeepDiff === accumulateDiff) {
          $scope.DeepDiff = conflict;
          conflict = undefined;
        }
      });
  }

  // nodejs compatible on server side and in the browser.
  function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  }

  function Diff(kind, path) {
    Object.defineProperty(this, 'kind', {
      value: kind,
      enumerable: true
    });
    if (path && path.length) {
      Object.defineProperty(this, 'path', {
        value: path,
        enumerable: true
      });
    }
  }

  function DiffEdit(path, origin, value) {
    DiffEdit.super_.call(this, 'E', path);
    Object.defineProperty(this, 'lhs', {
      value: origin,
      enumerable: true
    });
    Object.defineProperty(this, 'rhs', {
      value: value,
      enumerable: true
    });
  }
  inherits(DiffEdit, Diff);

  function DiffNew(path, value) {
    DiffNew.super_.call(this, 'N', path);
    Object.defineProperty(this, 'rhs', {
      value: value,
      enumerable: true
    });
  }
  inherits(DiffNew, Diff);

  function DiffDeleted(path, value) {
    DiffDeleted.super_.call(this, 'D', path);
    Object.defineProperty(this, 'lhs', {
      value: value,
      enumerable: true
    });
  }
  inherits(DiffDeleted, Diff);

  function DiffArray(path, index, item) {
    DiffArray.super_.call(this, 'A', path);
    Object.defineProperty(this, 'index', {
      value: index,
      enumerable: true
    });
    Object.defineProperty(this, 'item', {
      value: item,
      enumerable: true
    });
  }
  inherits(DiffArray, Diff);

  function arrayRemove(arr, from, to) {
    var rest = arr.slice((to || from) + 1 || arr.length);
    arr.length = from < 0 ? arr.length + from : from;
    arr.push.apply(arr, rest);
    return arr;
  }

  function realTypeOf(subject) {
    var type = typeof subject;
    if (type !== 'object') {
      return type;
    }

    if (subject === Math) {
      return 'math';
    } else if (subject === null) {
      return 'null';
    } else if (Array.isArray(subject)) {
      return 'array';
    } else if (Object.prototype.toString.call(subject) === '[object Date]') {
      return 'date';
    } else if (typeof subject.toString !== 'undefined' && /^\/.*\//.test(subject.toString())) {
      return 'regexp';
    }
    return 'object';
  }

  function deepDiff(lhs, rhs, changes, prefilter, path, key, stack) {
    path = path || [];
    var currentPath = path.slice(0);
    if (typeof key !== 'undefined') {
      if (prefilter) {
        if (typeof(prefilter) === 'function' && prefilter(currentPath, key)) { return; }
        else if (typeof(prefilter) === 'object') {
          if (prefilter.prefilter && prefilter.prefilter(currentPath, key)) { return; }
          if (prefilter.normalize) {
            var alt = prefilter.normalize(currentPath, key, lhs, rhs);
            if (alt) {
              lhs = alt[0];
              rhs = alt[1];
            }
          }
        }
      }
      currentPath.push(key);
    }

    // Use string comparison for regexes
    if (realTypeOf(lhs) === 'regexp' && realTypeOf(rhs) === 'regexp') {
      lhs = lhs.toString();
      rhs = rhs.toString();
    }

    var ltype = typeof lhs;
    var rtype = typeof rhs;
    if (ltype === 'undefined') {
      if (rtype !== 'undefined') {
        changes(new DiffNew(currentPath, rhs));
      }
    } else if (rtype === 'undefined') {
      changes(new DiffDeleted(currentPath, lhs));
    } else if (realTypeOf(lhs) !== realTypeOf(rhs)) {
      changes(new DiffEdit(currentPath, lhs, rhs));
    } else if (Object.prototype.toString.call(lhs) === '[object Date]' && Object.prototype.toString.call(rhs) === '[object Date]' && ((lhs - rhs) !== 0)) {
      changes(new DiffEdit(currentPath, lhs, rhs));
    } else if (ltype === 'object' && lhs !== null && rhs !== null) {
      stack = stack || [];
      if (stack.indexOf(lhs) < 0) {
        stack.push(lhs);
        if (Array.isArray(lhs)) {
          var i, len = lhs.length;
          for (i = 0; i < lhs.length; i++) {
            if (i >= rhs.length) {
              changes(new DiffArray(currentPath, i, new DiffDeleted(undefined, lhs[i])));
            } else {
              deepDiff(lhs[i], rhs[i], changes, prefilter, currentPath, i, stack);
            }
          }
          while (i < rhs.length) {
            changes(new DiffArray(currentPath, i, new DiffNew(undefined, rhs[i++])));
          }
        } else {
          var akeys = Object.keys(lhs);
          var pkeys = Object.keys(rhs);
          akeys.forEach(function(k, i) {
            var other = pkeys.indexOf(k);
            if (other >= 0) {
              deepDiff(lhs[k], rhs[k], changes, prefilter, currentPath, k, stack);
              pkeys = arrayRemove(pkeys, other);
            } else {
              deepDiff(lhs[k], undefined, changes, prefilter, currentPath, k, stack);
            }
          });
          pkeys.forEach(function(k) {
            deepDiff(undefined, rhs[k], changes, prefilter, currentPath, k, stack);
          });
        }
        stack.length = stack.length - 1;
      }
    } else if (lhs !== rhs) {
      if (!(ltype === 'number' && isNaN(lhs) && isNaN(rhs))) {
        changes(new DiffEdit(currentPath, lhs, rhs));
      }
    }
  }

  function accumulateDiff(lhs, rhs, prefilter, accum) {
    accum = accum || [];
    deepDiff(lhs, rhs,
      function(diff) {
        if (diff) {
          accum.push(diff);
        }
      },
      prefilter);
    return (accum.length) ? accum : undefined;
  }

  function applyArrayChange(arr, index, change) {
    if (change.path && change.path.length) {
      var it = arr[index],
          i, u = change.path.length - 1;
      for (i = 0; i < u; i++) {
        it = it[change.path[i]];
      }
      switch (change.kind) {
        case 'A':
          applyArrayChange(it[change.path[i]], change.index, change.item);
          break;
        case 'D':
          delete it[change.path[i]];
          break;
        case 'E':
        case 'N':
          it[change.path[i]] = change.rhs;
          break;
      }
    } else {
      switch (change.kind) {
        case 'A':
          applyArrayChange(arr[index], change.index, change.item);
          break;
        case 'D':
          arr = arrayRemove(arr, index);
          break;
        case 'E':
        case 'N':
          arr[index] = change.rhs;
          break;
      }
    }
    return arr;
  }

  function applyChange(target, source, change) {
    if (target && source && change && change.kind) {
      var it = target,
          i = -1,
          last = change.path ? change.path.length - 1 : 0;
      while (++i < last) {
        if (typeof it[change.path[i]] === 'undefined') {
          it[change.path[i]] = (typeof change.path[i] === 'number') ? [] : {};
        }
        it = it[change.path[i]];
      }
      switch (change.kind) {
        case 'A':
          applyArrayChange(change.path ? it[change.path[i]] : it, change.index, change.item);
          break;
        case 'D':
          delete it[change.path[i]];
          break;
        case 'E':
        case 'N':
          it[change.path[i]] = change.rhs;
          break;
      }
    }
  }

  function revertArrayChange(arr, index, change) {
    if (change.path && change.path.length) {
      // the structure of the object at the index has changed...
      var it = arr[index],
          i, u = change.path.length - 1;
      for (i = 0; i < u; i++) {
        it = it[change.path[i]];
      }
      switch (change.kind) {
        case 'A':
          revertArrayChange(it[change.path[i]], change.index, change.item);
          break;
        case 'D':
          it[change.path[i]] = change.lhs;
          break;
        case 'E':
          it[change.path[i]] = change.lhs;
          break;
        case 'N':
          delete it[change.path[i]];
          break;
      }
    } else {
      // the array item is different...
      switch (change.kind) {
        case 'A':
          revertArrayChange(arr[index], change.index, change.item);
          break;
        case 'D':
          arr[index] = change.lhs;
          break;
        case 'E':
          arr[index] = change.lhs;
          break;
        case 'N':
          arr = arrayRemove(arr, index);
          break;
      }
    }
    return arr;
  }

  function revertChange(target, source, change) {
    if (target && source && change && change.kind) {
      var it = target,
          i, u;
      u = change.path.length - 1;
      for (i = 0; i < u; i++) {
        if (typeof it[change.path[i]] === 'undefined') {
          it[change.path[i]] = {};
        }
        it = it[change.path[i]];
      }
      switch (change.kind) {
        case 'A':
          // Array was modified...
          // it will be an array...
          revertArrayChange(it[change.path[i]], change.index, change.item);
          break;
        case 'D':
          // Item was deleted...
          it[change.path[i]] = change.lhs;
          break;
        case 'E':
          // Item was edited...
          it[change.path[i]] = change.lhs;
          break;
        case 'N':
          // Item is new...
          delete it[change.path[i]];
          break;
      }
    }
  }

  function applyDiff(target, source, filter) {
    if (target && source) {
      var onChange = function(change) {
        if (!filter || filter(target, source, change)) {
          applyChange(target, source, change);
        }
      };
      deepDiff(target, source, onChange);
    }
  }

  Object.defineProperties(accumulateDiff, {

    diff: {
      value: accumulateDiff,
      enumerable: true
    },
    observableDiff: {
      value: deepDiff,
      enumerable: true
    },
    applyDiff: {
      value: applyDiff,
      enumerable: true
    },
    applyChange: {
      value: applyChange,
      enumerable: true
    },
    revertChange: {
      value: revertChange,
      enumerable: true
    },
    isConflict: {
      value: function() {
        return 'undefined' !== typeof conflict;
      },
      enumerable: true
    },
    noConflict: {
      value: function() {
        if (conflictResolution) {
          conflictResolution.forEach(function(it) {
            it();
          });
          conflictResolution = null;
        }
        return accumulateDiff;
      },
      enumerable: true
    }
  });

  return accumulateDiff;
}));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],20:[function(require,module,exports){
'use strict'

var assert = require('assert')

module.exports = ready

function ready (callback) {
  assert.notEqual(typeof document, 'undefined', 'document-ready only runs in the browser')
  var state = document.readyState
  if (state === 'complete' || state === 'interactive') {
    return setTimeout(callback, 0)
  }

  document.addEventListener('DOMContentLoaded', function onLoad () {
    callback()
  })
}

},{"assert":1}],21:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],22:[function(require,module,exports){
/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 1.3.2
 * 2016-06-16 18:25:19
 *
 * By Eli Grey, http://eligrey.com
 * License: MIT
 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */

/*global self */
/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

var saveAs = saveAs || (function(view) {
	"use strict";
	// IE <10 is explicitly unsupported
	if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
		return;
	}
	var
		  doc = view.document
		  // only get URL when necessary in case Blob.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link = "download" in save_link
		, click = function(node) {
			var event = new MouseEvent("click");
			node.dispatchEvent(event);
		}
		, is_safari = /constructor/i.test(view.HTMLElement) || view.safari
		, is_chrome_ios =/CriOS\/[\d]+/.test(navigator.userAgent)
		, throw_outside = function(ex) {
			(view.setImmediate || view.setTimeout)(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		// the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
		, arbitrary_revoke_timeout = 1000 * 40 // in ms
		, revoke = function(file) {
			var revoker = function() {
				if (typeof file === "string") { // file is an object URL
					get_URL().revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			};
			setTimeout(revoker, arbitrary_revoke_timeout);
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, auto_bom = function(blob) {
			// prepend BOM for UTF-8 XML and text/* types (including HTML)
			// note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
			if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
				return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
			}
			return blob;
		}
		, FileSaver = function(blob, name, no_auto_bom) {
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, force = type === force_saveable_type
				, object_url
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
						// Safari doesn't allow downloading of blob urls
						var reader = new FileReader();
						reader.onloadend = function() {
							var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
							var popup = view.open(url, '_blank');
							if(!popup) view.location.href = url;
							url=undefined; // release reference before dispatching
							filesaver.readyState = filesaver.DONE;
							dispatch_all();
						};
						reader.readAsDataURL(blob);
						filesaver.readyState = filesaver.INIT;
						return;
					}
					// don't create more object URLs than needed
					if (!object_url) {
						object_url = get_URL().createObjectURL(blob);
					}
					if (force) {
						view.location.href = object_url;
					} else {
						var opened = view.open(object_url, "_blank");
						if (!opened) {
							// Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
							view.location.href = object_url;
						}
					}
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
					revoke(object_url);
				}
			;
			filesaver.readyState = filesaver.INIT;

			if (can_use_save_link) {
				object_url = get_URL().createObjectURL(blob);
				setTimeout(function() {
					save_link.href = object_url;
					save_link.download = name;
					click(save_link);
					dispatch_all();
					revoke(object_url);
					filesaver.readyState = filesaver.DONE;
				});
				return;
			}

			fs_error();
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name, no_auto_bom) {
			return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
		}
	;
	// IE 10+ (native saveAs)
	if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
		return function(blob, name, no_auto_bom) {
			name = name || blob.name || "download";

			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			return navigator.msSaveOrOpenBlob(blob, name);
		};
	}

	FS_proto.abort = function(){};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;

	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;

	return saveAs;
}(
	   typeof self !== "undefined" && self
	|| typeof window !== "undefined" && window
	|| this.content
));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window

if (typeof module !== "undefined" && module.exports) {
  module.exports.saveAs = saveAs;
} else if ((typeof define !== "undefined" && define !== null) && (define.amd !== null)) {
  define("FileSaver.js", function() {
    return saveAs;
  });
}

},{}],23:[function(require,module,exports){
var isFunction = require('is-function')

module.exports = forEach

var toString = Object.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty

function forEach(list, iterator, context) {
    if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this
    }
    
    if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context)
    else if (typeof list === 'string')
        forEachString(list, iterator, context)
    else
        forEachObject(list, iterator, context)
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array)
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object)
        }
    }
}

},{"is-function":38}],24:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

var doccy;

if (typeof document !== 'undefined') {
    doccy = document;
} else {
    doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }
}

module.exports = doccy;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"min-document":13}],25:[function(require,module,exports){
(function (global){
var win;

if (typeof window !== "undefined") {
    win = window;
} else if (typeof global !== "undefined") {
    win = global;
} else if (typeof self !== "undefined"){
    win = self;
} else {
    win = {};
}

module.exports = win;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],26:[function(require,module,exports){
(function (process){
/*
 * gridpaint - a canvas for creating grid-based art in the browser
 * Copyright (C) 2016 Mister Hat
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA
 */

var EventEmitter = require('events'),

    inherits = require('inherits'),

    Canvas = require('./lib/canvas'),
    draw = require('./lib/draw'),
    handlers = require('./lib/handlers'),
    save = require('./lib/save'),
    tools = require('./lib/tools');

var DEFAULT_PALETTE = [ 'transparent', '#fff', '#c0c0c0', '#808080', '#000',
                        '#f00', '#800', '#ff0', '#808000', '#0f0', '#080',
                        '#0ff', '#008080', '#00f', '#000080', '#f0f',
                        '#800080' ];

function GridPaint(options) {
    // use as a constructor without `new`
    if (!(this instanceof GridPaint)) {
        return new GridPaint(options);
    }

    options = options || {};
    EventEmitter.call(this);

    this.width = options.width || 16;
    this.height = options.height || this.width;
    this.cellWidth = options.cellWidth || 16;
    this.cellHeight = options.cellHeight || this.cellWidth;
    this.palette = options.palette || DEFAULT_PALETTE;
    this.grid = options.grid || false;

    this.background = true;
    this.colour = 0;
    this.cursor = { x: -1, y: -1 };
    this.isApplied = false;
    this.painting = [];
    this.redoHistory = [];
    this.tool = 'pencil';
    this.undoHistory = [];

    this.canvas = new Canvas(this.width * this.cellWidth,
                             this.height * this.cellHeight);
    this.ctx = this.canvas.getContext('2d');

    if (process.browser) {
        this.canvas.className = 'gridpaint-canvas';
        this.canvas.style.cursor = 'crosshair';

        if (/firefox/i.test(navigator.userAgent)) {
            this.canvas.style.imageRendering = '-moz-crisp-edges';
        } else {
            this.canvas.style.imageRendering = 'pixelated';
        }

        this.dom = this.canvas;

        // cache because creating functions is expensive
        this.boundDraw = this.draw.bind(this);
    }

    this.clear();
}

inherits(GridPaint, EventEmitter);

GridPaint.prototype.resize = function () {
    this.canvas.width = this.width * this.cellWidth;
    this.canvas.height = this.height * this.cellHeight;
};

// perform the current tool's action on the painting
GridPaint.prototype.action = function () {
    this[this.tool]();
    this.emit('action');
};

GridPaint.prototype.applyTool = tools.apply;
GridPaint.prototype.bucket = tools.bucket;
GridPaint.prototype.clear = tools.clear;
GridPaint.prototype.compareChanges = tools.compare;
GridPaint.prototype.pencil = tools.pencil;
GridPaint.prototype.redo = tools.redo;
GridPaint.prototype.replace = tools.replace;
GridPaint.prototype.undo = tools.undo;

GridPaint.prototype.drawBackground = draw.background;
GridPaint.prototype.drawCursor = draw.cursor;
GridPaint.prototype.drawGrid = draw.grid;
GridPaint.prototype.drawPainting = draw.painting;
GridPaint.prototype.draw = draw.tick;

GridPaint.prototype.saveAs = save;

GridPaint.prototype.attachHandlers = handlers.attach;
GridPaint.prototype.detachHandlers = handlers.detach;

// attach handlers & start draw loop
GridPaint.prototype.init = function () {
    this.attachHandlers();
    this.drawing = true;
    this.draw();
};

// detach handlers & start draw loop
GridPaint.prototype.destroy = function () {
    this.detachHandlers();
    this.drawing = false;
};

module.exports = GridPaint;

}).call(this,require('_process'))
},{"./lib/canvas":28,"./lib/draw":30,"./lib/handlers":31,"./lib/save":33,"./lib/tools":34,"_process":51,"events":21,"inherits":37}],27:[function(require,module,exports){
// fill in surrounding, like-coloured grid units
module.exports = function (replace, x, y) {
    var colour = this.colour;

    x = typeof x !== 'undefined' ? x : this.cursor.x;
    y = typeof y !== 'undefined' ? y : this.cursor.y;
    replace = typeof replace !== 'undefined' ? replace : this.painting[y][x];

    if (replace === colour || this.painting[y][x] !== replace) {
        return;
    }

    this.painting[y][x] = colour;

    if ((y + 1) < this.height) {
        this.bucket(replace, x, y + 1);
    }

    if ((y - 1) > -1) {
        this.bucket(replace, x, y - 1);
    }

    if ((x + 1) < this.width) {
        this.bucket(replace, x + 1, y);
    }

    if ((x - 1) > -1) {
        this.bucket(replace, x - 1, y);
    }
};

},{}],28:[function(require,module,exports){
(function (process){
if (process.browser) {
    module.exports = function (width, height) {
        var c = document.createElement('canvas');
        c.width = width || 300;
        c.height = height || 150;
        return c;
    };
} else {
    module.exports = require('canvas');
}

}).call(this,require('_process'))
},{"_process":51,"canvas":13}],29:[function(require,module,exports){
function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// empty all of the grid units
module.exports = function () {
    var i, j;

    // allow the user to undo a clear
    if (Array.isArray(this.painting) && Array.isArray(this.painting[0])) {
        this.oldPainting = clone(this.painting);
    }

    this.painting.length = 0;

    for (i = 0; i < this.height; i += 1) {
        this.painting.push([]);
        for (j = 0; j < this.width; j += 1) {
            this.painting[i].push(0);
        }
    }

    this.compareChanges();
    this.emit('clear');
};

},{}],30:[function(require,module,exports){
// draw the checkered pattern to indicate transparency
exports.background = function () {
    var odd = false,
        cw = this.cellWidth,
        ch = this.cellHeight,
        i, j;

    for (i = 0; i < this.width * 2; i += 1) {
        for (j = 0; j < this.height * 2; j += 1) {
            this.ctx.fillStyle = odd ? '#999' : '#666';
            this.ctx.fillRect(i * (cw / 2), j * (ch / 2), cw / 2, ch / 2);
            odd = !odd;
        }
        odd = !odd;
    }
};

// overlap the current colour as a crosshair over the position it will be
// applied to
exports.cursor = function () {
    var cw, ch, x, y;

    if (this.cursor.x < 0 || this.cursor.y < 0) {
        return;
    }

    cw = this.cellWidth;
    ch = this.cellHeight;
    x = this.cursor.x;
    y = this.cursor.y;

    this.ctx.globalAlpha = 0.8;
    this.ctx.fillStyle = this.palette[this.colour];
    this.ctx.fillRect(x * cw + cw / 4, y * ch, cw / 2, ch);
    this.ctx.fillRect(x * cw, y * ch + ch / 4, cw, ch / 2);
    this.ctx.globalAlpha = 1;
};

// draw contrasting grid units
exports.grid = function () {
    var cw = this.cellWidth,
        ch = this.cellHeight,
        i;

    this.ctx.strokeStyle = this.grid;

    for (i = 0; i < this.width; i += 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(i * cw + 0.5, 0);
        this.ctx.lineTo(i * cw + 0.5, ch * this.height);
        this.ctx.stroke();
    }

    for (i = 0; i < this.height; i += 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, i * ch + 0.5);
        this.ctx.lineTo(cw * this.width, i * ch + 0.5);
        this.ctx.stroke();
    }
};

// draw the grid units onto a canvas
exports.painting = function (ctx, scale) {
    var cw = this.cellWidth,
        ch = this.cellHeight,
        i, j;

    // this is just so we can re-use this function on the export
    ctx = ctx || this.ctx;
    scale = scale || 1;

    for (i = 0; i < this.height; i += 1) {
        for (j = 0; j < this.width; j += 1) {
            ctx.fillStyle = this.palette[this.painting[i][j]] || 'transparent';
            ctx.fillRect(j * cw * scale, i * ch * scale, cw * scale,
                         ch * scale);
        }
    }
};

exports.tick = function () {
    if (this.background) {
        this.drawBackground();
    } else {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    this.drawPainting();
    this.drawCursor();

    if (this.grid) {
        this.drawGrid();
    }

    if (this.drawing) {
        window.requestAnimationFrame(this.boundDraw);
    }
};

},{}],31:[function(require,module,exports){
(function (process){
function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

var handlers = {
    mousemove: function (e) {
        var cw = this.cellWidth,
            ch = this.cellHeight,
            rect = this.canvas.getBoundingClientRect(),
            x = e.pageX - rect.left - window.scrollX,
            y = e.pageY - rect.top - window.scrollY;

        this.cursor.x = Math.floor(x / this.width * (this.width / cw));
        this.cursor.y = Math.floor(y / this.height * (this.height / ch));

        if (this.isApplied) {
            this.action();
        }

        this.emit('move');
    },
    mousedown: function () {
        // create a clone to compare changes for undo history
        this.oldPainting = clone(this.painting);
        this.applyTool(true);
    },
    mouseup: function () {
        if (this.isApplied) {
            this.applyTool(false);
            this.compareChanges();
        }
    }
};

// activate event handlers
module.exports.attach = function () {
    var that;

    if (!process.browser) {
        return;
    }

    that = this;
    this.events = {};

    Object.keys(handlers).forEach(function (e) {
        that.events[e] = handlers[e].bind(that);
        that.canvas.addEventListener(e, that.events[e], false);
    });

    // in case the user drags away from the canvas element
    window.addEventListener('mouseup', that.events.mouseup, false);
};

// remove all the event listeners & cease the draw loop
module.exports.detach = function () {
    var that;

    if (!process.browser) {
        return;
    }

    that = this;

    Object.keys(handlers).forEach(function (e) {
        that.canvas.removeEventListener(e, that.events[e], false);
    });

    window.removeEventListener('mouseup', that.events.mouseup, false);
};

}).call(this,require('_process'))
},{"_process":51}],32:[function(require,module,exports){
function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// replace all of a certain colour with another
module.exports = function (old, replace) {
    var i, j, c;

    if (old === replace) {
        return;
    }

    if (typeof old === 'string') {
        old = this.palette.indexOf(old);
    }

    if (typeof replace === 'string') {
        replace = this.palette.indexOf(replace);
    }

    this.oldPainting = clone(this.painting);
    this.painting.length = 0;

    for (i = 0; i < this.height; i += 1) {
        this.painting.push([]);
        for (j = 0; j < this.width; j += 1) {
            c = this.oldPainting[i][j];
            this.painting[i].push(c === old ? replace : c);
        }
    }

    this.compareChanges();
    this.emit('replace');
};

},{}],33:[function(require,module,exports){
(function (process){
var FileSaver = require('file-saver'),

    Canvas = require('./canvas');

// export the painting to file
module.exports = function (file, scale) {
    var exported = new Canvas(),
        eCtx = exported.getContext('2d');

    file = file || 'painting.png';
    scale = scale || 1;

    exported.width = this.width * this.cellWidth * scale;
    exported.height = this.height * this.cellHeight * scale;
    this.drawPainting(eCtx, scale);

    if (process.title === 'browser') {
        exported.toBlob(function (blob) {
            FileSaver.saveAs(blob, file);
        });
    } else {
        exported.pngStream().pipe(require('fs').createWriteStream('./' + file));
    }
};

}).call(this,require('_process'))
},{"./canvas":28,"_process":51,"file-saver":22,"fs":15}],34:[function(require,module,exports){
var FileSaver = require('file-saver'),
    deepDiff = require('deep-diff'),

    bucket = require('./bucket'),
    clear = require('./clear'),
    replace = require('./replace');

var MAX_HISTORY = 99;

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function pushHistory(top, bottom, doChange) {
    var that, changes;

    if (!top.length) {
        return;
    }

    that = this;
    changes = top.pop();

    bottom.push(clone(changes));

    if (!changes) {
        return;
    }

    changes.forEach(function (change) {
        doChange(that.painting, that.painting, change);
    });
}

// activated when the user's finger or mouse is pressed
exports.apply = function (isApplied) {
    if (typeof isApplied !== 'undefined') {
        this.isApplied = isApplied;
    } else {
        this.isApplied = !this.isApplied;
    }

    // activate the tool for initial mouse press
    if (this.isApplied) {
        this.action();
    }

    this.emit('applyTool', this.isApplied);
};

exports.bucket = bucket;
exports.clear = clear;

// compared oldPainting to painting & push the changes to history
exports.compare = function () {
    var changes = deepDiff.diff(this.oldPainting, this.painting);

    if (!changes) {
        return;
    }

    changes = changes.filter(function (change) {
        return change.kind === 'E';
    });

    if (changes.length) {
        this.undoHistory.push(changes);
        this.undoHistory.splice(0, this.undoHistory.length - MAX_HISTORY);
        this.redoHistory.length = 0;
    }
};

// fill in grid units one by one
exports.pencil = function () {
    var x = this.cursor.x,
        y = this.cursor.y;

    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        this.painting[y][x] = this.colour;
    }
};

// redo the last painting action performed (if any)
exports.redo = function () {
    pushHistory.bind(this, this.redoHistory, this.undoHistory,
                     deepDiff.applyChange)();
    this.emit('redo');
};

exports.replace = replace;

// undo the last painting action performed (if any)
exports.undo = function () {
    pushHistory.bind(this, this.undoHistory, this.redoHistory,
                     deepDiff.revertChange)();
    this.emit('undo');
};

},{"./bucket":27,"./clear":29,"./replace":32,"deep-diff":19,"file-saver":22}],35:[function(require,module,exports){
module.exports = attributeToProperty

var transform = {
  'class': 'className',
  'for': 'htmlFor',
  'http-equiv': 'httpEquiv'
}

function attributeToProperty (h) {
  return function (tagName, attrs, children) {
    for (var attr in attrs) {
      if (attr in transform) {
        attrs[transform[attr]] = attrs[attr]
        delete attrs[attr]
      }
    }
    return h(tagName, attrs, children)
  }
}

},{}],36:[function(require,module,exports){
var attrToProp = require('hyperscript-attribute-to-property')

var VAR = 0, TEXT = 1, OPEN = 2, CLOSE = 3, ATTR = 4
var ATTR_KEY = 5, ATTR_KEY_W = 6
var ATTR_VALUE_W = 7, ATTR_VALUE = 8
var ATTR_VALUE_SQ = 9, ATTR_VALUE_DQ = 10
var ATTR_EQ = 11, ATTR_BREAK = 12
var COMMENT = 13

module.exports = function (h, opts) {
  if (!opts) opts = {}
  var concat = opts.concat || function (a, b) {
    return String(a) + String(b)
  }
  if (opts.attrToProp !== false) {
    h = attrToProp(h)
  }

  return function (strings) {
    var state = TEXT, reg = ''
    var arglen = arguments.length
    var parts = []

    for (var i = 0; i < strings.length; i++) {
      if (i < arglen - 1) {
        var arg = arguments[i+1]
        var p = parse(strings[i])
        var xstate = state
        if (xstate === ATTR_VALUE_DQ) xstate = ATTR_VALUE
        if (xstate === ATTR_VALUE_SQ) xstate = ATTR_VALUE
        if (xstate === ATTR_VALUE_W) xstate = ATTR_VALUE
        if (xstate === ATTR) xstate = ATTR_KEY
        p.push([ VAR, xstate, arg ])
        parts.push.apply(parts, p)
      } else parts.push.apply(parts, parse(strings[i]))
    }

    var tree = [null,{},[]]
    var stack = [[tree,-1]]
    for (var i = 0; i < parts.length; i++) {
      var cur = stack[stack.length-1][0]
      var p = parts[i], s = p[0]
      if (s === OPEN && /^\//.test(p[1])) {
        var ix = stack[stack.length-1][1]
        if (stack.length > 1) {
          stack.pop()
          stack[stack.length-1][0][2][ix] = h(
            cur[0], cur[1], cur[2].length ? cur[2] : undefined
          )
        }
      } else if (s === OPEN) {
        var c = [p[1],{},[]]
        cur[2].push(c)
        stack.push([c,cur[2].length-1])
      } else if (s === ATTR_KEY || (s === VAR && p[1] === ATTR_KEY)) {
        var key = ''
        var copyKey
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_KEY) {
            key = concat(key, parts[i][1])
          } else if (parts[i][0] === VAR && parts[i][1] === ATTR_KEY) {
            if (typeof parts[i][2] === 'object' && !key) {
              for (copyKey in parts[i][2]) {
                if (parts[i][2].hasOwnProperty(copyKey) && !cur[1][copyKey]) {
                  cur[1][copyKey] = parts[i][2][copyKey]
                }
              }
            } else {
              key = concat(key, parts[i][2])
            }
          } else break
        }
        if (parts[i][0] === ATTR_EQ) i++
        var j = i
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_VALUE || parts[i][0] === ATTR_KEY) {
            if (!cur[1][key]) cur[1][key] = strfn(parts[i][1])
            else cur[1][key] = concat(cur[1][key], parts[i][1])
          } else if (parts[i][0] === VAR
          && (parts[i][1] === ATTR_VALUE || parts[i][1] === ATTR_KEY)) {
            if (!cur[1][key]) cur[1][key] = strfn(parts[i][2])
            else cur[1][key] = concat(cur[1][key], parts[i][2])
          } else {
            if (key.length && !cur[1][key] && i === j
            && (parts[i][0] === CLOSE || parts[i][0] === ATTR_BREAK)) {
              // https://html.spec.whatwg.org/multipage/infrastructure.html#boolean-attributes
              // empty string is falsy, not well behaved value in browser
              cur[1][key] = key.toLowerCase()
            }
            break
          }
        }
      } else if (s === ATTR_KEY) {
        cur[1][p[1]] = true
      } else if (s === VAR && p[1] === ATTR_KEY) {
        cur[1][p[2]] = true
      } else if (s === CLOSE) {
        if (selfClosing(cur[0]) && stack.length) {
          var ix = stack[stack.length-1][1]
          stack.pop()
          stack[stack.length-1][0][2][ix] = h(
            cur[0], cur[1], cur[2].length ? cur[2] : undefined
          )
        }
      } else if (s === VAR && p[1] === TEXT) {
        if (p[2] === undefined || p[2] === null) p[2] = ''
        else if (!p[2]) p[2] = concat('', p[2])
        if (Array.isArray(p[2][0])) {
          cur[2].push.apply(cur[2], p[2])
        } else {
          cur[2].push(p[2])
        }
      } else if (s === TEXT) {
        cur[2].push(p[1])
      } else if (s === ATTR_EQ || s === ATTR_BREAK) {
        // no-op
      } else {
        throw new Error('unhandled: ' + s)
      }
    }

    if (tree[2].length > 1 && /^\s*$/.test(tree[2][0])) {
      tree[2].shift()
    }

    if (tree[2].length > 2
    || (tree[2].length === 2 && /\S/.test(tree[2][1]))) {
      throw new Error(
        'multiple root elements must be wrapped in an enclosing tag'
      )
    }
    if (Array.isArray(tree[2][0]) && typeof tree[2][0][0] === 'string'
    && Array.isArray(tree[2][0][2])) {
      tree[2][0] = h(tree[2][0][0], tree[2][0][1], tree[2][0][2])
    }
    return tree[2][0]

    function parse (str) {
      var res = []
      if (state === ATTR_VALUE_W) state = ATTR
      for (var i = 0; i < str.length; i++) {
        var c = str.charAt(i)
        if (state === TEXT && c === '<') {
          if (reg.length) res.push([TEXT, reg])
          reg = ''
          state = OPEN
        } else if (c === '>' && !quot(state) && state !== COMMENT) {
          if (state === OPEN) {
            res.push([OPEN,reg])
          } else if (state === ATTR_KEY) {
            res.push([ATTR_KEY,reg])
          } else if (state === ATTR_VALUE && reg.length) {
            res.push([ATTR_VALUE,reg])
          }
          res.push([CLOSE])
          reg = ''
          state = TEXT
        } else if (state === COMMENT && /-$/.test(reg) && c === '-') {
          if (opts.comments) {
            res.push([ATTR_VALUE,reg.substr(0, reg.length - 1)],[CLOSE])
          }
          reg = ''
          state = TEXT
        } else if (state === OPEN && /^!--$/.test(reg)) {
          if (opts.comments) {
            res.push([OPEN, reg],[ATTR_KEY,'comment'],[ATTR_EQ])
          }
          reg = c
          state = COMMENT
        } else if (state === TEXT || state === COMMENT) {
          reg += c
        } else if (state === OPEN && /\s/.test(c)) {
          res.push([OPEN, reg])
          reg = ''
          state = ATTR
        } else if (state === OPEN) {
          reg += c
        } else if (state === ATTR && /[^\s"'=/]/.test(c)) {
          state = ATTR_KEY
          reg = c
        } else if (state === ATTR && /\s/.test(c)) {
          if (reg.length) res.push([ATTR_KEY,reg])
          res.push([ATTR_BREAK])
        } else if (state === ATTR_KEY && /\s/.test(c)) {
          res.push([ATTR_KEY,reg])
          reg = ''
          state = ATTR_KEY_W
        } else if (state === ATTR_KEY && c === '=') {
          res.push([ATTR_KEY,reg],[ATTR_EQ])
          reg = ''
          state = ATTR_VALUE_W
        } else if (state === ATTR_KEY) {
          reg += c
        } else if ((state === ATTR_KEY_W || state === ATTR) && c === '=') {
          res.push([ATTR_EQ])
          state = ATTR_VALUE_W
        } else if ((state === ATTR_KEY_W || state === ATTR) && !/\s/.test(c)) {
          res.push([ATTR_BREAK])
          if (/[\w-]/.test(c)) {
            reg += c
            state = ATTR_KEY
          } else state = ATTR
        } else if (state === ATTR_VALUE_W && c === '"') {
          state = ATTR_VALUE_DQ
        } else if (state === ATTR_VALUE_W && c === "'") {
          state = ATTR_VALUE_SQ
        } else if (state === ATTR_VALUE_DQ && c === '"') {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE_SQ && c === "'") {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE_W && !/\s/.test(c)) {
          state = ATTR_VALUE
          i--
        } else if (state === ATTR_VALUE && /\s/.test(c)) {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE || state === ATTR_VALUE_SQ
        || state === ATTR_VALUE_DQ) {
          reg += c
        }
      }
      if (state === TEXT && reg.length) {
        res.push([TEXT,reg])
        reg = ''
      } else if (state === ATTR_VALUE && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_VALUE_DQ && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_VALUE_SQ && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_KEY) {
        res.push([ATTR_KEY,reg])
        reg = ''
      }
      return res
    }
  }

  function strfn (x) {
    if (typeof x === 'function') return x
    else if (typeof x === 'string') return x
    else if (x && typeof x === 'object') return x
    else return concat('', x)
  }
}

function quot (state) {
  return state === ATTR_VALUE_SQ || state === ATTR_VALUE_DQ
}

var hasOwn = Object.prototype.hasOwnProperty
function has (obj, key) { return hasOwn.call(obj, key) }

var closeRE = RegExp('^(' + [
  'area', 'base', 'basefont', 'bgsound', 'br', 'col', 'command', 'embed',
  'frame', 'hr', 'img', 'input', 'isindex', 'keygen', 'link', 'meta', 'param',
  'source', 'track', 'wbr', '!--',
  // SVG TAGS
  'animate', 'animateTransform', 'circle', 'cursor', 'desc', 'ellipse',
  'feBlend', 'feColorMatrix', 'feComposite',
  'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap',
  'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR',
  'feGaussianBlur', 'feImage', 'feMergeNode', 'feMorphology',
  'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile',
  'feTurbulence', 'font-face-format', 'font-face-name', 'font-face-uri',
  'glyph', 'glyphRef', 'hkern', 'image', 'line', 'missing-glyph', 'mpath',
  'path', 'polygon', 'polyline', 'rect', 'set', 'stop', 'tref', 'use', 'view',
  'vkern'
].join('|') + ')(?:[\.#][a-zA-Z0-9\u007F-\uFFFF_:-]+)*$')
function selfClosing (tag) { return closeRE.test(tag) }

},{"hyperscript-attribute-to-property":35}],37:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],38:[function(require,module,exports){
module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};

},{}],39:[function(require,module,exports){
var nanotiming = require('nanotiming')
var assert = require('assert')

module.exports = Nanobus

function Nanobus (name) {
  if (!(this instanceof Nanobus)) return new Nanobus(name)

  this._name = name || 'nanobus'
  this._starListeners = []
  this._listeners = {}

  this._timing = nanotiming(this._name)
}

Nanobus.prototype.emit = function (eventName, data) {
  assert.equal(typeof eventName, 'string', 'nanobus.emit: eventName should be type string')

  this._timing.start(eventName)
  var listeners = this._listeners[eventName]
  if (listeners && listeners.length > 0) {
    this._emit(this._listeners[eventName], data)
  }

  if (this._starListeners.length > 0) {
    this._emit(this._starListeners, eventName, data)
  }
  this._timing.end(eventName)

  return this
}

Nanobus.prototype.on = Nanobus.prototype.addListener = function (eventName, listener) {
  assert.equal(typeof eventName, 'string', 'nanobus.on: eventName should be type string')
  assert.equal(typeof listener, 'function', 'nanobus.on: listener should be type function')

  if (eventName === '*') {
    this._starListeners.push(listener)
  } else {
    if (!this._listeners[eventName]) this._listeners[eventName] = []
    this._listeners[eventName].push(listener)
  }
  return this
}

Nanobus.prototype.prependListener = function (eventName, listener) {
  assert.equal(typeof eventName, 'string', 'nanobus.prependListener: eventName should be type string')
  assert.equal(typeof listener, 'function', 'nanobus.prependListener: listener should be type function')

  if (eventName === '*') {
    this._starListeners.unshift(listener)
  } else {
    if (!this._listeners[eventName]) this._listeners[eventName] = []
    this._listeners[eventName].unshift(listener)
  }
  return this
}

Nanobus.prototype.once = function (eventName, listener) {
  assert.equal(typeof eventName, 'string', 'nanobus.once: eventName should be type string')
  assert.equal(typeof listener, 'function', 'nanobus.once: listener should be type function')

  var self = this
  this.on(eventName, once)
  function once () {
    listener.apply(self, arguments)
    self.removeListener(eventName, once)
  }
  return this
}

Nanobus.prototype.prependOnceListener = function (eventName, listener) {
  assert.equal(typeof eventName, 'string', 'nanobus.prependOnceListener: eventName should be type string')
  assert.equal(typeof listener, 'function', 'nanobus.prependOnceListener: listener should be type function')

  var self = this
  this.prependListener(eventName, once)
  function once () {
    listener.apply(self, arguments)
    self.removeListener(eventName, once)
  }
  return this
}

Nanobus.prototype.removeListener = function (eventName, listener) {
  assert.equal(typeof eventName, 'string', 'nanobus.removeListener: eventName should be type string')
  assert.equal(typeof listener, 'function', 'nanobus.removeListener: listener should be type function')

  if (eventName === '*') {
    this._starListeners = this._starListeners.slice()
    return remove(this._starListeners, listener)
  } else {
    if (typeof this._listeners[eventName] !== 'undefined') {
      this._listeners[eventName] = this._listeners[eventName].slice()
    }

    return remove(this._listeners[eventName], listener)
  }

  function remove (arr, listener) {
    if (!arr) return
    var index = arr.indexOf(listener)
    if (index !== -1) {
      arr.splice(index, 1)
      return true
    }
  }
}

Nanobus.prototype.removeAllListeners = function (eventName) {
  if (eventName) {
    if (eventName === '*') {
      this._starListeners = []
    } else {
      this._listeners[eventName] = []
    }
  } else {
    this._starListeners = []
    this._listeners = {}
  }
  return this
}

Nanobus.prototype.listeners = function (eventName) {
  var listeners = (eventName !== '*') ? this._listeners[eventName] : this._starListeners
  var ret = []
  if (listeners) {
    var ilength = listeners.length
    for (var i = 0; i < ilength; i++) ret.push(listeners[i])
  }
  return ret
}

Nanobus.prototype._emit = function (arr, eventName, data) {
  if (typeof arr === 'undefined') return
  if (!data) {
    data = eventName
    eventName = null
  }
  var length = arr.length
  for (var i = 0; i < length; i++) {
    var listener = arr[i]
    if (eventName) listener(eventName, data)
    else listener(data)
  }
}

},{"assert":1,"nanotiming":48}],40:[function(require,module,exports){
var assert = require('assert')

module.exports = history

// listen to html5 pushstate events
// and update router accordingly
function history (cb) {
  assert.equal(typeof cb, 'function', 'nanohistory: cb must be type function')
  window.onpopstate = function () {
    cb(document.location)
  }
}

},{"assert":1}],41:[function(require,module,exports){
var assert = require('assert')

module.exports = href

var noRoutingAttrName = 'data-no-routing'

// handle a click if is anchor tag with an href
// and url lives on the same domain. Replaces
// trailing '#' so empty links work as expected.
// (fn(str), obj?) -> undefined
function href (cb, root) {
  assert.equal(typeof cb, 'function', 'nanohref: cb must be type function')
  root = root || window.document

  window.onclick = function (e) {
    if ((e.button && e.button !== 0) || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return

    var node = (function traverse (node) {
      if (!node || node === root) return
      if (node.localName !== 'a') return traverse(node.parentNode)
      if (node.href === undefined) return traverse(node.parentNode)
      if (window.location.host !== node.host) return traverse(node.parentNode)
      return node
    })(e.target)

    if (!node) return

    var isRoutingDisabled = node.hasAttribute(noRoutingAttrName)
    if (isRoutingDisabled) return

    e.preventDefault()
    cb(node)
  }
}

},{"assert":1}],42:[function(require,module,exports){
var assert = require('assert')
var morph = require('./lib/morph')
var rootLabelRegex = /^data-onloadid/

var ELEMENT_NODE = 1

module.exports = nanomorph

// morph one tree into another tree
// (obj, obj) -> obj
// no parent
//   -> same: diff and walk children
//   -> not same: replace and return
// old node doesn't exist
//   -> insert new node
// new node doesn't exist
//   -> delete old node
// nodes are not the same
//   -> diff nodes and apply patch to old node
// nodes are the same
//   -> walk all child nodes and append to old node
function nanomorph (oldTree, newTree) {
  assert.equal(typeof oldTree, 'object', 'nanomorph: oldTree should be an object')
  assert.equal(typeof newTree, 'object', 'nanomorph: newTree should be an object')

  persistStatefulRoot(newTree, oldTree)
  var tree = walk(newTree, oldTree)
  return tree
}

// walk and morph a dom tree
// (obj, obj) -> obj
function walk (newNode, oldNode) {
  if (!oldNode) {
    return newNode
  } else if (!newNode) {
    return null
  } else if (newNode.isSameNode && newNode.isSameNode(oldNode)) {
    return oldNode
  } else if (newNode.tagName !== oldNode.tagName) {
    return newNode
  } else {
    morph(newNode, oldNode)
    updateChildren(newNode, oldNode)
    return oldNode
  }
}

// update the children of elements
// (obj, obj) -> null
function updateChildren (newNode, oldNode) {
  if (!newNode.childNodes || !oldNode.childNodes) return

  var newLength = newNode.childNodes.length
  var oldLength = oldNode.childNodes.length
  var length = Math.max(oldLength, newLength)

  var iNew = 0
  var iOld = 0
  for (var i = 0; i < length; i++, iNew++, iOld++) {
    var newChildNode = newNode.childNodes[iNew]
    var oldChildNode = oldNode.childNodes[iOld]
    var retChildNode = walk(newChildNode, oldChildNode)
    if (!retChildNode) {
      if (oldChildNode) {
        oldNode.removeChild(oldChildNode)
        iOld--
      }
    } else if (!oldChildNode) {
      if (retChildNode) {
        oldNode.appendChild(retChildNode)
        iNew--
      }
    } else if (retChildNode !== oldChildNode) {
      oldNode.replaceChild(retChildNode, oldChildNode)
      iNew--
    }
  }
}

function persistStatefulRoot (newNode, oldNode) {
  if (!newNode || !oldNode || oldNode.nodeType !== ELEMENT_NODE || newNode.nodeType !== ELEMENT_NODE) return
  var oldAttrs = oldNode.attributes
  var attr, name
  for (var i = 0, len = oldAttrs.length; i < len; i++) {
    attr = oldAttrs[i]
    name = attr.name
    if (rootLabelRegex.test(name)) {
      newNode.setAttribute(name, attr.value)
      break
    }
  }
}

},{"./lib/morph":44,"assert":1}],43:[function(require,module,exports){
module.exports = [
  // attribute events (can be set with attributes)
  'onclick',
  'ondblclick',
  'onmousedown',
  'onmouseup',
  'onmouseover',
  'onmousemove',
  'onmouseout',
  'onmouseenter',
  'onmouseleave',
  'ondragstart',
  'ondrag',
  'ondragenter',
  'ondragleave',
  'ondragover',
  'ondrop',
  'ondragend',
  'onkeydown',
  'onkeypress',
  'onkeyup',
  'onunload',
  'onabort',
  'onerror',
  'onresize',
  'onscroll',
  'onselect',
  'onchange',
  'onsubmit',
  'onreset',
  'onfocus',
  'onblur',
  'oninput',
  // other common events
  'oncontextmenu',
  'onfocusin',
  'onfocusout'
]

},{}],44:[function(require,module,exports){
var events = require('./events')
var eventsLength = events.length

var ELEMENT_NODE = 1
var TEXT_NODE = 3
var COMMENT_NODE = 8

module.exports = morph

// diff elements and apply the resulting patch to the old node
// (obj, obj) -> null
function morph (newNode, oldNode) {
  var nodeType = newNode.nodeType
  var nodeName = newNode.nodeName

  if (nodeType === ELEMENT_NODE) {
    copyAttrs(newNode, oldNode)
  }

  if (nodeType === TEXT_NODE || nodeType === COMMENT_NODE) {
    oldNode.nodeValue = newNode.nodeValue
  }

  // Some DOM nodes are weird
  // https://github.com/patrick-steele-idem/morphdom/blob/master/src/specialElHandlers.js
  if (nodeName === 'INPUT') updateInput(newNode, oldNode)
  else if (nodeName === 'OPTION') updateOption(newNode, oldNode)
  else if (nodeName === 'TEXTAREA') updateTextarea(newNode, oldNode)
  else if (nodeName === 'SELECT') updateSelect(newNode, oldNode)

  copyEvents(newNode, oldNode)
}

function copyAttrs (newNode, oldNode) {
  var oldAttrs = oldNode.attributes
  var newAttrs = newNode.attributes
  var attrNamespaceURI = null
  var attrValue = null
  var fromValue = null
  var attrName = null
  var attr = null

  for (var i = newAttrs.length - 1; i >= 0; --i) {
    attr = newAttrs[i]
    attrName = attr.name
    attrNamespaceURI = attr.namespaceURI
    attrValue = attr.value

    if (attrNamespaceURI) {
      attrName = attr.localName || attrName
      fromValue = oldNode.getAttributeNS(attrNamespaceURI, attrName)

      if (fromValue !== attrValue) {
        oldNode.setAttributeNS(attrNamespaceURI, attrName, attrValue)
      }
    } else {
      fromValue = oldNode.getAttribute(attrName)

      if (fromValue !== attrValue) {
        // apparently values are always cast to strings, ah well
        if (attrValue === 'null' || attrValue === 'undefined') {
          oldNode.removeAttribute(attrName)
        } else {
          oldNode.setAttribute(attrName, attrValue)
        }
      }
    }
  }

  // Remove any extra attributes found on the original DOM element that
  // weren't found on the target element.
  for (var j = oldAttrs.length - 1; j >= 0; --j) {
    attr = oldAttrs[j]
    if (attr.specified !== false) {
      attrName = attr.name
      attrNamespaceURI = attr.namespaceURI

      if (attrNamespaceURI) {
        attrName = attr.localName || attrName
        if (!newNode.hasAttributeNS(attrNamespaceURI, attrName)) {
          oldNode.removeAttributeNS(attrNamespaceURI, attrName)
        }
      } else {
        if (!newNode.hasAttributeNS(null, attrName)) {
          oldNode.removeAttribute(attrName)
        }
      }
    }
  }
}

function copyEvents (newNode, oldNode) {
  for (var i = 0; i < eventsLength; i++) {
    var ev = events[i]
    if (newNode[ev]) {           // if new element has a whitelisted attribute
      oldNode[ev] = newNode[ev]  // update existing element
    } else if (oldNode[ev]) {    // if existing element has it and new one doesnt
      oldNode[ev] = undefined    // remove it from existing element
    }
  }
}

function updateOption (newNode, oldNode) {
  updateAttribute(newNode, oldNode, 'selected')
}

// The "value" attribute is special for the <input> element since it sets the
// initial value. Changing the "value" attribute without changing the "value"
// property will have no effect since it is only used to the set the initial
// value. Similar for the "checked" attribute, and "disabled".
function updateInput (newNode, oldNode) {
  var newValue = newNode.value
  var oldValue = oldNode.value

  updateAttribute(newNode, oldNode, 'checked')
  updateAttribute(newNode, oldNode, 'disabled')

  if (!newNode.hasAttributeNS(null, 'value') || newValue === 'null') {
    oldNode.value = ''
    oldNode.removeAttribute('value')
  } else if (newValue !== oldValue) {
    oldNode.setAttribute('value', newValue)
    oldNode.value = newValue
  } else if (oldNode.type === 'range') {
    // this is so elements like slider move their UI thingy
    oldNode.value = newValue
  }
}

function updateTextarea (newNode, oldNode) {
  var newValue = newNode.value
  if (newValue !== oldNode.value) {
    oldNode.value = newValue
  }

  if (oldNode.firstChild) {
    // Needed for IE. Apparently IE sets the placeholder as the
    // node value and vise versa. This ignores an empty update.
    if (newValue === '' && oldNode.firstChild.nodeValue === oldNode.placeholder) {
      return
    }

    oldNode.firstChild.nodeValue = newValue
  }
}

function updateSelect (newNode, oldNode) {
  if (!oldNode.hasAttributeNS(null, 'multiple')) {
    var i = 0
    var curChild = oldNode.firstChild
    while (curChild) {
      var nodeName = curChild.nodeName
      if (nodeName && nodeName.toUpperCase() === 'OPTION') {
        if (curChild.hasAttributeNS(null, 'selected')) break
        i++
      }
      curChild = curChild.nextSibling
    }

    newNode.selectedIndex = i
  }
}

function updateAttribute (newNode, oldNode, name) {
  if (newNode[name] !== oldNode[name]) {
    oldNode[name] = newNode[name]
    if (newNode[name]) {
      oldNode.setAttribute(name, '')
    } else {
      oldNode.removeAttribute(name, '')
    }
  }
}

},{"./events":43}],45:[function(require,module,exports){
var nanomorph = require('nanomorph')
var assert = require('assert')

module.exports = nanomount

function nanomount (target, newTree) {
  if (target.nodeName === 'BODY') {
    var children = target.childNodes
    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeName === 'SCRIPT') {
        newTree.appendChild(children[i].cloneNode(true))
      }
    }
  }

  var tree = nanomorph(target, newTree)
  assert.equal(tree, target, 'nanomount: The target node ' +
    tree.outerHTML.nodeName + ' is not the same type as the new node ' +
    target.outerHTML.nodeName + '.')
}

},{"assert":1,"nanomorph":42}],46:[function(require,module,exports){
'use strict'

var assert = require('assert')

module.exports = nanoraf

// Only call RAF when needed
// (fn, fn?) -> fn
function nanoraf (render, raf) {
  assert.equal(typeof render, 'function', 'nanoraf: render should be a function')
  assert.ok(typeof raf === 'function' || typeof raf === 'undefined', 'nanoraf: raf should be a function or undefined')

  if (!raf) raf = window.requestAnimationFrame
  var redrawScheduled = false
  var args = null

  return function frame () {
    if (args === null && !redrawScheduled) {
      redrawScheduled = true

      raf(function redraw () {
        redrawScheduled = false

        var length = args.length
        var _args = new Array(length)
        for (var i = 0; i < length; i++) _args[i] = args[i]

        render.apply(render, _args)
        args = null
      })
    }

    args = arguments
  }
}

},{"assert":1}],47:[function(require,module,exports){
var wayfarer = require('wayfarer')

var isLocalFile = (/file:\/\//.test(typeof window === 'object' &&
  window.location && window.location.origin)) // electron support

/* eslint-disable no-useless-escape */
var electron = '^(file:\/\/|\/)(.*\.html?\/?)?'
var protocol = '^(http(s)?(:\/\/))?(www\.)?'
var domain = '[a-zA-Z0-9-_\.]+(:[0-9]{1,5})?(\/{1})?'
var qs = '[\?].*$'
/* eslint-enable no-useless-escape */

var stripElectron = new RegExp(electron)
var prefix = new RegExp(protocol + domain)
var normalize = new RegExp('#')
var suffix = new RegExp(qs)

module.exports = Nanorouter

function Nanorouter (opts) {
  opts = opts || {}

  var router = wayfarer(opts.default || '/404')
  var curry = opts.curry || false
  var prevCallback = null
  var prevRoute = null

  emit.router = router
  emit.on = on
  return emit

  function on (routename, listener) {
    routename = routename.replace(/^[#/]/, '')
    router.on(routename, listener)
  }

  function emit (route) {
    if (!curry) {
      return router(route)
    } else {
      route = pathname(route, isLocalFile)
      if (route === prevRoute) {
        return prevCallback()
      } else {
        prevRoute = route
        prevCallback = router(route)
        return prevCallback()
      }
    }
  }
}

// replace everything in a route but the pathname and hash
function pathname (route, isElectron) {
  if (isElectron) route = route.replace(stripElectron, '')
  else route = route.replace(prefix, '')
  return route.replace(suffix, '').replace(normalize, '/')
}

},{"wayfarer":56}],48:[function(require,module,exports){
var assert = require('assert')

module.exports = Nanotiming

function Nanotiming (name) {
  if (!(this instanceof Nanotiming)) return new Nanotiming(name)
  assert.equal(typeof name, 'string', 'Nanotiming: name should be type string')
  this._name = name
  this._enabled = typeof window !== 'undefined' &&
    window.performance && window.performance.mark
}

Nanotiming.prototype.start = function (partial) {
  if (!this._enabled) return
  var name = partial ? this._name + ':' + partial : this._name
  window.performance.mark(name + '-start')
}

Nanotiming.prototype.end = function (partial) {
  if (!this._enabled) return
  var name = partial ? this._name + ':' + partial : this._name
  window.performance.mark(name + '-end')
  window.performance.measure(name, name + '-start', name + '-end')
}

},{"assert":1}],49:[function(require,module,exports){
/* global MutationObserver */
var document = require('global/document')
var window = require('global/window')
var watch = Object.create(null)
var KEY_ID = 'onloadid' + (new Date() % 9e6).toString(36)
var KEY_ATTR = 'data-' + KEY_ID
var INDEX = 0

if (window && window.MutationObserver) {
  var observer = new MutationObserver(function (mutations) {
    if (Object.keys(watch).length < 1) return
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === KEY_ATTR) {
        eachAttr(mutations[i], turnon, turnoff)
        continue
      }
      eachMutation(mutations[i].removedNodes, turnoff)
      eachMutation(mutations[i].addedNodes, turnon)
    }
  })
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: [KEY_ATTR]
  })
}

module.exports = function onload (el, on, off, caller) {
  on = on || function () {}
  off = off || function () {}
  el.setAttribute(KEY_ATTR, 'o' + INDEX)
  watch['o' + INDEX] = [on, off, 0, caller || onload.caller]
  INDEX += 1
  return el
}

function turnon (index, el) {
  if (watch[index][0] && watch[index][2] === 0) {
    watch[index][0](el)
    watch[index][2] = 1
  }
}

function turnoff (index, el) {
  if (watch[index][1] && watch[index][2] === 1) {
    watch[index][1](el)
    watch[index][2] = 0
  }
}

function eachAttr (mutation, on, off) {
  var newValue = mutation.target.getAttribute(KEY_ATTR)
  if (sameOrigin(mutation.oldValue, newValue)) {
    watch[newValue] = watch[mutation.oldValue]
    return
  }
  if (watch[mutation.oldValue]) {
    off(mutation.oldValue, mutation.target)
  }
  if (watch[newValue]) {
    on(newValue, mutation.target)
  }
}

function sameOrigin (oldValue, newValue) {
  if (!oldValue || !newValue) return false
  return watch[oldValue][3] === watch[newValue][3]
}

function eachMutation (nodes, fn) {
  var keys = Object.keys(watch)
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i] && nodes[i].getAttribute && nodes[i].getAttribute(KEY_ATTR)) {
      var onloadid = nodes[i].getAttribute(KEY_ATTR)
      keys.forEach(function (k) {
        if (onloadid === k) {
          fn(k, nodes[i])
        }
      })
    }
    if (nodes[i].childNodes.length > 0) {
      eachMutation(nodes[i].childNodes, fn)
    }
  }
}

},{"global/document":24,"global/window":25}],50:[function(require,module,exports){
var trim = require('trim')
  , forEach = require('for-each')
  , isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }

module.exports = function (headers) {
  if (!headers)
    return {}

  var result = {}

  forEach(
      trim(headers).split('\n')
    , function (row) {
        var index = row.indexOf(':')
          , key = trim(row.slice(0, index)).toLowerCase()
          , value = trim(row.slice(index + 1))

        if (typeof(result[key]) === 'undefined') {
          result[key] = value
        } else if (isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [ result[key], value ]
        }
      }
  )

  return result
}
},{"for-each":23,"trim":52}],51:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],52:[function(require,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}],53:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"dup":37}],54:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],55:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":54,"_process":51,"inherits":53}],56:[function(require,module,exports){
var assert = require('assert')
var trie = require('./trie')

module.exports = Wayfarer

// create a router
// str -> obj
function Wayfarer (dft) {
  if (!(this instanceof Wayfarer)) return new Wayfarer(dft)

  var _default = (dft || '').replace(/^\//, '')
  var _trie = trie()

  emit._trie = _trie
  emit.emit = emit
  emit.on = on
  emit._wayfarer = true

  return emit

  // define a route
  // (str, fn) -> obj
  function on (route, cb) {
    assert.equal(typeof route, 'string')
    assert.equal(typeof cb, 'function')

    route = route || '/'
    cb.route = route

    if (cb && cb._wayfarer && cb._trie) {
      _trie.mount(route, cb._trie.trie)
    } else {
      var node = _trie.create(route)
      node.cb = cb
    }

    return emit
  }

  // match and call a route
  // (str, obj?) -> null
  function emit (route) {
    assert.notEqual(route, undefined, "'route' must be defined")
    var args = new Array(arguments.length)
    for (var i = 1; i < args.length; i++) {
      args[i] = arguments[i]
    }

    var node = _trie.match(route)
    if (node && node.cb) {
      args[0] = node.params
      var cb = node.cb
      return cb.apply(cb, args)
    }

    var dft = _trie.match(_default)
    if (dft && dft.cb) {
      args[0] = dft.params
      var dftcb = dft.cb
      return dftcb.apply(dftcb, args)
    }

    throw new Error("route '" + route + "' did not match")
  }
}

},{"./trie":57,"assert":1}],57:[function(require,module,exports){
var mutate = require('xtend/mutable')
var assert = require('assert')
var xtend = require('xtend')

module.exports = Trie

// create a new trie
// null -> obj
function Trie () {
  if (!(this instanceof Trie)) return new Trie()
  this.trie = { nodes: {} }
}

// create a node on the trie at route
// and return a node
// str -> null
Trie.prototype.create = function (route) {
  assert.equal(typeof route, 'string', 'route should be a string')
  // strip leading '/' and split routes
  var routes = route.replace(/^\//, '').split('/')

  function createNode (index, trie) {
    var thisRoute = (routes.hasOwnProperty(index) && routes[index])
    if (thisRoute === false) return trie

    var node = null
    if (/^:|^\*/.test(thisRoute)) {
      // if node is a name match, set name and append to ':' node
      if (!trie.nodes.hasOwnProperty('$$')) {
        node = { nodes: {} }
        trie.nodes['$$'] = node
      } else {
        node = trie.nodes['$$']
      }

      if (thisRoute[0] === '*') {
        trie.wildcard = true
      }

      trie.name = thisRoute.replace(/^:|^\*/, '')
    } else if (!trie.nodes.hasOwnProperty(thisRoute)) {
      node = { nodes: {} }
      trie.nodes[thisRoute] = node
    } else {
      node = trie.nodes[thisRoute]
    }

    // we must recurse deeper
    return createNode(index + 1, node)
  }

  return createNode(0, this.trie)
}

// match a route on the trie
// and return the node
// str -> obj
Trie.prototype.match = function (route) {
  assert.equal(typeof route, 'string', 'route should be a string')

  var routes = route.replace(/^\//, '').split('/')
  var params = {}

  function search (index, trie) {
    // either there's no match, or we're done searching
    if (trie === undefined) return undefined
    var thisRoute = routes[index]
    if (thisRoute === undefined) return trie

    if (trie.nodes.hasOwnProperty(thisRoute)) {
      // match regular routes first
      return search(index + 1, trie.nodes[thisRoute])
    } else if (trie.wildcard) {
      // match wildcards
      try {
        params['wildcard'] = decodeURIComponent(routes.slice(index).join('/'))
      } catch (e) {
        return search(index, undefined)
      }
      // return early, or else search may keep recursing through the wildcard
      return trie.nodes['$$']
    } else if (trie.name) {
      // match named routes
      try {
        params[trie.name] = decodeURIComponent(thisRoute)
      } catch (e) {
        console.log('must throw')
        return search(index, undefined)
      }
      return search(index + 1, trie.nodes['$$'])
    } else {
      // no matches found
      return search(index + 1)
    }
  }

  var node = search(0, this.trie)

  if (!node) return undefined
  node = xtend(node)
  node.params = params
  return node
}

// mount a trie onto a node at route
// (str, obj) -> null
Trie.prototype.mount = function (route, trie) {
  assert.equal(typeof route, 'string', 'route should be a string')
  assert.equal(typeof trie, 'object', 'trie should be a object')

  var split = route.replace(/^\//, '').split('/')
  var node = null
  var key = null

  if (split.length === 1) {
    key = split[0]
    node = this.create(key)
  } else {
    var headArr = split.splice(0, split.length - 1)
    var head = headArr.join('/')
    key = split[0]
    node = this.create(head)
  }

  mutate(node.nodes, trie.nodes)
  if (trie.name) node.name = trie.name

  // delegate properties from '/' to the new node
  // '/' cannot be reached once mounted
  if (node.nodes['']) {
    Object.keys(node.nodes['']).forEach(function (key) {
      if (key === 'nodes') return
      node[key] = node.nodes[''][key]
    })
    mutate(node.nodes, node.nodes[''].nodes)
    delete node.nodes[''].nodes
  }
}

},{"assert":1,"xtend":59,"xtend/mutable":60}],58:[function(require,module,exports){
"use strict";
var window = require("global/window")
var isFunction = require("is-function")
var parseHeaders = require("parse-headers")
var xtend = require("xtend")

module.exports = createXHR
createXHR.XMLHttpRequest = window.XMLHttpRequest || noop
createXHR.XDomainRequest = "withCredentials" in (new createXHR.XMLHttpRequest()) ? createXHR.XMLHttpRequest : window.XDomainRequest

forEachArray(["get", "put", "post", "patch", "head", "delete"], function(method) {
    createXHR[method === "delete" ? "del" : method] = function(uri, options, callback) {
        options = initParams(uri, options, callback)
        options.method = method.toUpperCase()
        return _createXHR(options)
    }
})

function forEachArray(array, iterator) {
    for (var i = 0; i < array.length; i++) {
        iterator(array[i])
    }
}

function isEmpty(obj){
    for(var i in obj){
        if(obj.hasOwnProperty(i)) return false
    }
    return true
}

function initParams(uri, options, callback) {
    var params = uri

    if (isFunction(options)) {
        callback = options
        if (typeof uri === "string") {
            params = {uri:uri}
        }
    } else {
        params = xtend(options, {uri: uri})
    }

    params.callback = callback
    return params
}

function createXHR(uri, options, callback) {
    options = initParams(uri, options, callback)
    return _createXHR(options)
}

function _createXHR(options) {
    if(typeof options.callback === "undefined"){
        throw new Error("callback argument missing")
    }

    var called = false
    var callback = function cbOnce(err, response, body){
        if(!called){
            called = true
            options.callback(err, response, body)
        }
    }

    function readystatechange() {
        if (xhr.readyState === 4) {
            setTimeout(loadFunc, 0)
        }
    }

    function getBody() {
        // Chrome with requestType=blob throws errors arround when even testing access to responseText
        var body = undefined

        if (xhr.response) {
            body = xhr.response
        } else {
            body = xhr.responseText || getXml(xhr)
        }

        if (isJson) {
            try {
                body = JSON.parse(body)
            } catch (e) {}
        }

        return body
    }

    function errorFunc(evt) {
        clearTimeout(timeoutTimer)
        if(!(evt instanceof Error)){
            evt = new Error("" + (evt || "Unknown XMLHttpRequest Error") )
        }
        evt.statusCode = 0
        return callback(evt, failureResponse)
    }

    // will load the data & process the response in a special response object
    function loadFunc() {
        if (aborted) return
        var status
        clearTimeout(timeoutTimer)
        if(options.useXDR && xhr.status===undefined) {
            //IE8 CORS GET successful response doesn't have a status field, but body is fine
            status = 200
        } else {
            status = (xhr.status === 1223 ? 204 : xhr.status)
        }
        var response = failureResponse
        var err = null

        if (status !== 0){
            response = {
                body: getBody(),
                statusCode: status,
                method: method,
                headers: {},
                url: uri,
                rawRequest: xhr
            }
            if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
                response.headers = parseHeaders(xhr.getAllResponseHeaders())
            }
        } else {
            err = new Error("Internal XMLHttpRequest Error")
        }
        return callback(err, response, response.body)
    }

    var xhr = options.xhr || null

    if (!xhr) {
        if (options.cors || options.useXDR) {
            xhr = new createXHR.XDomainRequest()
        }else{
            xhr = new createXHR.XMLHttpRequest()
        }
    }

    var key
    var aborted
    var uri = xhr.url = options.uri || options.url
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data
    var headers = xhr.headers = options.headers || {}
    var sync = !!options.sync
    var isJson = false
    var timeoutTimer
    var failureResponse = {
        body: undefined,
        headers: {},
        statusCode: 0,
        method: method,
        url: uri,
        rawRequest: xhr
    }

    if ("json" in options && options.json !== false) {
        isJson = true
        headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json") //Don't override existing accept header declared by user
        if (method !== "GET" && method !== "HEAD") {
            headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json") //Don't override existing accept header declared by user
            body = JSON.stringify(options.json === true ? body : options.json)
        }
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = loadFunc
    xhr.onerror = errorFunc
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    xhr.onabort = function(){
        aborted = true;
    }
    xhr.ontimeout = errorFunc
    xhr.open(method, uri, !sync, options.username, options.password)
    //has to be after open
    if(!sync) {
        xhr.withCredentials = !!options.withCredentials
    }
    // Cannot set timeout with sync request
    // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
    // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
    if (!sync && options.timeout > 0 ) {
        timeoutTimer = setTimeout(function(){
            if (aborted) return
            aborted = true//IE9 may still call readystatechange
            xhr.abort("timeout")
            var e = new Error("XMLHttpRequest timeout")
            e.code = "ETIMEDOUT"
            errorFunc(e)
        }, options.timeout )
    }

    if (xhr.setRequestHeader) {
        for(key in headers){
            if(headers.hasOwnProperty(key)){
                xhr.setRequestHeader(key, headers[key])
            }
        }
    } else if (options.headers && !isEmpty(options.headers)) {
        throw new Error("Headers cannot be set on an XDomainRequest object")
    }

    if ("responseType" in options) {
        xhr.responseType = options.responseType
    }

    if ("beforeSend" in options &&
        typeof options.beforeSend === "function"
    ) {
        options.beforeSend(xhr)
    }

    // Microsoft Edge browser sends "undefined" when send is called with undefined value.
    // XMLHttpRequest spec says to pass null as body to indicate no body
    // See https://github.com/naugtur/xhr/issues/100.
    xhr.send(body || null)

    return xhr


}

function getXml(xhr) {
    if (xhr.responseType === "document") {
        return xhr.responseXML
    }
    var firefoxBugTakenEffect = xhr.responseXML && xhr.responseXML.documentElement.nodeName === "parsererror"
    if (xhr.responseType === "" && !firefoxBugTakenEffect) {
        return xhr.responseXML
    }

    return null
}

function noop() {}

},{"global/window":25,"is-function":38,"parse-headers":50,"xtend":59}],59:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],60:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],61:[function(require,module,exports){
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

// css
require('../node_modules/bulma/css/bulma.css')
require('./moose-style.css')

var choo = require('choo'),
    root = require('./view/root.js'),
    gallery = require('./view/gallery.js'),
    rootState = require('./use/root-use.js'),
    galleryState = require('./use/gallery-use.js'),
    app = choo()

app.use(rootState)
app.use(galleryState)

app.route('/', root)
app.route('/gallery', gallery)

document.body.appendChild(app.start())

},{"../node_modules/bulma/css/bulma.css":16,"./moose-style.css":65,"./use/gallery-use.js":66,"./use/root-use.js":67,"./view/gallery.js":68,"./view/root.js":69,"choo":18}],62:[function(require,module,exports){
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

var http = require('xhr')

function request(req, cb) {
    http(req, (err, res, body) => {
        try {
            body = JSON.parse(body)
        }
        catch (e) {
            return cb(e, null)
        }
        cb(err, body)
    })
}

module.exports = request
module.exports.saveMoose = function(moose, cb) {
    request({
        uri: 'new',
        method: 'put',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(moose),
    }, cb)
}
module.exports.getMoose = function(moose, cb) {
    request({ uri: `moose/${moose}` }, cb)
}
module.exports.getGalleryPage = function(age, query, page, cb) {
    request({
        uri: `gallery/${age}?q=${query}&p=${page}`,
    }, cb)
}

},{"xhr":58}],63:[function(require,module,exports){
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

var colorToMooseString = [
    't',
    '0', '1', '2', '3', 
    '4', '5', '6', '7',
    '8', '9', 'a', 'b',
    'c', 'd', 'e', 'f',
]

module.exports.mooseToGrid = function mooseToGrid(image) {
    return image.split('\n').map(str => {
        return str.split('').map(char => {
            return colorToMooseString.indexOf(char)
        })
    })
}

module.exports.gridToMoose = function(painting) {
    return painting.map(arr => {
        return arr.map(char => {
            return colorToMooseString[char]
        }).join('')
    }).join('\n')
}

},{}],64:[function(require,module,exports){
module.exports = {
    normal: {
        width: 26,
        height: 15,
    },
    hd: {
        width: 36,
        height: 22,
    },
    isHd: true,
}

},{}],65:[function(require,module,exports){
var css = "body {\n  background-color: #eee;\n}\n.moose-button {\n  margin-top: 5px;\n  margin-right: 5px;\n}\n.moose-palette {\n  background-color: #f0f0f0;\n  padding: 10px;\n}\n.moose-palette-color {\n  width: 35px;\n  height: 35px;\n  margin-right: 5px;\n  border-style: none;\n  border-radius: 5px;\n}\n.moose-palette-color-selected {\n  border-width: 3px;\n  border-color: black;\n  border-style: dashed;\n}\n"; (require("browserify-css").createStyle(css, { "href": "public/moose-style.css" }, { "insertAt": "bottom" })); module.exports = css;
},{"browserify-css":14}],66:[function(require,module,exports){
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

var galleryPageSize = 12

var getGalleryPage = require('../lib/api.js').getGalleryPage,
    GridPaint = require('gridpaint'),
    mooseToGrid = require('../lib/moose-grid.js').mooseToGrid,
    each = require('async.each'),
    sizeInfo = require('../lib/moose-size.js')

// generates data urls from moose
function generateGalleryMoose(image, isHd, cb) {
    var painter = new GridPaint({
        width: 
            isHd ? 
            sizeInfo.hd.width :
            sizeInfo.normal.width, 
        height: 
            isHd ?
            sizeInfo.hd.height :
            sizeInfo.normal.height,
        cellWidth: 16,
        cellHeight: 24,
        palette: [
            'transparent', 'white', 'black', 
            'navy', 'green', 'red', 'brown',
            'purple', 'olive', 'yellow', 'lime', 
            'teal', 'cyan', 'blue', 'fuchsia',
            'grey', 'lightgrey',
        ],
    }) 

    painter.painting = mooseToGrid(image)
    painter.color = 0 // remove dumb errors from dom
    painter.colour = 0
    painter.draw()
    painter.drawing = false
    painter.dom.toBlob(cb, 'image/png')
}

module.exports = function(state, emitter) {
    state.gallery = []

    state.query = {
        name: '',
        age: 'newest',
    }

    emitter.on('gallery-age', (value) => {
        state.query.age = value
        emitter.emit('gallery-get')
    })

    emitter.on('gallery-name', (value) => {
        state.query.name = value
        emitter.emit('gallery-get')
    })

    emitter.on('gallery-get', () => {
        getGalleryPage(
            state.query.age,
            state.query.name,
            0,
        (err, body) => {
            if (err) return
            if (!(body instanceof Array)) return
            state.gallery = []
            each(body, (moose, cb) => {
                generateGalleryMoose(moose.image, moose.hd, (blob) => {
                    state.gallery.push({
                        name: moose.name,
                        image: blob,
                    })               
                    cb()
                })
            }, () => {
                emitter.emit('render')
            })
        })
    })

    state.timeoutScroll = false 

    emitter.on('gallery-end-timeout', () => {
        state.timeoutScroll = false
    })

    emitter.on('gallery-bottom', () => {
        // no more meese to show
        if (state.gallery.length < galleryPageSize || state.gallery.length % galleryPageSize != 0) 
            return
        state.timeoutScroll = true
        getGalleryPage(
            state.query.age,
            state.query.name,
            Math.ceil(state.gallery.length / galleryPageSize),
        (err, body) => {
            if (err) return
            if (!(body instanceof Array)) return
            if (body == []) return
            each(body, (moose, cb) => {
                generateGalleryMoose(moose.image, (blob) => {
                    state.gallery.push({
                        name: moose.name,
                        image: blob,
                    })               
                    cb()
                })
            }, () => {
                emitter.emit('render')
                setTimeout(() => emitter.emit('gallery-end-timeout'), 300)
            })
        })

    })

    emitter.emit('gallery-get')

    emitter.on('DOMContentLoaded', () => {
        window.addEventListener('scroll', () => {
            if (state.timeoutScroll || window.location.hash != '#gallery') 
                return
            var scrollPos = (
                (document.documentElement.scrollTop 
                    + document.body.scrollTop) 
                / (document.documentElement.scrollHeight 
                    - document.documentElement.clientHeight) 
                * 100)
            if (scrollPos > 90)
                emitter.emit('gallery-bottom')
        })
    })
}

},{"../lib/api.js":62,"../lib/moose-grid.js":63,"../lib/moose-size.js":64,"async.each":2,"gridpaint":26}],67:[function(require,module,exports){
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

var GridPaint = require('gridpaint'),
    api = require('../lib/api.js'),
    mooseToGrid = require('../lib/moose-grid.js').mooseToGrid,
    gridToMoose = require('../lib/moose-grid.js').gridToMoose,
    sizeInfo = require('../lib/moose-size.js')

function getParameterByName(name) {
    var url = window.location.href
    name = name.replace(/[[]]/g, '\\$&')
    var regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

module.exports = function(state, emitter) {
    state.title = {
        msg: 'Make a Moose today',
        status: 'primary',
    }

    state.moose = {
        name: '',
        hd: false,
    }

    var newPainter = () => {
        state.painter = new GridPaint({
            width: 
                state.moose.hd ? 
                sizeInfo.hd.width :
                sizeInfo.normal.width, 
            height: 
                state.moose.hd ?
                sizeInfo.hd.height :
                sizeInfo.normal.height,
            cellWidth: 16,
            cellHeight: 24,
            palette: [
                'transparent', 'white', 'black', 
                'navy', 'green', 'red', 'brown',
                'purple', 'olive', 'yellow', 'lime', 
                'teal', 'cyan', 'blue', 'fuchsia',
                'grey', 'lightgrey',
            ],
        }) 
        state.painter.tool = 'pencil'
        state.painter.color = 1
        state.painter.colour = 'transparent'
        state.painter.grid = true
    }

    newPainter()
    state.tools = [ 
        'pencil', 
        'bucket', 
        'grid',
        'undo', 
        'redo', 
        'clear',
        'hd/sd-ify',
    ]

    emitter.on('color-select', (color) => {
        state.painter.colour = state.painter.palette.indexOf(color)
        emitter.emit('render')
    })

    emitter.on('tool-select', (action) => {
        if (action == 'pencil' || action == 'bucket') {
            state.painter.tool = action
        }
        else if (action == 'grid') {
            state.painter.grid = !state.painter.grid
        }
        else if (action == 'hd/sd-ify') {
            state.moose.hd = !state.moose.hd
            state.painter.destroy()
            if (state.painter.dom) {
                state.painter.dom
                    .parentNode
                    .removeChild(
                        state.painter.dom
                    )
            }
            newPainter()
            state.painter.init()
        }
        else {
            state.painter[action]()
        }
        emitter.emit('render')
    })

    emitter.on('moose-name-change', (name) => {
        state.moose.name = name
    })

    emitter.on('moose-save', () => {
        state.moose.image = gridToMoose(state.painter.painting)
        api.saveMoose(state.moose, (err, body) => {
            if (err || !body || body.status == 'error') {
                if (!body) body = { 
                    msg: err.toString() || 'unknown error',
                }
                if (typeof body.msg == 'object') 
                    body.msg = JSON.stringify(body.msg)
                state.title.msg = 
                    `failed to save moose: ${body.msg}`
                state.title.status = 'danger'
            }
            else {
                state.title.msg = body.msg
                state.title.status = 'success'
            }
             
            emitter.emit('render')
        })
    })

    emitter.on('moose-edit', (editmoose) => {
        state.moose.name = editmoose || ''
        state.title.msg = `editing ${editmoose}...`
        api.getMoose(editmoose, (err, body) => {
            if (!err && body && body.image) {
                state.painter.painting = 
                    mooseToGrid(body.image)
            }
            emitter.emit('render')
        })
    })

    emitter.on('pushState', () => {
        if (getParameterByName('edit')) 
            emitter.emit('moose-edit', getParameterByName('edit'))
    })

    state.painter.init()
    if (getParameterByName('edit')) 
        emitter.emit('moose-edit', getParameterByName('edit'))
}

},{"../lib/api.js":62,"../lib/moose-grid.js":63,"../lib/moose-size.js":64,"gridpaint":26}],68:[function(require,module,exports){
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

var html = require('choo/html')

module.exports = function(state, emit) {
    return html`
        <div>
        <div class="nav">
          <div class="nav-left">
            <a class="nav-item is-tab" href="#">
                <img src="neomoose.png" alt="NeoMoose Logo">
            </a>
            <a class="nav-item is-tab" href="#">Create</a>
            <a class=" nav-item is-active is-tab" href="#gallery">Gallery</a>
            <a data-no-routing 
                class=" nav-item is-tab" 
                href="/dump"
            >
                Database (JSON)
            </a>
          </div>
        </div>

        <div class="hero is-primary">
           <div class="hero-body">
               <div class="container">
                   <h1 class="title">NeoMoose</h1>
                   <h2 class="subtitle">Gallery Page</h2>
               </div>
           </div>
        </div>

        <div class="section">
            <div class="container">
                <div class="field has-addons">
                    <p class="control">
                        <button value="oldest" 
                                onclick=${queryAge} 
                                class="button ${state.query.age == 'oldest' ? 'is-info' : ''}"
                        >
                            oldest
                        </button>
                    </p>
                    <p class="control is-expanded">
                        <input 
                            type="text" 
                            class="input is-expanded"
                            value="${state.query.name}"
                            oninput=${queryName}
                        >
                    </p>
                    <p class="control">
                        <button value="newest" 
                                onclick=${queryAge} 
                                class="button ${state.query.age == 'newest' ? 'is-info' : ''}"
                        >
                            newest
                        </button>
                    </p>
                </div>
                <div class="columns is-multiline">
                    ${state.gallery.map(moose => {
                        return html`
                            <div class="column is-3">
                                <div class="box has-text-centered">
                                    <a href="#?edit=${moose.name}">
                                        <img src="${URL.createObjectURL(moose.image)}">
                                        <br>
                                        ${moose.name}
                                    </a>
                                </div>
                            </div>
                        `
                    })}
                </div>
            </div>
        </div>

        <div class="footer">
          <div class="container">
            <div class="content has-text-centered">
              <p>
                <strong>NeoMoose</strong> by <a href="https://dedominic.pw">Anthony DeDominic</a>.
              </p>
              <p>
                <a class="icon" href="https://github.com/adedomin/neomoose">
                    <img src="GitHub-Mark-120px-plus.png">
                </a>
              </p>
            </div>
          </div>
        </div>
        </div>
    `
    function queryAge(e) {
        emit('gallery-age', e.target.value)
    }

    function queryName(e) {
        emit('gallery-name', e.target.value) 
    }
}

},{"choo/html":17}],69:[function(require,module,exports){
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

var html = require('choo/html')

module.exports = function(state, emit) {
    return html`
        <div>
        <div class="nav">
          <div class="nav-left">
            <a class="nav-item is-tab" href="#">
                <img src="neomoose.png" alt="NeoMoose Logo">
            </a>
            <a class="nav-item is-active is-tab" href="#">Create</a>
            <a class=" nav-item is-tab" href="#gallery">Gallery</a>
            <a data-no-routing 
                class=" nav-item is-tab" 
                href="/dump"
            >
                Database (JSON)
            </a>
          </div>
        </div>

        <div class="hero is-${state.title.status}">
            <div class="hero-body">
                <div class="container">
                    <h1 class="title">NeoMoose</h1>
                    <h2 class="subtitle">${state.title.msg}</h2>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="container">

                <div class="columns is-centered">
                <div class="column has-text-centered is-half">
                    
                    ${state.painter.dom}
                    
                    <br>
                    <br>

                    <div class="field has-addons ">
                        <p class="control is-expanded">
                            <input 
                                type="text" 
                                class="input is-expanded"
                                value="${state.moose.name}"
                                oninput=${mooseName}
                            >
                        </p>
                        <p class="control">
                            <button 
                                onclick=${mooseSave} 
                                class="button is-primary"
                            >
                                Save
                            </button>
                        </p>
                    </div>

                    <div class="is-center has-shadow block moose-palette">
                        ${state.painter.palette.map(color => {
                            var extra = '', style = `background-color: ${color}`
                            if (color == 'transparent') {
                                extra += 'moose-palette-color-transparent'
                                style = 'background: transparent url(\'transparent.png\') repeat'
                            }
                            if (color == state.painter.palette[state.painter.colour])
                                extra += ' moose-palette-color-selected'
                            return html`<button 
                                onclick=${colorSelect}
                                class="moose-palette-color ${extra}"
                                style="${style}">
                            </button>`
                        })}
                        <br>
                        <br>
                        ${state.tools.map(tool => {
                            var extra = ''
                            if (tool == state.painter.tool)
                                extra += ' is-info'
                            return html`<button 
                                onclick=${toolSelect}
                                class="button ${extra}"
                            >
                                ${tool}
                            </button>`
                        })}
                    </div>

                </div>
                </div>
            </div>
        </div>

        <div class="footer">
          <div class="container">
            <div class="content has-text-centered">
              <p>
                <strong>NeoMoose</strong> by <a href="https://dedominic.pw">Anthony DeDominic</a>.
              </p>
              <p>
                <a class="icon" href="https://github.com/adedomin/neomoose">
                    <img src="GitHub-Mark-120px-plus.png">
                </a>
              </p>
            </div>
          </div>
        </div>
        </div>
    `

    function mooseName(e) {
        emit('moose-name-change', e.target.value)
    }

    function mooseSave() {
        emit('moose-save')
    }

    function colorSelect(e) {
        emit('color-select', e.target.style['background-color'])
    }

    function toolSelect(e) {
        emit('tool-select', e.target.innerText)
    }
}

},{"choo/html":17}]},{},[61]);
