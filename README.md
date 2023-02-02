# remix-basic-express-with-ssl-v2-dev

## Setup
- Basic remix app created using 'just the basics' and 'express'. 
- Added self-signed certificate files `cert\key.pem` and `cert\cert.pem`  
- Only change to `server.js` is using `https - createServer()` to start express server with ssl options
- Personally ran app on port `4242` so use `PORT=4242 npm run dev` to start up

## Issues
- The client side websocket will not connect over `wss:` protocal
- The `future: { unstable_dev: { port } }` option does not seem to be used, a random port is always chosen

## Error: