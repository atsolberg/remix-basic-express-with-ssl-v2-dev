/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  devServerPort: 8002,

  future: {
    unstable_dev: {
      // Port to use for the dev server (i.e. the <LiveReload> websocket)
      // This can be overridden by a CLI flag: `remix dev --port 3011`
      // By default, we will find an empty port and use that
      port: 8002,

      // Port for running your Remix app server
      // This can be overridden by a CLI flag: `remix dev --app-server-port 3021`
      // default: `3000`
      appServerPort: 4242,
    },
  }
};
