qs
=======

querystring parse/stringify for the browser and node.js

```javascript
var qs = require("@nathanfaucett/qs");


qs.parse("key=value&keys[0]=0&keys[1]=1&keys[2]=2") === {
    key: "value",
    keys: [0, 1, 2]
};
decodeURIComponent(qs.stringify({
    key: "value",
    keys: [0, 1, 2]
})), === "key=value&keys[0]=0&keys[1]=1&keys[2]=2";
```
