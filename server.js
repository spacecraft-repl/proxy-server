// 'use strict'
// const Docker = require('dockerode')
// let docker = new Docker({socketPath: '/var/run/docker.sock'})
const shell = require('shelljs')

const proxy = require('redbird')({
  port: 80,
  resolvers: [
    function(host, url, request) {
      // console.log(`host is ${host} and url is ${url}`);
      if(host === 'spacecraft-repl.com' && url === '/') {
        let sessionId = Math.floor(Math.random() * 1000)
        shell.exec('./dockerscript.sh')
        // docker.run('proxy-fix', ['--memory=100m', '-it', '--cpus=".2"','--runtime=runsc', '--expose=3000', '-d'], process.stdout, function (err, data, container) {
        //   // console.log(`data.StatusCode is ${data.StatusCode}}`)
        //   console.log(`data is ${data}`)
        //   console.log(`err is ${err}`)
        // });
        console.log(`sessionId is ${sessionId}`)
      }
    }
  ]
})

const DOMAIN = 'spacecraft-repl.com'
const PORT   = 3000

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

let sessions = {
  [`a.${DOMAIN}`]: `172.17.0.2:${PORT}`,
  [`b.${DOMAIN}`]: `172.17.0.3:${PORT}`
}

const registerSessionRoute = ({src, target}) => {
  proxy.register(src, target)
}

Object.entries(sessions).forEach( ([src, target]) => {
  proxy.register(src, target)
})