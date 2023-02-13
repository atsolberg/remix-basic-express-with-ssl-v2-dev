const path = require("path");
const express = require("express");
const compression = require("compression");
const morgan = require("morgan");
const { createRequestHandler } = require("@remix-run/express");
const { createServer } = require('https');
const { readFileSync } = require('fs');
const WebSocket = require('ws');

const BUILD_DIR = path.join(process.cwd(), "build");
const { NODE_ENV } = process.env;

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

// ============================================================================
// DEV SERVER (Live Reload)
// @see https://github.com/remix-run/remix/issues/2859#issuecomment-1277467440

if (NODE_ENV !== 'production') {
  const connectToRemixSocket = (cb, attempts = 0) => {
    const remixSocket = new WebSocket(`ws://127.0.0.1:8002`);

    remixSocket.once('open', () => {
      console.log('Connected to remix dev socket');
      cb(null, remixSocket);
    });

    remixSocket.once('error', (error) => {
      if (attempts < 3) {
        setTimeout(() => connectToRemixSocket(cb, (attempts += 1)), 1000);
      } else {
        cb(error, null);
      }
    });
  };

  connectToRemixSocket((error, remixSocket) => {
    if (error) throw error;

    const customSocket = new WebSocket.Server({ server });
    remixSocket.on('message', (message) => {
      const msg = message.toString();
      customSocket.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(msg);
        }
      });
    });
  });
}
// END DEV SEVER (Live Reload)
// ============================================================================

server.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
/** END - SERVER WITH SS ---------------------------------- */
