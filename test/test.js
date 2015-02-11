var assert = require("assert"),
    qs = require("../src/index");


describe("qs", function() {
    describe("#parse(string)", function() {
        it("should parse string into object", function() {
            assert.deepEqual(
                qs.parse("key=value&keys[0]=0&keys[1]=1&keys[2]=2"), {
                    key: "value",
                    keys: [0, 1, 2]
                }
            );
        });
    });
    describe("#stringify(object)", function() {
        it("should stringify object into string", function() {
            assert.equal(
                decodeURIComponent(qs.stringify({
                    key: "value",
                    keys: [0, 1, 2]
                })),
                "key=value&keys[0]=0&keys[1]=1&keys[2]=2"
            );
        });
    });
});
