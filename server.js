// 'use strict'
const Docker = require('dockerode')
// let docker1 = new Docker({ host: 'http://174.138.50.119', port: 80 })

const proxy = require('redbird')({
  port: 80,
  resolvers: [
    function(host, url, request) {
      // console.log(`host is ${host} and url is ${url}`);
      if(host === 'spacecraft-repl.com' && url === '/') {
        console.log(`Random number ${Math.random()}`)
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