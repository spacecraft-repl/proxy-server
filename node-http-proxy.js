var httpProxy = require('http-proxy')
var express = require('express')
var app = express()
var http = require('http')

var proxy = new httpProxy.createProxyServer({
  target: 'http://spacecraft-repl.com:4000',
  ws: true,
});

var proxyServer = http.createServer(function (req, res) {
  if (req.url === '/first') proxy.web(req, res);
});

// Listen to the `upgrade` event and proxy the
// WebSocket requests as well.
proxyServer.on('upgrade', function (req, socket, head) {
  proxy.ws(req, socket, head);
});

proxyServer.listen(3000);