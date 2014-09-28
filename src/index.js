var utils = require("utils"),
    type = require("type");


var qs = module.exports,
    hasOwnProp = Object.prototype.hasOwnProperty;


function stringify(obj, prefix) {
    var key, values = [];

    Buffer.isBuffer(obj) ? obj = obj.toString() : obj instanceof Date ? obj = obj.toISOString() : null === obj && (obj = "");

    if (
        typeof(obj) === "string" ||
        typeof(obj) === "number" ||
        typeof(obj) === "boolean"
    ) {
        return [encodeURIComponent(prefix) + "=" + encodeURIComponent(obj)];
    }

    for (key in obj) {
        if (hasOwnProp.call(obj, key)) {
            (values = values.concat(stringify(obj[key], prefix + "[" + key + "]")));
        }
    }

    return values;
}

qs.stringify = function(obj, options) {
    var delimiter, key, keys = [];

    options || (options = {});
    delimiter = typeof(options.delimiter) === "undefined" ? "&" : options.delimiter;

    for (key in obj) {
        if (hasOwnProp.call(obj, key)) {
            (keys = keys.concat(stringify(obj[key], key)));
        }
    }

    return keys.join(delimiter);
};

var decode_regex = /\+/g;

function decode(str) {
    var value, num;

    try {
        value = decodeURIComponent(str.replace(decode_regex, " "));
        num = +value;
        return num !== num ? value : num;
    } catch (e) {
        return str;
    }
}

function parseValues(str, options) {
    var obj = {},
        parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit),
        i, il, part, pos, key, val;

    for (i = 0, il = parts.length; il > i; ++i) {
        part = parts[i];
        pos = -1 === part.indexOf("]=") ? part.indexOf("=") : part.indexOf("]=") + 1;

        if (-1 === pos) {
            obj[decode(part)] = "";
        } else {
            key = decode(part.slice(0, pos));
            val = decode(part.slice(pos + 1));
            obj[key] = obj.hasOwnProp(key) ? [].concat(obj[key]).concat(val) : val;
        }
    }

    return obj;
}

function parseObject(chain, val, options) {
    var root, obj, cleanRoot, index;

    if (!chain.length) return val;

    root = chain.shift();
    obj = {};

    if (root === "[]") {
        obj = [];
        obj = obj.concat(parseObject(chain, val, options));
    } else {
        cleanRoot = "[" === root[0] && "]" === root[root.length - 1] ? root.slice(1, root.length - 1) : root;
        index = parseInt(cleanRoot, 10);
        if (!isNaN(index) && root !== cleanRoot && index <= options.arrayLimit) {
            obj = [];
            obj[index] = parseObject(chain, val, options);
        } else {
            obj[cleanRoot] = parseObject(chain, val, options);
        }
    }

    return obj;
}

var parseKeys_parent = /^([^\[\]]*)/,
    parseKeys_child = /(\[[^\[\]]*\])/g;

function parseKeys(key, val, options) {
    var parent = parseKeys_parent,
        child = parseKeys_child,
        segment, keys, i;

    if (!key) return void 0;

    segment = parent.exec(key);

    if (hasOwnProp.call(segment[1])) {
        return void 0;
    }

    keys = [];
    segment[1] && keys.push(segment[1]);

    i = 0;
    while (null !== (segment = child.exec(key)) && i < options.depth) {
        hasOwnProp.call(segment[1].replace(/\[|\]/g, "")) || keys.push(segment[1]);
        i++;
    }

    segment && keys.push("[" + key.slice(segment.index) + "]");

    return parseObject(keys, val, options);
}

function compact(obj, refs) {
    var lookup, compacted, i, il, length, keys, key;

    if (typeof(obj) !== "object" || obj === null) {
        return obj;
    }

    refs = refs || [];
    lookup = refs.indexOf(obj);

    if (lookup !== -1) {
        return refs[lookup];
    }

    refs.push(obj);

    if (type.isArray(obj)) {
        compacted = [];

        for (i = 0, length = obj.length; i < length; ++i) {
            if (typeof(obj[i]) !== "undefined") {
                compacted.push(obj[i]);
            }
        }

        return compacted;
    }

    keys = utils.keys(obj);

    for (i = 0, il = keys.length; i < il; i++) {
        key = keys[i];
        obj[key] = compact(obj[key], refs);
    }

    return obj;
}

function arrayToObject(source) {
    var obj = {},
        i = 0,
        il = source.length;

    for (; i < il; ++i) {
        if (typeof(source[i]) !== "undefined") {
            obj[i] = source[i];
        }
    }

    return obj;
}

function merge(target, source) {
    var keys, i, il, k, kl, key, value;

    if (!source) {
        return target;
    }

    if (type.isArray(source)) {
        for (i = 0, il = source.length; i < il; i++) {
            if (typeof(source[i]) !== "undefined") {
                if (typeof(target[i]) === "object") {
                    target[i] = merge(target[i], source[i]);
                } else {
                    target[i] = source[i];
                }
            }
        }

        return target;
    }

    if (type.isArray(target)) {
        if (typeof(source) !== "object") {
            target.push(source);
            return target;
        } else {
            target = arrayToObject(target);
        }
    }

    keys = Object.keys(source);
    for (k = 0, kl = keys.length; k < kl; k++) {
        key = keys[k];
        value = source[key];

        if (value && typeof(value) === "object") {
            if (!target[key]) {
                target[key] = value;
            } else {
                target[key] = merge(target[key], value);
            }
        } else {
            target[key] = value;
        }
    }

    return target;
}

qs.parse = function(str, options) {
    var obj = {},
        tempObj, keys, i, il, key, newObj;

    if ("" === str || null === str || typeof(str) === "undefined") return {};

    options || (options = {});
    options.delimiter = typeof(options.delimiter) === "string" || (options.delimiter instanceof RegExp) ? options.delimiter : "&";
    options.depth = typeof(options.depth) === "number" ? options.depth : 5;
    options.arrayLimit = typeof(options.arrayLimit) === "number" ? options.arrayLimit : 20;
    options.parameterLimit = typeof(options.parameterLimit) === "number" ? options.parameterLimit : 1e3;

    tempObj = typeof(str) === "string" ? parseValues(str, options) : str;
    obj = {};

    keys = utils.keys(tempObj);

    for (i = 0, il = keys.length; i < il; i++) {
        key = keys[i];
        newObj = parseKeys(key, tempObj[key], options);
        obj = merge(obj, newObj);
    }

    return compact(obj);
};
