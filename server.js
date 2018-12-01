// 'use strict'
const Docker = require('dockerode')
let docker = new Docker({socketPath: '/var/run/docker.sock'})

const execFileSync = require('child_process').execFileSync

const DOMAIN = 'spacecraft-repl.com'
const PORT   = 3000
let sessions = {}
//   [`a.${DOMAIN}`]: `172.17.0.2:${PORT}`,
//   [`b.${DOMAIN}`]: `172.17.0.3:${PORT}`
// }

const proxy = require('redbird')({
  port: 80,
  resolvers: [
    function(host, url, request) {
      // console.log(`host is ${host} and url is ${url}`);
      // if(host === 'localhost') {
      if(host === 'spacecraft-repl.com' && url === '/') {
        let sessionId = Math.floor(Math.random() * 1000)
        let containerNetwork = execFileSync('./dockerscript.sh')
        docker.createContainer({
          Image: 'proxy-fix',
          Tty: false,
          ExposedPorts: { "3000/tcp": {} },
          HostConfig: {
            Runtime: 'runsc',
            Memory: 100000000,
            CpuPeriod: 100000,
            CpuQuota:   20000,
          }
        }, function (err, container) {
          container.start(function (err, data) {
            container.inspect(container.id).then(data => {
              const IPAddress = data.NetworkSettings.IPAddress
              console.log(IPAddress)
              sessions[sessionId] = IPAddress
              proxy.register(`${sessionId}.${DOMAIN}`, `${IPAddress}:${PORT}`)
            })
          })
        })
        // console.log(containerNetwork + '')
        
        // console.log(`sessionId is ${sessionId}`)
      }
    }
  ]
})

// let sessions = [
//   {
//     src:    `a.${DOMAIN}`,
//     target: `172.17.0.2:${PORT}`,
//   },
//   {
//     src:    `b.${DOMAIN}`,
//     target: `172.17.0.3:${PORT}`,
//   },
// ]


// const registerSessionRoute = ({src, target}) => {
//   proxy.register(src, target)
// }

// Object.entries(sessions).forEach( ([src, target]) => {
//   proxy.register(src, target)
// })

