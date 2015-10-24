var tape = require("tape"),
    qs = require("..");


tape("qs#parse(string)", function(assert) {
    assert.deepEqual(
        qs.parse("key=value&keys[0]=0&keys[1]=1&keys[2]=2"), {
            key: "value",
            keys: [0, 1, 2]
        },
        "should parse string into object"
    );
    assert.end();
});

tape("qs#stringify(object)", function(assert) {
    assert.equal(
        decodeURIComponent(qs.stringify({
            key: "value",
            keys: [0, 1, 2]
        })),
        "key=value&keys[0]=0&keys[1]=1&keys[2]=2",
        "should stringify object into string"
    );
    assert.end();
});
