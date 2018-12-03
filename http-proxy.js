const httpProxy = require('http-proxy')
const http = require('http')
const Docker = require('dockerode')
let docker = new Docker({ socketPath: '/var/run/docker.sock' })

const containerOpts = {
  Image: 'non-root',
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

const proxy = httpProxy.createProxyServer({
  ws: true,
  followRedirects: true,
});

const proxyServer = http.createServer(async (req, res) => {
  if (req.headers.host === ROOT) {
    let sessionId = Math.floor(Math.random() * 1000)

    await new Promise((resolve, reject) => {

      docker.createContainer(containerOpts, (err, container) => {

        container.start((err, data) => {

          container.inspect(container.id).then(data => {
            const IPAddress = data.NetworkSettings.IPAddress
            sessions[sessionId + '.' + ROOT] = `http://${IPAddress}:${PORT}`
            setTimeout(() => resolve(), 3000)
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

  proxy.web(req, res, { target: sessions[req.headers.host] },
    (e) => log_error(e, req)
  );
});

proxyServer.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head, { target: sessions[req.headers.host] });
});

docker.listContainers((err, containers) => {
  containers.forEach((containerInfo) => {
    docker.getContainer(containerInfo.Id).kill(() => console.log(containerInfo.Id));
  });
});

proxyServer.listen(80);

function log_error(e,req){
  if(e){
    console.error(e.message);
    console.log(req.headers.host,'-->', sessions[req.headers.host]);
    console.log('-----');
  }
}
