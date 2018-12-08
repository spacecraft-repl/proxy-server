const httpProxy = require('http-proxy')
const http = require('http')
const uuidv4 = require('uuid/v4')
const Docker = require('dockerode')
let docker = new Docker({ socketPath: '/var/run/docker.sock' })

const containerOpts = {
  Image: 'signal-teardown-delete',
  Tty: false,
  ExposedPorts: { "3000/tcp": {} },
  HostConfig: {
    Runtime: 'runsc',
    Memory: 100000000,
    CpuPeriod: 100000,
    CpuQuota:   20000,
  }
}
const ROOT = 'spacecraft-repl.com'
const PORT = 3000
let sessions = {}
let isPendingStart = false

const proxy = httpProxy.createProxyServer({
  ws: true,
  followRedirects: true,
});

const proxyServer = http.createServer(async (req, res) => {
  if (req.method === 'DELETE') {
    const containerId = sessions[req.headers.host].containerId
    docker.getContainer(containerId).remove({ force: true })
    delete sessions[req.headers.host]
    res.writeHead(202)
    return res.end('DELETED')
  }

  if (req.headers.host === ROOT) {
    if (isPendingStart) {
      res.writeHead(429)
      return res.end()
    }

    let sessionId = uuidv4().slice(0, 6)

    await new Promise((resolve, reject) => {

      docker.createContainer(containerOpts, (err, container) => {
        isPendingStart = true

        container.start((err, data) => {

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
              isPendingStart = false
              
              const fetch = require('node-fetch')
              fetch(containerURL, { 
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionURL })
              })
              resolve()
            }, 3000)
          })

        })

      })

    })

    res.writeHead(301, {
      'Location': `http://${sessionId}.${ROOT}`,
      'Cache-Control': 'no-cache'
    })
    return res.end()
  }

  if (!sessions[req.headers.host]) {
    res.writeHead(404)
    return res.end()
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

proxyServer.listen(80);

function log_error(e,req){
  if(e){
    console.error(e.message);
    console.log(req.headers.host,'-->', sessions[req.headers.host].ip);
    console.log('-----');
  }
}
