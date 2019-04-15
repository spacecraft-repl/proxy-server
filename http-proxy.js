const httpProxy = require('http-proxy')
const fs = require('fs')
const https = require('https')
const http = require('http')
const uuidv4 = require('uuid/v4')
const Docker = require('dockerode')
let docker = new Docker({ socketPath: '/var/run/docker.sock' })

const containerOpts = {
  Image: 'production-12-14',
  Tty: false,
  ExposedPorts: { "3000/tcp": {} },
  HostConfig: {
    Runtime: 'runsc',
    Memory: 50000000,
    CpuPeriod: 100000,
    CpuQuota:   20000,
  }
}
const ROOT = 'repl.space'
const PORT = 3000
let sessions = {}
// let isPendingStart = false

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/repl.space-0001/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/repl.space-0001/fullchain.pem'),
};

const proxy = httpProxy.createProxyServer({
  secure: true,
  ws: true,
  followRedirects: true,
});

const proxyServer = https.createServer(options, async (req, res) => {
  if (req.method === 'DELETE') {
    console.log(sessions, req.headers)
    const containerId = sessions[req.headers.host].containerId
    docker.getContainer(containerId).remove({ force: true })
    delete sessions[req.headers.host]
    res.writeHead(202)
    return res.end('DELETED')
  }

  if (req.headers.host !== ROOT && !sessions[req.headers.host]) {
    res.writeHead(404)
    return res.end()
  }

  if (req.headers.host === ROOT) {
    // if (isPendingStart) {
    //   res.writeHead(429)
    //   return res.end()
    // }

    let sessionId = uuidv4().slice(0, 6)

    const template = require('fs').readFileSync(__dirname + '/assets/redirect.html', { encoding: 'utf-8' })
    const html = template.replace('${}', `https://${sessionId}.${ROOT}`)
    res.setHeader('content-type', 'text/html')
    res.end(html)

    docker.createContainer(containerOpts, (err, container) => {
      // isPendingStart = true

      container.start((err, data) => {
        if (err) console.log(err);

        container.inspect(container.id).then(data => {
          const IPAddress = data.NetworkSettings.IPAddress
          const containerURL = `http://${IPAddress}:${PORT}`
          const sessionURL = sessionId + '.' + ROOT

          sessions[sessionURL] = {
            ip: containerURL,
            containerId: container.id
          }

					console.log(container.id)

          setTimeout(() => {
            // isPendingStart = false
            const fetch = require('node-fetch')
            fetch(containerURL + '/session', {
              method: 'POST',
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionURL })
            })
          }, 5000)
        })
      })
    })
    return
    // res.writeHead(301, {
    //   'Location': `https://${sessionId}.${ROOT}`,
    //   'Cache-Control': 'no-cache'
    // })
  }

  proxy.web(
    req,
    res,
    { target: sessions[req.headers.host].ip },
    (e) => log_error(e, req)
  );
});

proxyServer.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head, { target: sessions[req.headers.host].ip });
});

docker.listContainers((err, containers) => {
  containers.forEach((containerInfo) => {
    docker.getContainer(containerInfo.Id).remove({ force: true })
  });
});

proxyServer.listen(443);

http.createServer((req, res) => {
  // enable http deletes
  if (req.method === 'DELETE') {
    console.log(sessions, req.headers)
    const containerId = sessions[req.headers.host].containerId
    docker.getContainer(containerId).remove({ force: true })
    delete sessions[req.headers.host]
    
    res.writeHead(202)
    return res.end('DELETED')
  }

  res.writeHead(301, { 'Location': 'https://' + req.headers.host })
  res.end()
}).listen(80)

function log_error(e,req){
  if(e){
    console.error(e.message);
    console.log(req.headers.host,'-->', sessions[req.headers.host].ip);
    console.log('-----');
  }
}
