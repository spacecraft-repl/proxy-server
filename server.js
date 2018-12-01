// 'use strict'
const Docker = require('dockerode')
let docker = new Docker({socketPath: '/var/run/docker.sock'})

const DOMAIN = 'spacecraft-repl.com'
const PORT   = 3000
let sessions = {}

const proxy = require('redbird')({
  port: 80,
  resolvers: [
    function(host, url, request) {
      
      if(host === 'spacecraft-repl.com' && url === '/') {
        let sessionId = Math.floor(Math.random() * 1000)

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
              sessions[sessionId] = IPAddress
              proxy.register(`${sessionId}.${DOMAIN}`, `${IPAddress}:${PORT}`)
            })
          })
        })
      }
    }
  ]
})

console.log(proxy)

