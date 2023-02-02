# remix-basic-express-with-ssl-v2-dev

## Setup
- Basic remix app created using 'just the basics' and 'express'. 
- Added self-signed certificate files `cert\key.pem` and `cert\cert.pem`  
- Only change to `server.js` is using `https - createServer()` to start express server with ssl options

## Startup
- Personally ran app on port `4242` so use `PORT=4242 npm run dev` to start up
- Start chrome with some flags to ignore issues with self-signed certificates:
  ```
  /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --user-data-dir=/tmp/foo --ignore-certificate-errors --ignore-ssl-errors --unsafely-treat-insecure-origin-as-secure=https://localhost:4242
  ```
- Then visit `https://localhost:4242`

---

**NOTE:** I use `localremix` instead of `localhost` by adding `127.0.0.1 localremix` to my `etc/hosts` file, and the self-signed certificate files in this repo were created referencing `localremix` as the common name (CN).  You might want to use your own certificate files or you can use `https://localremix:4242` by added `127.0.0.1 localremix` to your `etc/hosts` file like I did.  You can supply the directory path to your cert files using the `CERT_DIR` env var at startup: `CERT_DIR=Users/bob/my-certs PORT=4242 npm run dev`.   `server.js` expects the cert file names to be `key.pem` and `cert.pem`.

---

## Issues
- The client side websocket will not connect over `wss:` protocal
- The `future: { unstable_dev: { port } }` option does not seem to be used, a random port is always chosen

### Client Side Error

![image](https://user-images.githubusercontent.com/2157412/216356439-4e2d1e1f-bf01-4594-b8cf-314f4a716743.png)

### Chrome App Error
```
[72201:19971:0202/093415.517540:ERROR:ssl_client_socket_impl.cc(985)] handshake failed; returned -1, SSL error code 1, net_error -107
```
