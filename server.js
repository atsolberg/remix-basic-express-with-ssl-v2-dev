const path = require("path");
const express = require("express");
const compression = require("compression");
const morgan = require("morgan");
const { createRequestHandler } = require("@remix-run/express");
const { createServer } = require('https');
const { readFileSync } = require('fs');

const BUILD_DIR = path.join(process.cwd(), "build");

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Remix fingerprints its assets so we can cache forever.
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" })
);

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1h" }));

app.use(morgan("tiny"));

app.all(
  "*",
  process.env.NODE_ENV === "development"
    ? (req, res, next) => {
        purgeRequireCache();

        return createRequestHandler({
          build: require(BUILD_DIR),
          mode: process.env.NODE_ENV,
        })(req, res, next);
      }
    : createRequestHandler({
        build: require(BUILD_DIR),
        mode: process.env.NODE_ENV,
      })
);
const port = process.env.PORT || 3000;

/** NORMAL SERVER ----------------------------------------- */
// app.listen(port, () => {
//   console.log(`Express server listening on port ${port}`);
// });
/** END - NORMAL SERVER ----------------------------------- */

/** SERVER WITH SSL --------------------------------------- */
// Attempt to find a certificate to use for ssl
// Check `CERT_DIR` environment variable for the path first,
// then fallback to the project directory.
const CERT_DIR = process.env.CERT_DIR || `${process.cwd()}/cert`;
let httpsOptions = {};
try {
  httpsOptions = {
    key: readFileSync(`${CERT_DIR}/key.pem`),
    cert: readFileSync(`${CERT_DIR}/cert.pem`),
  };

  console.log('Using Certificate -');
  console.log(`  key: `, `${CERT_DIR}/key.pem`);
  console.log(`  cert: `, `${CERT_DIR}/cert.pem`);
} catch (err) {
  httpsOptions = {};
  console.error('Error reading certificate files, skipping for now', err);
}
const server = createServer(httpsOptions, app);

server.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
/** END - SERVER WITH SS ---------------------------------- */

function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't let
  // you have in-memory objects between requests in development,
  // alternatively you can set up nodemon/pm2-dev to restart the server on
  // file changes, but then you'll have to reconnect to databases/etc on each
  // change. We prefer the DX of this, so we've included it for you by default
  for (const key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      delete require.cache[key];
    }
  }
}
