import { Buffer } from "buffer";

// Webpack v5 does not add polyfills any more by default as stated: 
// https://webpack.js.org/configuration/resolve/#resolvefallback

window.Buffer = Buffer;