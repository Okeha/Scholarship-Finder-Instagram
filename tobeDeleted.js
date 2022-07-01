var Instagram = require("instagram-tagscrap-filecache");
var ig = new Instagram({
  cache: {
    prefix: "ig-",
    isIgnore: false,
    ttl: 60 * 30, // 30 min
    tmpDir: null,
  },
});

ig.scrapeTagPage("theboys")
  .then(function (result) {
    console.dir(result.total);
  })
  .catch((err) => {
    console.error(err);
  });
