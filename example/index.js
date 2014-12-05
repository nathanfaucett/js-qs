global.qs = require("../src/index.js");


var object = {
    object: {
        array: [0, 1, 2, 3, 4]
    },
    array: {
        object: {
            person: {
                name: "bob"
            }
        }
    }
};

qs.parse(qs.stringify(object));

global.test = function test() {
    var str;

    console.time("stringify");
    str = qs.stringify(object);
    console.timeEnd("stringify");

    console.time("parse");
    qs.parse(str);
    console.timeEnd("parse");
};

process.nextTick(test);
