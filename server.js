// 'use strict'

const proxy = require('redbird')({
  port: 80,
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